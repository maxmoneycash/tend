/**
 * Tempo testnet settlement runner.
 *
 * Triggered exclusively by the Stripe webhook after a Checkout Session is
 * verifiably paid. The receipt page only *reads* the progress this runner
 * writes into the payment store. It cannot start settlement work.
 */
import { Account, Actions, Secp256k1, createClient } from "viem/tempo";
import type Stripe from "stripe";
import {
  appendTempoEvent,
  claimTempoRun,
  finishTempoRun,
  getContribution,
} from "@/lib/payment-store";
import { getStripe } from "@/lib/stripe";
import { streamSettlementCount } from "@/lib/stream-plan";
import { getTribe } from "@/lib/tribes";

const PATH_USD = "0x20c0000000000000000000000000000000000000";
const MICRO_USD_PER_CENT = 10_000;
const DEFAULT_DEMO_RECIPIENT = "0x50672E6b84B7d7a21249f9fEC0AC678f0F0C4d22";
const TEMPO_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function tempoRecipient(tribeId: string): `0x${string}` {
  const tribeKey = `TEND_TEMPO_RECIPIENT_${tribeId.toUpperCase()}`;
  const configured =
    process.env[tribeKey] ??
    process.env.TEND_TEMPO_RECIPIENT ??
    DEFAULT_DEMO_RECIPIENT;
  return (
    TEMPO_ADDRESS_RE.test(configured) ? configured : DEFAULT_DEMO_RECIPIENT
  ) as `0x${string}`;
}

function microsForSettlement(
  totalMicros: number,
  index: number,
  settlementCount: number,
) {
  const base = Math.floor(totalMicros / settlementCount);
  const remainder = totalMicros % settlementCount;
  return base + (index < remainder ? 1 : 0);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Receipt details that only exist on the expanded Checkout Session. */
async function receiptDetails(sessionId: string, stripeAccount: string | null) {
  try {
    const session = await getStripe().checkout.sessions.retrieve(
      sessionId,
      { expand: ["payment_intent.latest_charge", "payment_intent.payment_method"] },
      stripeAccount ? { stripeAccount } : undefined,
    );
    const paymentIntent =
      session.payment_intent && typeof session.payment_intent !== "string"
        ? session.payment_intent
        : null;
    const paymentMethod =
      paymentIntent?.payment_method &&
      typeof paymentIntent.payment_method !== "string"
        ? paymentIntent.payment_method
        : null;
    const walletType =
      paymentMethod?.type === "card"
        ? paymentMethod.card?.wallet?.type
        : undefined;
    const paymentMethodLabel =
      walletType === "apple_pay"
        ? "Apple Pay"
        : walletType === "google_pay"
          ? "Google Pay"
          : paymentMethod?.type === "card"
            ? "Card"
            : "Stripe Checkout";
    const latestCharge =
      paymentIntent?.latest_charge &&
      typeof paymentIntent.latest_charge !== "string"
        ? (paymentIntent.latest_charge as Stripe.Charge)
        : null;
    return {
      paymentMethodLabel,
      stripeReceiptUrl: latestCharge?.receipt_url ?? undefined,
    };
  } catch {
    // Receipt details are optional. Settlement can continue without them.
    return { paymentMethodLabel: "Stripe Checkout", stripeReceiptUrl: undefined };
  }
}

/**
 * Start the Tempo settlement stream for a paid contribution if nobody has
 * yet. Safe to call from every relevant webhook delivery, including
 * replays: the run is claimed atomically in the store, so duplicate calls
 * and concurrent deliveries are no-ops. Failed or interrupted runs remain
 * terminal until an operator reconciles them, avoiding duplicate transfers.
 */
export async function maybeStartTempoSettlement(
  sessionId: string,
): Promise<void> {
  const contribution = getContribution(sessionId);
  if (!contribution) return;
  if (!contribution.tempoStream) return;
  if (contribution.paymentStatus !== "paid") return;
  if (!claimTempoRun(sessionId)) return;

  const {
    amountCents,
    interval,
    streamDurationSeconds,
    streamIntervalSeconds,
    stripeAccount,
    tribeId,
  } = contribution;
  const organization =
    getTribe(tribeId)?.name ?? "Indigenous-led organization";
  const recipient = tempoRecipient(tribeId);

  try {
    const { paymentMethodLabel, stripeReceiptUrl } = await receiptDetails(
      sessionId,
      stripeAccount,
    );

    const settlementCount = streamSettlementCount(
      streamDurationSeconds,
      streamIntervalSeconds,
    );

    appendTempoEvent(sessionId, {
      type: "ready",
      amountCents,
      interval,
      organization,
      paymentMethod: paymentMethodLabel,
      recipient,
      settlements: settlementCount,
      streamDurationSeconds,
      streamIntervalSeconds,
      stripeReceipt: sessionId,
      stripeReceiptUrl,
    });
    appendTempoEvent(sessionId, {
      type: "preparing",
      message: "Funding the Tempo testnet settlement wallet",
    });

    const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey());
    const client = createClient({
      account: sender,
      feeToken: PATH_USD,
      testnet: true,
    });

    await Actions.faucet.fundSync(client, { account: sender, timeout: 20_000 });

    const totalMicros = amountCents * MICRO_USD_PER_CENT;
    const cadenceStartedAt = Date.now();
    let streamedMicros = 0;
    let lastHash = "";
    for (let index = 0; index < settlementCount; index += 1) {
      const scheduledAt =
        cadenceStartedAt + (index + 1) * streamIntervalSeconds * 1_000;
      const waitFor = scheduledAt - Date.now();
      if (waitFor > 0) await wait(waitFor);

      const amountMicros = microsForSettlement(
        totalMicros,
        index,
        settlementCount,
      );
      const result = await Actions.token.transferSync(client, {
        token: PATH_USD,
        to: recipient,
        amount: { formatted: (amountMicros / 1_000_000).toFixed(6) },
      });

      streamedMicros += amountMicros;
      lastHash = result.receipt.transactionHash;
      appendTempoEvent(sessionId, {
        type: "settlement",
        amountCents: amountMicros / MICRO_USD_PER_CENT,
        hash: lastHash,
        index: index + 1,
        streamedCents: streamedMicros / MICRO_USD_PER_CENT,
        totalCents: amountCents,
      });
    }

    appendTempoEvent(sessionId, {
      type: "complete",
      amountCents,
      lastHash,
      recipient,
      settlements: settlementCount,
    });
    finishTempoRun(sessionId, "complete");
  } catch (error) {
    console.error("Tempo settlement stream failed", error);
    appendTempoEvent(sessionId, {
      type: "error",
      message:
        "The Tempo testnet stream stopped. An operator must reconcile it before any retry to avoid a duplicate transfer.",
    });
    finishTempoRun(sessionId, "error");
  }
}
