/**
 * Stripe Connect destination-charge scaffolding.
 *
 * Everything is gated behind TEND_CONNECT_DESTINATION_CHARGES=1 (default
 * off). With the flag off, checkout keeps today's behavior: direct charges
 * created on the tribe's connected account when TEND_ACCT_* is set, platform
 * charges otherwise. With the flag on (and a connected account configured),
 * checkout creates destination charges per
 * https://docs.stripe.com/connect/destination-charges — the charge lands on
 * the platform account and the full amount transfers to the tribe's account.
 * Flipping the flag is config, not code.
 */

export function destinationChargesEnabled(): boolean {
  return process.env.TEND_CONNECT_DESTINATION_CHARGES === "1";
}

/** Tend runs test mode only; Connect scaffolding refuses live keys. */
export function stripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return /^(sk_test_|rk_test_|rkcs_test_)/.test(key);
}

/**
 * Destination-charge parameters for a Checkout Session.
 * - transfer_data.destination makes this a destination charge: processed on
 *   the platform, funds immediately transferred to the tribe's account.
 * - on_behalf_of makes the tribe the settlement merchant (their statement
 *   descriptor, their branding) — Tend takes no platform fee, so no
 *   application_fee_amount is set and the full amount transfers.
 */
export function destinationChargeData(account: string): {
  on_behalf_of: string;
  transfer_data: { destination: string };
} {
  return {
    on_behalf_of: account,
    transfer_data: { destination: account },
  };
}
