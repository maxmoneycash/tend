import { z } from "zod";
import { getTempoState } from "@/lib/payment-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SessionId = z.string().startsWith("cs_").max(256);

/**
 * Read-only receipt state for the thanks page.
 *
 * Settlement work is triggered exclusively by the Stripe webhook
 * (app/api/stripe/webhook). This endpoint just reports the durable state the
 * webhook + settlement runner wrote — the receipt page polls it and can
 * never start Tempo actions.
 */
export async function GET(request: Request) {
  const parsed = SessionId.safeParse(
    new URL(request.url).searchParams.get("sessionId"),
  );
  if (!parsed.success) {
    return Response.json({ error: "Invalid Stripe receipt." }, { status: 400 });
  }

  const state = getTempoState(parsed.data);
  if (!state) {
    // The webhook has not confirmed this session yet (or `stripe listen`
    // is not forwarding events in local dev).
    return Response.json({ status: "awaiting-confirmation", events: [] });
  }
  if (state.paymentStatus === "failed") {
    return Response.json({ status: "payment-failed", events: [] });
  }
  if (state.paymentStatus !== "paid") {
    return Response.json({ status: "awaiting-payment", events: [] });
  }

  return Response.json({ status: state.tempoStatus, events: state.events });
}
