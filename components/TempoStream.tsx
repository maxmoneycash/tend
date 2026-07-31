"use client";

import {
  Check,
  CircleX,
  ExternalLink,
  LoaderCircle,
  Radio,
  RotateCw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DonationReceipt } from "@/components/DonationReceipt";

type PreparingEvent = {
  type: "preparing";
  message: string;
};

type ReadyEvent = {
  type: "ready";
  amountCents: number;
  interval: string;
  organization: string;
  paymentMethod: string;
  recipient: string;
  settlements: number;
  streamDurationSeconds: number;
  streamIntervalSeconds: number;
  stripeReceipt: string;
  stripeReceiptUrl?: string;
};

type SettlementEvent = {
  type: "settlement";
  amountCents: number;
  hash: string;
  index: number;
  streamedCents: number;
  totalCents: number;
};

type CompleteEvent = {
  type: "complete";
  amountCents: number;
  lastHash: string;
  recipient: string;
  settlements: number;
};

type ErrorEvent = {
  type: "error";
  message: string;
};

type TempoEvent =
  | PreparingEvent
  | ReadyEvent
  | SettlementEvent
  | CompleteEvent
  | ErrorEvent;

type ReceiptStatus =
  | "awaiting-confirmation"
  | "awaiting-payment"
  | "pending"
  | "running"
  | "complete"
  | "error"
  | "payment-failed";

type ViewStatus = ReceiptStatus | "connecting" | "unavailable";

const receiptStatuses: ReceiptStatus[] = [
  "awaiting-confirmation",
  "awaiting-payment",
  "pending",
  "running",
  "complete",
  "error",
  "payment-failed",
];

function isReceiptStatus(value: unknown): value is ReceiptStatus {
  return receiptStatuses.includes(value as ReceiptStatus);
}

function cents(value: number) {
  return `$${(value / 100).toFixed(2)}`;
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function streamTime(seconds?: number) {
  if (!seconds) return "pending";
  return seconds < 60 ? `${seconds}s` : `${seconds / 60}m`;
}

export function TempoStream({
  sessionId,
  fallbackOrganization,
}: {
  sessionId: string;
  fallbackOrganization: string;
}) {
  const streamRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<ViewStatus>("connecting");
  const [events, setEvents] = useState<TempoEvent[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    streamRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    // Display-only: the Stripe webhook triggers all Tempo settlement work.
    // This component only polls the durable receipt state.
    const abort = new AbortController();
    let stopped = false;

    async function poll() {
      setRequestError(null);
      try {
        while (!stopped) {
          const response = await fetch(
            `/api/tempo/stream?sessionId=${encodeURIComponent(sessionId)}`,
            { signal: abort.signal },
          );
          const data = (await response.json().catch(() => ({}))) as {
            status?: unknown;
            events?: TempoEvent[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(data.error ?? "The receipt state is unavailable.");
          }
          if (!isReceiptStatus(data.status)) {
            throw new Error("The receipt returned an unknown status.");
          }
          if (!Array.isArray(data.events)) {
            throw new Error("The receipt returned malformed events.");
          }

          setStatus(data.status);
          setEvents(data.events);

          if (
            data.status === "complete" ||
            data.status === "error" ||
            data.status === "payment-failed"
          ) {
            return;
          }
          await new Promise((resolve) => window.setTimeout(resolve, 1200));
        }
      } catch (caught) {
        if (abort.signal.aborted) return;
        setRequestError(
          caught instanceof Error
            ? caught.message
            : "The receipt state is unavailable.",
        );
        setStatus("unavailable");
      }
    }

    void poll();
    return () => {
      stopped = true;
      abort.abort();
    };
  }, [retryKey, sessionId]);

  const { ready, settlements, complete, eventError } = useMemo(() => {
    let readyEvent: ReadyEvent | null = null;
    let completeEvent: CompleteEvent | null = null;
    let errorEvent: ErrorEvent | null = null;
    const settlementEvents: SettlementEvent[] = [];

    for (const event of events) {
      if (event.type === "ready") readyEvent = event;
      if (event.type === "settlement") settlementEvents.push(event);
      if (event.type === "complete") completeEvent = event;
      if (event.type === "error") errorEvent = event;
    }

    return {
      ready: readyEvent,
      settlements: settlementEvents,
      complete: completeEvent,
      eventError: errorEvent,
    };
  }, [events]);
  const latest = settlements.at(-1);
  const amountCents = ready?.amountCents ?? complete?.amountCents ?? 0;
  const streamedCents = latest?.streamedCents ?? (complete ? amountCents : 0);
  const totalSettlements = ready?.settlements ?? complete?.settlements ?? 20;
  const progress =
    amountCents > 0 ? Math.min(100, (streamedCents / amountCents) * 100) : 0;
  const organization = ready?.organization ?? fallbackOrganization;
  const lastHash = complete?.lastHash ?? latest?.hash;
  const orderedSettlements = useMemo(
    () => settlements.slice().reverse(),
    [settlements],
  );
  const stripeVerified =
    status === "pending" ||
    status === "running" ||
    status === "complete" ||
    status === "error";
  const paymentFailed = status === "payment-failed";
  const error =
    requestError ??
    eventError?.message ??
    (paymentFailed
      ? "Stripe reported this payment as failed. No Tempo settlements were started."
      : null);
  const displayState =
    status === "unavailable" || paymentFailed ? "error" : status;
  const heading = paymentFailed
    ? "Payment not completed."
    : !stripeVerified
      ? "Confirming your contribution."
      : status === "complete"
        ? "Every settlement landed."
        : status === "error"
          ? "The testnet receipt needs attention."
          : "The testnet transfers are moving.";
  const stateLabel = {
    connecting: "Loading receipt",
    "awaiting-confirmation": "Waiting for Stripe",
    "awaiting-payment": "Payment pending",
    pending: "Preparing Tempo",
    running: "Sending test transfers",
    complete: "Complete",
    error: "Tempo paused",
    "payment-failed": "Payment failed",
    unavailable: "Receipt unavailable",
  }[status];
  const stripeDetail = stripeVerified
    ? "Payment verified"
    : paymentFailed
      ? "Payment failed"
      : status === "awaiting-payment"
        ? "Payment pending"
        : "Awaiting confirmation";

  return (
    <section className="tempo-stream" ref={streamRef}>
      <header className="tempo-stream-hero">
        <div>
          <p className="pledge-kicker">
            {stripeVerified ? "Testnet receipt" : "Receipt status"}
          </p>
          <h1>{heading}</h1>
          <p>
            {paymentFailed
              ? "Stripe did not complete this payment, so Tend did not start any Tempo settlement work."
              : !stripeVerified
                ? "Stripe is still confirming this Checkout session. Tempo settlement will remain stopped until the payment webhook verifies it."
                : status === "error"
                  ? "Stripe verified the payment. The Tempo testnet receipt needs attention."
                  : `Stripe verified the payment. Tend is mirroring it as ${totalSettlements} pathUSD transfers on Tempo’s public testnet.`}
          </p>
        </div>
        <div
          className="tempo-stream-state"
          data-state={displayState}
          role="status"
          aria-live="polite"
        >
          {status === "complete" ? (
            <Check size={15} />
          ) : paymentFailed ? (
            <CircleX size={15} />
          ) : status === "error" || status === "unavailable" ? (
            <RotateCw size={15} />
          ) : (
            <LoaderCircle className="pledge-spinner" size={15} />
          )}
          {stateLabel}
        </div>
      </header>

      <div className="tempo-route-steps" aria-label="Payment settlement route">
        {[
          ["Stripe", stripeDetail, stripeVerified],
          [
            "Tempo",
            paymentFailed
              ? "Skipped"
              : stripeVerified
                ? `${settlements.length}/${totalSettlements} settled`
                : "Waiting for payment",
            stripeVerified && settlements.length > 0,
          ],
          [
            "Receipt",
            paymentFailed
              ? "Unavailable"
              : status === "complete"
                ? "Auditable"
                : stripeVerified
                  ? "Building"
                  : "Pending",
            status === "complete",
          ],
        ].map(([label, detail, active], index) => (
          <div
            key={String(label)}
            className="tempo-route-step"
            data-active={active}
          >
            <span>{active ? <Check size={13} /> : index + 1}</span>
            <div>
              <strong>{label}</strong>
              <small>{detail}</small>
            </div>
          </div>
        ))}
      </div>

      {!paymentFailed && (
        <div className="tempo-receipt-grid">
          <DonationReceipt
            kind="stream"
            status={
              status === "unavailable"
                ? "error"
                : !stripeVerified
                  ? "unverified"
                  : status === "complete"
                    ? "complete"
                    : status === "error"
                      ? "error"
                      : settlements.length
                        ? "streaming"
                        : "processing"
            }
            amountCents={amountCents}
            streamedCents={streamedCents}
            organization={organization}
            paymentMethod={ready?.paymentMethod}
            reference={ready?.stripeReceipt ?? sessionId}
            receiptUrl={ready?.stripeReceiptUrl}
            completedSettlements={settlements.length}
            settlements={totalSettlements}
            recipient={ready?.recipient ?? complete?.recipient}
            lastHash={lastHash}
            streamDurationSeconds={ready?.streamDurationSeconds}
            streamIntervalSeconds={ready?.streamIntervalSeconds}
          />
        </div>
      )}

      <div className="tempo-live-panel">
        {stripeVerified ? (
          <>
            <div className="tempo-live-summary">
              <div>
                <span>Streamed</span>
                <strong>
                  {cents(streamedCents)}
                  <small> / {cents(amountCents)}</small>
                </strong>
              </div>
              <div className="tempo-live-counter" aria-live="polite">
                <Radio size={14} />
                {settlements.length} of {totalSettlements} · every{" "}
                {streamTime(ready?.streamIntervalSeconds)}
              </div>
            </div>

            <div
              className="tempo-progress"
              role="progressbar"
              aria-label="Tempo payment stream progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </>
        ) : (
          <div className="tempo-transaction-empty" aria-live="polite">
            {paymentFailed ? (
              <CircleX size={16} />
            ) : status === "unavailable" ? (
              <RotateCw size={16} />
            ) : (
              <LoaderCircle className="pledge-spinner" size={16} />
            )}
            {paymentFailed
              ? "No Tempo settlement was started."
              : status === "awaiting-payment"
                ? "Waiting for Stripe to complete the payment."
                : status === "unavailable"
                  ? "The receipt state is temporarily unavailable."
                  : "Waiting for the Stripe webhook confirmation."}
          </div>
        )}

        {stripeVerified && (
          <div className="tempo-latest-settlement" aria-live="polite">
            {latest ? (
              <a
                className="tempo-transaction"
                href={`https://explore.testnet.tempo.xyz/tx/${latest.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <Check size={12} /> Latest · #{latest.index}
                </span>
                <strong>{cents(latest.amountCents)} pathUSD</strong>
                <code>{shortHash(latest.hash)}</code>
                <ExternalLink size={12} />
              </a>
            ) : (
              <div className="tempo-transaction-empty">
                {status === "error" ? (
                  <RotateCw size={16} />
                ) : (
                  <LoaderCircle className="pledge-spinner" size={16} />
                )}
                {status === "error"
                  ? "No new settlements are arriving."
                  : "Funding the testnet stream."}
              </div>
            )}
          </div>
        )}

        {orderedSettlements.length > 0 && (
          <details className="tempo-transaction-details">
            <summary>
              <span>Onchain transactions</span>
              <small>{orderedSettlements.length} confirmed</small>
            </summary>
            <div className="tempo-transactions">
              {orderedSettlements.map((settlement) => (
                <a
                  key={settlement.hash}
                  className="tempo-transaction"
                  href={`https://explore.testnet.tempo.xyz/tx/${settlement.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    <Check size={12} /> #{settlement.index}
                  </span>
                  <strong>{cents(settlement.amountCents)} pathUSD</strong>
                  <code>{shortHash(settlement.hash)}</code>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </details>
        )}

        {error && (
          <div className="tempo-stream-error" role="alert">
            <p>{error}</p>
            {!paymentFailed && (
              <button
                type="button"
                onClick={() => {
                  setStatus("connecting");
                  setRetryKey((key) => key + 1);
                }}
              >
                Check receipt again
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
