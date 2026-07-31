import { NextResponse } from "next/server";
import { after } from "next/server";
import type Stripe from "stripe";
import {
  claimStripeEvent,
  releaseStripeEvent,
  updatePaymentStatus,
  upsertContribution,
} from "@/lib/payment-store";
import { getStripe } from "@/lib/stripe";
import {
  DEFAULT_STREAM_DURATION_SECONDS,
  DEFAULT_STREAM_INTERVAL_SECONDS,
  isStreamDurationSeconds,
  isStreamIntervalSeconds,
} from "@/lib/stream-plan";
import { maybeStartTempoSettlement } from "@/lib/tempo-settlement";

export const runtime = "nodejs";
// The Tempo settlement stream runs via after() and can take
// faucet funding (~20s) + up to 60s of settlements.
export const maxDuration = 120;

/**
 * Stripe webhook — the single trigger for post-payment work.
 *
 * - Signature-verified against STRIPE_WEBHOOK_SECRET.
 * - Durably idempotent: processed event ids are persisted in SQLite, so
 *   replayed/duplicate deliveries never double-process state.
 * - checkout.session.completed / async_payment_succeeded record the
 *   contribution and kick off the Tempo testnet receipt stream. The receipt
 *   page only displays the state written here.
 *
 * Local dev (direct charges are created ON the tribe's connected account, so
 * both flavors must be forwarded):
 *   stripe listen \
 *     --forward-to localhost:3102/api/stripe/webhook \
 *     --forward-connect-to localhost:3102/api/stripe/webhook
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Durable idempotency: first delivery claims the event id; replays are
  // acknowledged without reprocessing.
  const firstDelivery = claimStripeEvent(event.id, event.type);

  let tempoSessionId: string | null = null;
  if (firstDelivery) {
    try {
      tempoSessionId = processEvent(event);
    } catch (error) {
      // Release the claim so Stripe's retry can process the event again.
      releaseStripeEvent(event.id);
      console.error(`[tend] webhook processing failed for ${event.id}`, error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  } else {
    tempoSessionId = tempoSessionFor(event);
  }

  // Settlement kickoff is guarded by its own atomic claim in the store, so
  // calling it on every delivery (including replays) is safe. Replaying a
  // webhook event is the sanctioned way to restart a failed Tempo run.
  if (tempoSessionId) {
    const sessionId = tempoSessionId;
    after(() => maybeStartTempoSettlement(sessionId));
  }

  return NextResponse.json({ received: true, duplicate: !firstDelivery });
}

/** Mutate durable state for a first-time delivery. Returns a session id when
 *  Tempo settlement work should be scheduled. */
function processEvent(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.metadata?.source !== "tend") return null;
      recordSession(session, eventAccount(event));
      console.log(
        `[tend] pledge recorded: ${session.id} tribe=${session.metadata?.tribe ?? "?"} payment_status=${session.payment_status}`,
      );
      return session.payment_status === "paid" ? session.id : null;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.metadata?.source !== "tend") return null;
      recordSession(session, eventAccount(event));
      updatePaymentStatus(session.id, "paid");
      return session.id;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      if (session.metadata?.source !== "tend") return null;
      updatePaymentStatus(session.id, "failed");
      return null;
    }
    case "invoice.payment_succeeded":
      console.log("[tend] recurring land tax payment succeeded");
      return null;
    default:
      return null;
  }
}

/** Session id worth (re)scheduling settlement for, without mutating state. */
function tempoSessionFor(event: Stripe.Event): string | null {
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return null;
  }
  const session = event.data.object;
  return session.metadata?.source === "tend" ? session.id : null;
}

/** Connected-account id for Connect events (direct charges live on the
 *  tribe's account, and later retrieves must use the same account). */
function eventAccount(event: Stripe.Event): string | null {
  return "account" in event && typeof event.account === "string"
    ? event.account
    : null;
}

function recordSession(
  session: Stripe.Checkout.Session,
  stripeAccount: string | null,
) {
  const requestedDuration = Number(session.metadata?.stream_duration_seconds);
  const requestedInterval = Number(session.metadata?.stream_interval_seconds);
  upsertContribution({
    sessionId: session.id,
    stripeAccount,
    tribeId: session.metadata?.tribe ?? "",
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    interval: session.metadata?.interval ?? "once",
    streamDurationSeconds: isStreamDurationSeconds(requestedDuration)
      ? requestedDuration
      : DEFAULT_STREAM_DURATION_SECONDS,
    streamIntervalSeconds: isStreamIntervalSeconds(requestedInterval)
      ? requestedInterval
      : DEFAULT_STREAM_INTERVAL_SECONDS,
    paymentStatus: session.payment_status,
    mode: session.mode,
    tempoStream:
      session.metadata?.tempo_stream === "true" && !!session.amount_total,
  });
}
