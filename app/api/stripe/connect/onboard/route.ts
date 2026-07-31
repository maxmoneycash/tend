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
 * Creates a connected account with controller properties (platform pays
 * Stripe fees and owns losses — the destination-charge configuration) and
 * returns a hosted onboarding link. The operator pastes the printed env line
 * into .env.local; checkout picks it up via getTribeAccount().
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
    const account = await stripe.accounts.create({
      country: "US",
      email: undefined,
      business_type: "non_profit",
      // Controller properties (not top-level `type`): the platform pays
      // Stripe fees and owns payment losses — the destination-charge shape.
      controller: {
        fees: { payer: "application" },
        losses: { payments: "application" },
        stripe_dashboard: { type: "express" },
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: tribe.name,
        url: tribe.siteUrl,
        mcc: "8398",
        product_description: "Voluntary land tax contributions",
      },
      metadata: { source: "tend", tend_tribe: tribeId },
    });
    accountId = account.id;
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${origin}/onboarding/setup?connect=refresh&tribe=${tribeId}`,
    return_url: `${origin}/onboarding/setup?connect=done&tribe=${tribeId}`,
  });

  return NextResponse.json({
    accountId,
    onboardingUrl: link.url,
    envLine: `${tribes[tribeId].accountEnv}=${accountId}`,
    note: "Paste envLine into .env.local so checkout routes charges to this account.",
  });
}
