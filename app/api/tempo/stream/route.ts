import { Account, Actions, Secp256k1, createClient } from "viem/tempo";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getTribe } from "@/lib/tribes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  sessionId: z.string().startsWith("cs_").max(256),
});

const ALPHA_USD = "0x20c0000000000000000000000000000000000001";
const EXPLORER_URL = "https://explore.testnet.tempo.xyz/tx/";
const SETTLEMENT_COUNT = 20;

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
      stripeReceipt: string;
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

function centsForSettlement(totalCents: number, index: number) {
  const base = Math.floor(totalCents / SETTLEMENT_COUNT);
  const remainder = totalCents % SETTLEMENT_COUNT;
  return base + (index < remainder ? 1 : 0);
}

async function runTempoStream(
  state: TempoStreamState,
  input: {
    amountCents: number;
    interval: string;
    organization: string;
    sessionId: string;
  },
) {
  try {
    const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey());
    const recipient = Account.fromSecp256k1(Secp256k1.randomPrivateKey());
    const client = createClient({
      account: sender,
      feeToken: ALPHA_USD,
      testnet: true,
    });

    emit(state, {
      type: "ready",
      amountCents: input.amountCents,
      interval: input.interval,
      organization: input.organization,
      recipient: recipient.address,
      settlements: SETTLEMENT_COUNT,
      stripeReceipt: input.sessionId,
    });

    emit(state, {
      type: "preparing",
      message: "Funding the Tempo testnet settlement wallet",
    });

    await Actions.faucet.fundSync(client, {
      account: sender,
      timeout: 20_000,
    });

    let streamedCents = 0;
    let lastHash = "";
    for (let index = 0; index < SETTLEMENT_COUNT; index += 1) {
      const amountCents = centsForSettlement(input.amountCents, index);
      const result = await Actions.token.transferSync(client, {
        token: ALPHA_USD,
        to: recipient.address,
        amount: { formatted: (amountCents / 100).toFixed(2) },
      });

      streamedCents += amountCents;
      lastHash = result.receipt.transactionHash;
      emit(state, {
        type: "settlement",
        amountCents,
        hash: lastHash,
        index: index + 1,
        streamedCents,
        totalCents: input.amountCents,
      });
    }

    emit(state, {
      type: "complete",
      amountCents: input.amountCents,
      lastHash,
      recipient: recipient.address,
      settlements: SETTLEMENT_COUNT,
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
    session = await getStripe().checkout.sessions.retrieve(parsed.data.sessionId);
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
          sessionId: session.id,
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
