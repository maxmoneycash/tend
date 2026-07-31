import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { auth0 } from "@/lib/auth0";
import {
  assertDestinationAccountReady,
  ConnectConfigurationError,
  destinationChargeAccount,
  destinationChargeData,
} from "@/lib/connect";
import { demoMode } from "@/lib/demo";
import { getStripe } from "@/lib/stripe";
import {
  DEFAULT_STREAM_DURATION_SECONDS,
  DEFAULT_STREAM_INTERVAL_SECONDS,
  isStreamDurationSeconds,
  isStreamIntervalSeconds,
} from "@/lib/stream-plan";
import { getTribe, getTribeAccount, type TribeId } from "@/lib/tribes";

const Body = z.object({
  tribeId: z.enum(["ramaytush", "muwekma"]),
  amountCents: z.number().int().min(100).max(1_000_000),
  interval: z.enum(["once", "month", "year"]),
  streamDurationSeconds: z
    .number()
    .int()
    .refine(isStreamDurationSeconds)
    .default(DEFAULT_STREAM_DURATION_SECONDS),
  streamIntervalSeconds: z
    .number()
    .int()
    .refine(isStreamIntervalSeconds)
    .default(DEFAULT_STREAM_INTERVAL_SECONDS),
  returnTo: z
    .string()
    .regex(/^\/(?!\/)/)
    .max(200)
    .optional(),
  loginReturnTo: z
    .string()
    .regex(/^\/(?!\/)/)
    .max(400)
    .optional(),
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

function integrationIdentifier() {
  const suffix = Array.from(randomBytes(8), (byte) =>
    String.fromCharCode(97 + (byte % 26)),
  ).join("");
  return `tend_checkout_${suffix}`;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pledge" }, { status: 400 });
  }
  const {
    tribeId,
    amountCents,
    interval,
    streamDurationSeconds,
    streamIntervalSeconds,
    returnTo = "/pledge",
    loginReturnTo = returnTo,
  } = parsed.data;
  if (process.env.TEND_DEMO_AUTH_BYPASS !== "1") {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json(
        {
          error: "Sign in before continuing to Stripe.",
          loginUrl: `/auth/login?returnTo=${encodeURIComponent(loginReturnTo)}`,
        },
        { status: 401 },
      );
    }
  }

  const tribe = getTribe(tribeId)!;
  const account = getTribeAccount(tribeId as TribeId);
  const origin = requestOrigin(req);

  if (demoMode()) {
    return NextResponse.json({
      url: `${origin}/thanks?tribe=${tribeId}&demo=1&amount=${amountCents}`,
    });
  }

  const stripe = getStripe();
  const recurring =
    interval === "once"
      ? undefined
      : {
          interval: interval as "month" | "year",
        };
  const metadata = {
    tribe: tribeId,
    source: "tend",
    tempo_stream: "true",
    interval,
    stream_duration_seconds: String(streamDurationSeconds),
    stream_interval_seconds: String(streamIntervalSeconds),
  };
  // Destination-charge scaffolding is default-off and fails closed: when the
  // flag is enabled, a test-mode, transfer-ready recipient must be configured.
  let destinationAccount: string | null;
  try {
    destinationAccount = destinationChargeAccount(account);
    if (destinationAccount) {
      await assertDestinationAccountReady(stripe, destinationAccount);
    }
  } catch (error) {
    if (!(error instanceof ConnectConfigurationError)) {
      console.error("[tend] Connect account readiness check failed", error);
    }
    return NextResponse.json(
      { error: "The beneficiary payment account is not ready." },
      { status: 503 },
    );
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    integration_identifier: integrationIdentifier(),
    mode: interval === "once" ? "payment" : "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          ...(recurring ? { recurring } : {}),
          unit_amount: amountCents,
          product_data: {
            name: `${tribe.taxName} — ${tribe.name}`,
            description:
              interval === "once"
                ? "One-time voluntary contribution. Tend takes no platform fee; processing fees may apply."
                : `Voluntary ${interval}ly contribution. Tend takes no platform fee; processing fees may apply.`,
          },
        },
      },
    ],
    metadata,
    ...(interval === "once"
      ? {
          payment_intent_data: {
            metadata,
            ...(destinationAccount
              ? destinationChargeData(destinationAccount)
              : {}),
          },
        }
      : {
          subscription_data: {
            metadata,
            ...(destinationAccount
              ? destinationChargeData(destinationAccount)
              : {}),
          },
        }),
    success_url: `${origin}/thanks?tribe=${tribeId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${returnTo}?canceled=1`,
  };

  // Sovereignty by architecture: with a connected account configured (and
  // destination charges off), the subscription is created directly ON the
  // tribe's own Stripe account — their customers, their data, their payout.
  // Zero platform fee. Destination-charge mode instead creates the session on
  // the platform account with an immediate full transfer to the tribe.
  const session =
    account && !destinationAccount
      ? await stripe.checkout.sessions.create(params, { stripeAccount: account })
      : await stripe.checkout.sessions.create(params);

  return NextResponse.json({ url: session.url });
}
