/**
 * The machine-payable land tax.
 *
 * AI agents operating on Ohlone land can pay an annual voluntary land tax
 * over Stripe's Machine Payments Protocol (MPP): a first request receives a
 * 402 challenge advertising the payment methods; the agent pays (Tempo
 * testnet stablecoin, or card via Shared Payment Token when a Stripe
 * profile is configured) and retries with its credential to receive the
 * receipt.
 *
 * Try it:  npx mppx http://localhost:3100/api/mpp/land-tax?tribe=ramaytush --method POST
 */
import crypto from "node:crypto";
import { Credential } from "mppx";
import { Mppx, stripe as mppStripe, tempo } from "mppx/server";
import { getStripePreview } from "@/lib/stripe";
import { getStripe } from "@/lib/stripe";
import { getTribe, getTribeAccount, tribes, type TribeId } from "@/lib/tribes";

export const runtime = "nodejs";

const PATH_USD = "0x20c0000000000000000000000000000000000000"; // Tempo testnet

// Demo-scope cache of deposit addresses we issued (per docs pattern).
// Fine for a single local process; a deployment would use a shared store.
const paymentCache = new Map<string, TribeId>();

async function createPayToAddress(
  request: Request,
  tribeId: TribeId,
  amountUsd: string,
): Promise<`0x${string}`> {
  const authHeader = request.headers.get("authorization");
  if (authHeader && Credential.extractPaymentScheme(authHeader)) {
    const credential = Credential.fromRequest(request);
    const toAddress = credential.challenge.request.recipient as `0x${string}`;
    if (!paymentCache.has(toAddress)) {
      throw new Error("Invalid payTo address: not found in server cache");
    }
    return toAddress;
  }

  const paymentIntent = await getStripePreview().paymentIntents.create({
    amount: Math.round(Number(amountUsd) * 100),
    currency: "usd",
    description: `Annual land tax (machine) — ${tribes[tribeId].name}`,
    metadata: { tribe: tribeId, source: "tend-mpp" },
    payment_method_data: { type: "crypto" } as never,
    payment_method_options: {
      crypto: { mode: "deposit", deposit_options: { networks: ["tempo"] } },
    } as never,
    confirm: true,
  });

  const nextAction = paymentIntent.next_action as unknown as {
    crypto_display_details?: {
      deposit_addresses?: { tempo?: { address?: string } };
    };
  };
  const payTo = nextAction?.crypto_display_details?.deposit_addresses?.tempo
    ?.address as `0x${string}` | undefined;
  if (!payTo) throw new Error("No Tempo deposit address issued");

  paymentCache.set(payTo, tribeId);
  return payTo;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const tribeParam = url.searchParams.get("tribe") ?? "ramaytush";
  const tribe = getTribe(tribeParam);
  if (!tribe) {
    return Response.json({ error: "Unknown tribe" }, { status: 400 });
  }

  const amountUsd = (tribe.annualMachineTaxCents / 100).toFixed(2);
  const recipient = await createPayToAddress(request, tribe.id, amountUsd);

  const secretKey = crypto
    .createHmac("sha256", process.env.STRIPE_SECRET_KEY ?? "tend-dev")
    .update("mpp-challenge-signing")
    .digest("base64");

  const profileId = process.env.STRIPE_PROFILE_ID;
  const methods = [
    tempo.charge({ currency: PATH_USD, recipient, testnet: true }),
    ...(profileId
      ? [
          mppStripe.charge({
            client: getStripe(),
            networkId: profileId,
            currency: "usd",
            paymentMethodTypes: ["card", "link"],
            decimals: 2,
          }),
        ]
      : []),
  ];

  const mppx = Mppx.create({ methods, secretKey });

  // The instance `compose` API takes ['method/intent', options] tuples; the
  // conditional transport typing fights inference, so pin the shape locally.
  type ComposeResult = {
    status: number;
    challenge: Response;
    withReceipt: (r: Response) => Response;
  };
  const compose = (
    mppx as unknown as {
      compose: (
        ...entries: [string, { amount: string }][]
      ) => (input: Request) => Promise<ComposeResult>;
    }
  ).compose;

  const entries: [string, { amount: string }][] = [
    ["tempo/charge", { amount: amountUsd }],
    ...(profileId
      ? ([["stripe/charge", { amount: amountUsd }]] as [
          string,
          { amount: string },
        ][])
      : []),
  ];

  const response = await compose(...entries)(request);
  if (response.status === 402) return response.challenge;

  // Payment received on the platform account. Route it onward to the
  // tribe's connected account; in test mode the transfer can fail on
  // available-balance timing, so a miss is logged rather than fatal.
  const account = getTribeAccount(tribe.id);
  let routed = false;
  if (account) {
    try {
      await getStripe().transfers.create({
        amount: tribe.annualMachineTaxCents,
        currency: "usd",
        destination: account,
        description: `Tend MPP land tax routing — ${tribe.name}`,
      });
      routed = true;
    } catch (err) {
      console.log(
        `[tend] MPP transfer deferred (${(err as Error).message}) — route manually or rely on settlement timing`,
      );
    }
  }

  return response.withReceipt(
    Response.json({
      ok: true,
      tribe: tribe.id,
      receipt: `Annual land tax received for ${tribe.name}.`,
      amountUsd,
      routedToTribeAccount: routed,
      note: routed
        ? "Payment received and routed to the configured connected account."
        : "Payment received; onward routing requires reconciliation.",
    }),
  );
}
