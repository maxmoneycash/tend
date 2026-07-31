import type Stripe from "stripe";

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

export class ConnectConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectConfigurationError";
  }
}

/**
 * Resolve the configured destination account and fail closed when the feature
 * flag is on without a complete test-mode configuration.
 */
export function destinationChargeAccount(
  account: string | undefined,
): string | null {
  if (!destinationChargesEnabled()) return null;
  if (!stripeTestMode()) {
    throw new ConnectConfigurationError(
      "Destination charges are restricted to Stripe test mode.",
    );
  }
  if (!account) {
    throw new ConnectConfigurationError(
      "Destination charges require a connected beneficiary account.",
    );
  }
  return account;
}

/**
 * Accounts v2 capability check required before a destination transfer.
 * Recipient accounts do not need merchant/card-payments capability because
 * the platform is the merchant of record for this charge shape.
 */
export async function assertDestinationAccountReady(
  stripe: Stripe,
  accountId: string,
): Promise<void> {
  const account = await stripe.v2.core.accounts.retrieve(accountId, {
    include: ["configuration.recipient"],
  });
  const status =
    account.configuration?.recipient?.capabilities?.stripe_balance
      ?.stripe_transfers?.status;
  if (account.livemode || status !== "active") {
    throw new ConnectConfigurationError(
      "The beneficiary account is not ready to receive test-mode transfers.",
    );
  }
}

/**
 * Destination-charge parameters for a Checkout Session.
 * - transfer_data.destination makes this a destination charge: processed on
 *   the platform, funds immediately transferred to the tribe's account.
 * - Tend takes no platform fee, so no application_fee_amount is set and the
 *   full amount transfers. The platform remains merchant of record.
 */
export function destinationChargeData(account: string): {
  transfer_data: { destination: string };
} {
  return {
    transfer_data: { destination: account },
  };
}
