import {
  isStreamDurationSeconds,
  isStreamIntervalSeconds,
  type StreamDurationSeconds,
  type StreamIntervalSeconds,
} from "@/lib/stream-plan";

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

const RESUME_KEYS = ["resume", "t", "a", "i", "d", "c"] as const;

function buildLoginReturnTo(intent: CheckoutIntent) {
  const url = new URL(intent.returnTo, "https://tend.local");
  url.searchParams.set("resume", "checkout");
  url.searchParams.set("t", intent.tribeId);
  url.searchParams.set("a", String(intent.amountCents));
  url.searchParams.set("i", intent.interval);
  url.searchParams.set("d", String(intent.streamDurationSeconds));
  url.searchParams.set("c", String(intent.streamIntervalSeconds));
  return `${url.pathname}${url.search}`;
}

export function consumeCheckoutIntent(
  expectedPath: string,
): CheckoutIntent | null {
  const url = new URL(window.location.href);
  if (
    url.pathname !== expectedPath ||
    url.searchParams.get("resume") !== "checkout"
  ) {
    return null;
  }

  const tribeId = url.searchParams.get("t");
  const amountCents = Number(url.searchParams.get("a"));
  const interval = url.searchParams.get("i");
  const durationSeconds = Number(url.searchParams.get("d"));
  const cadenceSeconds = Number(url.searchParams.get("c"));

  for (const key of RESUME_KEYS) url.searchParams.delete(key);
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );

  if (
    (tribeId !== "ramaytush" && tribeId !== "muwekma") ||
    !Number.isInteger(amountCents) ||
    amountCents < 100 ||
    amountCents > 1_000_000 ||
    (interval !== "once" && interval !== "month" && interval !== "year") ||
    !isStreamDurationSeconds(durationSeconds) ||
    !isStreamIntervalSeconds(cadenceSeconds)
  ) {
    return null;
  }

  return {
    tribeId,
    amountCents,
    interval,
    streamDurationSeconds: durationSeconds,
    streamIntervalSeconds: cadenceSeconds,
    returnTo: expectedPath,
  };
}

export async function startCheckout(
  intent: CheckoutIntent,
  options: { resuming?: boolean } = {},
) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...intent,
      loginReturnTo: buildLoginReturnTo(intent),
    }),
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
