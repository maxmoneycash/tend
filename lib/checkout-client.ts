import {
  isStreamDurationSeconds,
  isStreamIntervalSeconds,
  type StreamDurationSeconds,
  type StreamIntervalSeconds,
} from "@/lib/stream-plan";
import { buildCheckoutRequest } from "@/lib/pledge-flow-state";

export type CheckoutInterval = "once" | "month" | "year";

export type CheckoutIntent = {
  tribeId: "ramaytush" | "muwekma";
  amountCents: number;
  interval: CheckoutInterval;
  streamDurationSeconds: StreamDurationSeconds;
  streamIntervalSeconds: StreamIntervalSeconds;
  returnTo: string;
};

type CheckoutResponse = {
  error?: string;
  loginUrl?: string;
  url?: string;
};

export type CheckoutReturnDraft = {
  amountCents: number | null;
  interval: CheckoutInterval | null;
  streamDurationSeconds: StreamDurationSeconds | null;
  streamIntervalSeconds: StreamIntervalSeconds | null;
  tribeId: CheckoutIntent["tribeId"] | null;
};

export type CheckoutReturn =
  | {
      canceled: boolean;
      intent: CheckoutIntent;
      status: "valid";
    }
  | {
      draft: CheckoutReturnDraft;
      status: "invalid";
    };

const RESUME_KEYS = [
  "resume",
  "t",
  "a",
  "i",
  "d",
  "c",
  "canceled",
] as const;

export function consumeCheckoutReturn(
  expectedPath: string,
): CheckoutReturn | null {
  const url = new URL(window.location.href);
  if (
    url.pathname !== expectedPath ||
    url.searchParams.get("resume") !== "checkout"
  ) {
    return null;
  }

  const savedTribeId = url.searchParams.get("t");
  const savedAmountCents = Number(url.searchParams.get("a"));
  const savedInterval = url.searchParams.get("i");
  const savedDurationSeconds = Number(url.searchParams.get("d"));
  const savedCadenceSeconds = Number(url.searchParams.get("c"));
  const canceled = url.searchParams.get("canceled") === "1";

  const draft: CheckoutReturnDraft = {
    amountCents:
      Number.isInteger(savedAmountCents) &&
      savedAmountCents >= 100 &&
      savedAmountCents <= 1_000_000
        ? savedAmountCents
        : null,
    interval:
      savedInterval === "once" ||
      savedInterval === "month" ||
      savedInterval === "year"
        ? savedInterval
        : null,
    streamDurationSeconds: isStreamDurationSeconds(savedDurationSeconds)
      ? savedDurationSeconds
      : null,
    streamIntervalSeconds: isStreamIntervalSeconds(savedCadenceSeconds)
      ? savedCadenceSeconds
      : null,
    tribeId:
      savedTribeId === "ramaytush" || savedTribeId === "muwekma"
        ? savedTribeId
        : null,
  };

  for (const key of RESUME_KEYS) url.searchParams.delete(key);
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );

  if (
    draft.tribeId === null ||
    draft.amountCents === null ||
    draft.interval === null ||
    draft.streamDurationSeconds === null ||
    draft.streamIntervalSeconds === null
  ) {
    return { draft, status: "invalid" };
  }

  return {
    canceled,
    intent: {
      tribeId: draft.tribeId,
      amountCents: draft.amountCents,
      interval: draft.interval,
      streamDurationSeconds: draft.streamDurationSeconds,
      streamIntervalSeconds: draft.streamIntervalSeconds,
      returnTo: expectedPath,
    },
    status: "valid",
  };
}

export function consumeCheckoutIntent(
  expectedPath: string,
): CheckoutIntent | null {
  const checkoutReturn = consumeCheckoutReturn(expectedPath);
  return checkoutReturn?.status === "valid" ? checkoutReturn.intent : null;
}

export async function startCheckout(
  intent: CheckoutIntent,
  options: { preserveCancelIntent?: boolean; resuming?: boolean } = {},
) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildCheckoutRequest(intent, options.preserveCancelIntent === true),
    ),
  });
  const data = (await response.json()) as CheckoutResponse;

  if (response.status === 401 && data.loginUrl) {
    if (options.resuming) {
      throw new Error("Sign-in did not finish. Sign in again to continue.");
    }
    window.location.assign(data.loginUrl);
    return;
  }

  if (!response.ok || !data.url) {
    throw new Error(
      data.error ?? "Stripe Checkout didn’t open. Check your connection.",
    );
  }

  window.location.assign(data.url);
}
