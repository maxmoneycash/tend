import Stripe from "stripe";

let _stripe: Stripe | null = null;
let _preview: Stripe | null = null;
const TEST_KEY_PREFIXES = ["sk_test_", "rk_test_", "rkcs_test_"] as const;

function requireKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  if (!TEST_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    throw new Error("STRIPE_SECRET_KEY must use a Stripe test-mode key.");
  }
  return key;
}

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireKey(), {
      apiVersion: "2026-07-29.dahlia",
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
