import type {
  CheckoutIntent,
  CheckoutInterval,
} from "@/lib/checkout-client";
import type {
  StreamDurationSeconds,
  StreamIntervalSeconds,
} from "@/lib/stream-plan";

export type RestoredPledgeSelection = {
  amount: number;
  custom: "";
  interval: CheckoutInterval;
  streamDurationSeconds: StreamDurationSeconds;
  streamIntervalSeconds: StreamIntervalSeconds;
  tribeId: CheckoutIntent["tribeId"];
};

export function restorePledgeSelection(
  intent: CheckoutIntent,
): RestoredPledgeSelection {
  return {
    amount: intent.amountCents / 100,
    custom: "",
    interval: intent.interval,
    streamDurationSeconds: intent.streamDurationSeconds,
    streamIntervalSeconds: intent.streamIntervalSeconds,
    tribeId: intent.tribeId,
  };
}

export function resolvePledgeProgram<T extends { id: string }>(
  locatedPrograms: readonly T[] | null | undefined,
  programs: readonly T[],
  tribeId: string | null,
): T | undefined {
  return (
    locatedPrograms?.find((program) => program.id === tribeId) ??
    programs.find((program) => program.id === tribeId)
  );
}

export function pledgeCheckoutError(caught: unknown, demo: boolean): string {
  const message =
    caught instanceof Error
      ? caught.message
      : "Stripe Checkout didn’t open. Check your connection.";

  return demo && message === "Stripe Checkout didn’t open. Check your connection."
    ? "The demo preview didn’t open. Check your connection and try again."
    : message;
}

export function pledgeCheckoutButtonLabel({
  amountValid,
  checkoutError,
  demo,
  selectedAmount,
}: {
  amountValid: boolean;
  checkoutError: string | null;
  demo: boolean;
  selectedAmount: number;
}): string {
  if (checkoutError) {
    return demo
      ? "Try demo preview again"
      : "Try Stripe test checkout again";
  }

  const amount = amountValid ? selectedAmount.toFixed(2) : "0.00";
  return demo
    ? `Continue to $${amount} demo receipt preview`
    : `Open $${amount} test checkout (no real charge)`;
}

export function buildPledgeCheckoutIntent({
  interval,
  returnTo,
  selectedAmount,
  streamDurationSeconds,
  streamIntervalSeconds,
  tribeId,
}: {
  interval: CheckoutInterval;
  returnTo: string;
  selectedAmount: number;
  streamDurationSeconds: StreamDurationSeconds;
  streamIntervalSeconds: StreamIntervalSeconds;
  tribeId: CheckoutIntent["tribeId"];
}): CheckoutIntent {
  return {
    tribeId,
    amountCents: Math.round(selectedAmount * 100),
    interval,
    streamDurationSeconds,
    streamIntervalSeconds,
    returnTo,
  };
}
