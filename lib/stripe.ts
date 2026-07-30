import Stripe from "stripe";

let _stripe: Stripe | null = null;
let _preview: Stripe | null = null;

function requireKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return key;
}

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireKey(), {
      apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return _stripe;
}

/** Preview API version required for MPP crypto PaymentIntents. */
export function getStripePreview(): Stripe {
  if (!_preview) {
    _preview = new Stripe(requireKey(), {
      apiVersion: "2026-03-25.preview" as Stripe.LatestApiVersion,
    });
  }
  return _preview;
}
