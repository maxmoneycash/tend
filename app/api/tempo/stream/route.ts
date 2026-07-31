import { Account, Actions, Secp256k1, createClient } from "viem/tempo";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import {
  DEFAULT_STREAM_DURATION_SECONDS,
  DEFAULT_STREAM_INTERVAL_SECONDS,
  isStreamDurationSeconds,
  isStreamIntervalSeconds,
  streamSettlementCount,
} from "@/lib/stream-plan";
import { getTribe } from "@/lib/tribes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const Body = z.object({
  sessionId: z.string().startsWith("cs_").max(256),
});

const PATH_USD = "0x20c0000000000000000000000000000000000000";
const EXPLORER_URL = "https://explore.testnet.tempo.xyz/tx/";
const MICRO_USD_PER_CENT = 10_000;

type StreamEvent =
  | {
      type: "preparing";
      message: string;
    }
  | {
      type: "ready";
      amountCents: number;
      interval: string;
      organization: string;
      recipient: string;
      settlements: number;
      streamDurationSeconds: number;
      streamIntervalSeconds: number;
      paymentMethod: string;
      stripeReceipt: string;
      stripeReceiptUrl?: string;
    }
  | {
      type: "settlement";
      amountCents: number;
      hash: string;
      index: number;
      streamedCents: number;
      totalCents: number;
    }
  | {
      type: "complete";
      amountCents: number;
      lastHash: string;
      recipient: string;
      settlements: number;
    }
  | {
      type: "error";
      message: string;
    };

type Controller = ReadableStreamDefaultController<Uint8Array>;

type TempoStreamState = {
  controllers: Set<Controller>;
  done: boolean;
  events: StreamEvent[];
  running: boolean;
};

const globalForTempo = globalThis as typeof globalThis & {
  __tendTempoStreams?: Map<string, TempoStreamState>;
};

const streamStates =
  globalForTempo.__tendTempoStreams ??
  (globalForTempo.__tendTempoStreams = new Map<string, TempoStreamState>());

const encoder = new TextEncoder();

function encodeEvent(event: StreamEvent) {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

function emit(state: TempoStreamState, event: StreamEvent) {
  state.events.push(event);
  const encoded = encodeEvent(event);
  for (const controller of state.controllers) {
    try {
      controller.enqueue(encoded);
    } catch {
      state.controllers.delete(controller);
    }
  }
}

function finish(state: TempoStreamState) {
  state.done = true;
  for (const controller of state.controllers) {
    try {
      controller.close();
    } catch {
      // The browser may have navigated away after the final event.
    }
  }
  state.controllers.clear();
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

async function runTempoStream(
  state: TempoStreamState,
  input: {
    amountCents: number;
    interval: string;
    organization: string;
    paymentMethod: string;
    sessionId: string;
    streamDurationSeconds: number;
    streamIntervalSeconds: number;
    stripeReceiptUrl?: string;
  },
) {
  try {
    const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey());
    const recipient = Account.fromSecp256k1(Secp256k1.randomPrivateKey());
    const client = createClient({
      account: sender,
      feeToken: PATH_USD,
      testnet: true,
    });

    emit(state, {
      type: "ready",
      amountCents: input.amountCents,
      interval: input.interval,
      organization: input.organization,
      paymentMethod: input.paymentMethod,
      recipient: recipient.address,
      settlements: streamSettlementCount(
        input.streamDurationSeconds,
        input.streamIntervalSeconds,
      ),
      streamDurationSeconds: input.streamDurationSeconds,
      streamIntervalSeconds: input.streamIntervalSeconds,
      stripeReceipt: input.sessionId,
      stripeReceiptUrl: input.stripeReceiptUrl,
    });

    emit(state, {
      type: "preparing",
      message: "Funding the Tempo testnet settlement wallet",
    });

    await Actions.faucet.fundSync(client, {
      account: sender,
      timeout: 20_000,
    });

    const settlementCount = streamSettlementCount(
      input.streamDurationSeconds,
      input.streamIntervalSeconds,
    );
    const totalMicros = input.amountCents * MICRO_USD_PER_CENT;
    const cadenceStartedAt = Date.now();
    let streamedMicros = 0;
    let lastHash = "";
    for (let index = 0; index < settlementCount; index += 1) {
      const scheduledAt =
        cadenceStartedAt + (index + 1) * input.streamIntervalSeconds * 1_000;
      const waitFor = scheduledAt - Date.now();
      if (waitFor > 0) await wait(waitFor);

      const amountMicros = microsForSettlement(
        totalMicros,
        index,
        settlementCount,
      );
      const result = await Actions.token.transferSync(client, {
        token: PATH_USD,
        to: recipient.address,
        amount: { formatted: (amountMicros / 1_000_000).toFixed(6) },
      });

      streamedMicros += amountMicros;
      lastHash = result.receipt.transactionHash;
      emit(state, {
        type: "settlement",
        amountCents: amountMicros / MICRO_USD_PER_CENT,
        hash: lastHash,
        index: index + 1,
        streamedCents: streamedMicros / MICRO_USD_PER_CENT,
        totalCents: input.amountCents,
      });
    }

    emit(state, {
      type: "complete",
      amountCents: input.amountCents,
      lastHash,
      recipient: recipient.address,
      settlements: settlementCount,
    });
  } catch (error) {
    console.error("Tempo settlement stream failed", error);
    emit(state, {
      type: "error",
      message:
        "The Stripe payment is safe, but the Tempo testnet stream stopped. Reload to reconnect to this receipt.",
    });
  } finally {
    finish(state);
  }
}

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: "Invalid Stripe receipt." }, { status: 400 });
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(
      parsed.data.sessionId,
      {
        expand: ["payment_intent.latest_charge", "payment_intent.payment_method"],
      },
    );
  } catch {
    return Response.json(
      { error: "Stripe could not verify this receipt." },
      { status: 400 },
    );
  }

  if (
    session.payment_status !== "paid" ||
    session.metadata?.source !== "tend" ||
    session.metadata?.tempo_stream !== "true" ||
    !session.amount_total
  ) {
    return Response.json(
      { error: "This Stripe Checkout session is not a paid Tend contribution." },
      { status: 402 },
    );
  }

  const tribe = getTribe(session.metadata.tribe ?? "");
  const organization = tribe?.name ?? "Indigenous-led organization";
  const interval = session.metadata.interval ?? "once";
  const requestedDurationSeconds = Number(
    session.metadata.stream_duration_seconds,
  );
  const streamDurationSeconds = isStreamDurationSeconds(
    requestedDurationSeconds,
  )
    ? requestedDurationSeconds
    : DEFAULT_STREAM_DURATION_SECONDS;
  const requestedIntervalSeconds = Number(
    session.metadata.stream_interval_seconds,
  );
  const streamIntervalSeconds = isStreamIntervalSeconds(
    requestedIntervalSeconds,
  )
    ? requestedIntervalSeconds
    : DEFAULT_STREAM_INTERVAL_SECONDS;
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
    paymentMethod?.type === "card" ? paymentMethod.card?.wallet?.type : undefined;
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
  const key = session.id;
  let state = streamStates.get(key);

  if (!state) {
    state = {
      controllers: new Set(),
      done: false,
      events: [],
      running: false,
    };
    streamStates.set(key, state);
  }

  let connectedController: Controller | null = null;
  const responseStream = new ReadableStream<Uint8Array>({
    start(controller) {
      connectedController = controller;
      for (const event of state.events) controller.enqueue(encodeEvent(event));
      if (state.done) {
        controller.close();
        return;
      }

      state.controllers.add(controller);
      if (!state.running) {
        state.running = true;
        void runTempoStream(state, {
          amountCents: session.amount_total!,
          interval,
          organization,
          paymentMethod: paymentMethodLabel,
          sessionId: session.id,
          streamDurationSeconds,
          streamIntervalSeconds,
          stripeReceiptUrl: latestCharge?.receipt_url ?? undefined,
        });
      }
    },
    cancel() {
      if (connectedController) state.controllers.delete(connectedController);
    },
  });

  return new Response(responseStream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
      "X-Tempo-Explorer": EXPLORER_URL,
    },
  });
}
