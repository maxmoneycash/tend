import { NextResponse } from "next/server";
import { z } from "zod";
import { demoMode } from "@/lib/demo";
import { getStripe } from "@/lib/stripe";
import { getTribe, getTribeAccount, type TribeId } from "@/lib/tribes";

const Body = z.object({
  tribeId: z.enum(["ramaytush", "muwekma"]),
  amountCents: z.number().int().min(100).max(1_000_000),
  interval: z.enum(["month", "year"]),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pledge" }, { status: 400 });
  }
  const { tribeId, amountCents, interval } = parsed.data;
  const tribe = getTribe(tribeId)!;
  const account = getTribeAccount(tribeId as TribeId);
  const origin = new URL(req.url).origin;

  if (demoMode()) {
    return NextResponse.json({
      url: `${origin}/thanks?tribe=${tribeId}&demo=1`,
    });
  }

  const stripe = getStripe();
  const params = {
    mode: "subscription" as const,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          recurring: { interval },
          unit_amount: amountCents,
          product_data: {
            name: `${tribe.taxName} — ${tribe.name}`,
            description: `Voluntary ${interval}ly contribution. Tend takes no platform fee; processing fees may apply.`,
          },
        },
      },
    ],
    subscription_data: { metadata: { tribe: tribeId, source: "tend" } },
    success_url: `${origin}/thanks?tribe=${tribeId}`,
    cancel_url: `${origin}/?canceled=1`,
  };

  // Sovereignty by architecture: with a connected account configured, the
  // subscription is created directly ON the tribe's own Stripe account —
  // their customers, their data, their payout. Zero platform fee.
  const session = account
    ? await stripe.checkout.sessions.create(params, { stripeAccount: account })
    : await stripe.checkout.sessions.create(params);

  return NextResponse.json({ url: session.url });
}
