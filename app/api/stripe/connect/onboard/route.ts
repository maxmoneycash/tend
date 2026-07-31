import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessTribe } from "@/lib/access";
import { auth0 } from "@/lib/auth0";
import { destinationChargesEnabled, stripeTestMode } from "@/lib/connect";
import { getStripe } from "@/lib/stripe";
import { getTribe, getTribeAccount, tribes, type TribeId } from "@/lib/tribes";

export const runtime = "nodejs";

const Body = z.object({
  tribeId: z.enum(["ramaytush", "muwekma"]),
});

function requestOrigin(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? req.headers.get("host");
  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  if (host) return `${forwardedProto ?? new URL(req.url).protocol.slice(0, -1)}://${host}`;
  return new URL(req.url).origin;
}

/** Feature-flag status, so ops can verify config without creating anything. */
export async function GET() {
  return NextResponse.json({
    destinationCharges: destinationChargesEnabled(),
    testMode: stripeTestMode(),
  });
}

/**
 * Stripe Connect account-onboarding stub (destination-charge scaffolding).
 *
 * Gated three ways:
 *  - TEND_CONNECT_DESTINATION_CHARGES=1 (default off)
 *  - test-mode Stripe key only — refuses live keys
 *  - signed-in tribe admin (canAccessTribe), unless TEND_DEMO_AUTH_BYPASS=1
 *
 * Creates an Accounts v2 recipient with an Express dashboard (the platform
 * pays fees and owns losses for destination charges) and returns a
 * Stripe-hosted onboarding link. The operator pastes the printed env line into
 * .env.local; checkout picks it up via getTribeAccount().
 */
export async function POST(req: Request) {
  if (!destinationChargesEnabled()) {
    return NextResponse.json(
      { error: "Destination charges are not enabled (TEND_CONNECT_DESTINATION_CHARGES)." },
      { status: 503 },
    );
  }
  if (!stripeTestMode()) {
    return NextResponse.json(
      { error: "Connect onboarding scaffold runs in Stripe test mode only." },
      { status: 403 },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tribe" }, { status: 400 });
  }
  const tribeId = parsed.data.tribeId as TribeId;

  if (process.env.TEND_DEMO_AUTH_BYPASS !== "1") {
    const session = await auth0.getSession();
    if (!session || !canAccessTribe(session.user, tribeId)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  const tribe = getTribe(tribeId)!;
  const stripe = getStripe();
  const origin = requestOrigin(req);

  // Reuse an already-provisioned account instead of minting duplicates.
  let accountId = getTribeAccount(tribeId);
  if (!accountId) {
    const account = await stripe.v2.core.accounts.create({
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { requested: true },
            },
          },
        },
      },
      dashboard: "express",
      defaults: {
        currency: "usd",
        profile: {
          business_url: tribe.siteUrl,
          doing_business_as: tribe.name,
          product_description: "Voluntary land tax contributions",
        },
        responsibilities: {
          fees_collector: "application",
          losses_collector: "application",
        },
      },
      display_name: tribe.name,
      identity: {
        country: "US",
        entity_type: "non_profit",
        business_details: {
          registered_name: tribe.name,
        },
      },
      include: ["configuration.recipient"],
      metadata: { source: "tend", tend_tribe: tribeId },
    });
    accountId = account.id;
  }

  const link = await stripe.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["recipient"],
        collection_options: {
          fields: "eventually_due",
          future_requirements: "include",
        },
        refresh_url: `${origin}/onboarding/setup?connect=refresh&tribe=${tribeId}`,
        return_url: `${origin}/onboarding/setup?connect=done&tribe=${tribeId}`,
      },
    },
  });

  return NextResponse.json({
    accountId,
    onboardingUrl: link.url,
    envLine: `${tribes[tribeId].accountEnv}=${accountId}`,
    note: "Paste envLine into .env.local. Checkout will enable destination charges after Stripe activates the recipient transfer capability.",
  });
}
