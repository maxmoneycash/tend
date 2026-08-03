import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import {
  appOrigin,
  AppOriginConfigurationError,
} from "@/lib/app-origin";
import { auth0 } from "@/lib/auth0";
import {
  assertDestinationAccountReady,
  ConnectConfigurationError,
  destinationChargeAccount,
  destinationChargeData,
} from "@/lib/connect";
import { demoMode } from "@/lib/demo";
import { getStripe } from "@/lib/stripe";
import { buildCheckoutCancelUrl } from "@/lib/pledge-flow-state";
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
  let origin: string;
  try {
    origin = appOrigin(req);
  } catch (error) {
    if (!(error instanceof AppOriginConfigurationError)) throw error;
    console.error("[tend] Invalid payment return URL configuration", error);
    return NextResponse.json(
      { error: "Payment return links are not configured." },
      { status: 503 },
    );
  }

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
  // The destination-charge scaffold starts disabled. Enabling it requires a
  // test recipient whose account can receive transfers.
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
            name: `${tribe.taxName} for ${tribe.name}`,
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
    cancel_url: buildCheckoutCancelUrl(origin, returnTo),
  };

  // Direct charges use the configured connected account. Destination charges
  // use the platform account and transfer the contribution to the recipient.
  // Tend does not set a platform fee in either mode.
  const session =
    account && !destinationAccount
      ? await stripe.checkout.sessions.create(params, { stripeAccount: account })
      : await stripe.checkout.sessions.create(params);

  return NextResponse.json({ url: session.url });
}
