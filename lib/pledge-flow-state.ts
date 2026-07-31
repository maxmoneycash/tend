import type {
  CheckoutIntent,
  CheckoutInterval,
  CheckoutReturnDraft,
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

export function buildCheckoutResumePath(intent: CheckoutIntent): string {
  const url = new URL(intent.returnTo, "https://tend.local");
  url.searchParams.set("resume", "checkout");
  url.searchParams.set("t", intent.tribeId);
  url.searchParams.set("a", String(intent.amountCents));
  url.searchParams.set("i", intent.interval);
  url.searchParams.set("d", String(intent.streamDurationSeconds));
  url.searchParams.set("c", String(intent.streamIntervalSeconds));
  return `${url.pathname}${url.search}`;
}

export function buildCheckoutRequest(
  intent: CheckoutIntent,
  preserveCancelIntent: boolean,
): CheckoutIntent & { loginReturnTo: string } {
  const resumePath = buildCheckoutResumePath(intent);
  return {
    ...intent,
    returnTo: preserveCancelIntent ? resumePath : intent.returnTo,
    loginReturnTo: resumePath,
  };
}

export function buildCheckoutCancelUrl(
  origin: string,
  returnTo: string,
): string {
  const hashIndex = returnTo.indexOf("#");
  const pathAndQuery =
    hashIndex === -1 ? returnTo : returnTo.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : returnTo.slice(hashIndex);
  const separator = pathAndQuery.includes("?") ? "&" : "?";
  return `${origin}${pathAndQuery}${separator}canceled=1${hash}`;
}

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

export function restorePledgeDraft(
  draft: CheckoutReturnDraft,
): Partial<RestoredPledgeSelection> {
  const restored: Partial<RestoredPledgeSelection> = {};

  if (draft.amountCents !== null) {
    restored.amount = draft.amountCents / 100;
    restored.custom = "";
  }
  if (draft.interval !== null) restored.interval = draft.interval;
  if (draft.streamDurationSeconds !== null) {
    restored.streamDurationSeconds = draft.streamDurationSeconds;
  }
  if (draft.streamIntervalSeconds !== null) {
    restored.streamIntervalSeconds = draft.streamIntervalSeconds;
  }
  if (draft.tribeId !== null) restored.tribeId = draft.tribeId;

  return restored;
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

export function pledgeCheckoutCanceledError(demo: boolean): string {
  return demo
    ? "The demo preview was closed. Your saved details are ready to review."
    : "Stripe test checkout was canceled. Your saved details are ready to review.";
}

export function pledgeResumeError({
  demo,
  hasProgram,
}: {
  demo: boolean;
  hasProgram: boolean;
}): string {
  if (!hasProgram) {
    return demo
      ? "We couldn’t restore the saved program. Enter your address or choose a county to rebuild the demo preview."
      : "We couldn’t restore the saved program. Enter your address or choose a county to rebuild the test checkout.";
  }

  return demo
    ? "We couldn’t restore every saved preview detail. Review the amount and timing below, then try the demo preview again."
    : "We couldn’t restore every saved checkout detail. Review the amount and timing below, then try Stripe test checkout again.";
}

export function pledgeCheckoutButtonLabel({
  amountValid,
  checkoutError,
  demo,
  interval,
  selectedAmount,
}: {
  amountValid: boolean;
  checkoutError: string | null;
  demo: boolean;
  interval: CheckoutInterval;
  selectedAmount: number;
}): string {
  if (checkoutError) {
    return demo
      ? "Try demo preview again"
      : "Try Stripe test checkout again";
  }

  const amount = amountValid ? selectedAmount.toFixed(2) : "0.00";
  if (demo) return `Continue to $${amount} demo receipt preview`;

  const record = pledgeStripeRecordLabel(interval).toLowerCase();
  return `Open Stripe checkout for a $${amount} ${record} (no real charge)`;
}

export function pledgeStripeRecordLabel(
  interval: CheckoutInterval,
): string {
  if (interval === "once") return "One-time test payment";
  return interval === "month"
    ? "Monthly test subscription"
    : "Yearly test subscription";
}

export function pledgeTempoPlanExplanation(
  interval: CheckoutInterval,
): string {
  if (interval === "once") {
    return "Stripe records a one-time test payment after you complete checkout. Tend attempts this Tempo testnet plan once after Stripe confirms it.";
  }

  const schedule = interval === "month" ? "monthly" : "yearly";
  return `Stripe creates a ${schedule} test subscription after you complete checkout. Tend attempts this Tempo testnet plan after Stripe confirms the first payment; later subscription invoices do not trigger another attempt.`;
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
