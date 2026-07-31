"use client";

import {
  Check,
  CircleX,
  ExternalLink,
  LoaderCircle,
  Radio,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DonationReceipt } from "@/components/DonationReceipt";
import {
  awaitingPaymentUpdateCopy,
  receiptRefreshRecoveryCopy,
  terminalPaymentFailureRecoveryCopy,
  terminalSettlementErrorCopy,
} from "@/lib/receipt-copy";

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

function getViewCopy(
  status: ViewStatus,
  settled: number,
  total: number,
  hasVerifiedPayment: boolean,
) {
  switch (status) {
    case "connecting":
      return {
        announcement: "Loading your test receipt.",
        heading: "Loading your test receipt.",
        intro:
          "Tend is checking this Checkout session for its latest test payment status.",
        panel: "Checking the latest test payment status.",
        stateLabel: "Loading receipt",
      };
    case "awaiting-confirmation":
      return awaitingPaymentUpdateCopy();
    case "awaiting-payment":
      return {
        announcement: "The test payment is pending in Stripe.",
        heading: "Your test payment is pending.",
        intro:
          "Stripe still lists this test payment as pending. Tempo testnet transfers will start after payment confirmation.",
        panel: "Waiting for Stripe to confirm the test payment.",
        stateLabel: "Payment pending (test mode)",
      };
    case "pending":
      return {
        announcement: "Test payment verified. Preparing the testnet receipt.",
        heading: "Preparing the testnet receipt.",
        intro:
          "Stripe verified the test payment. Tend is preparing the pathUSD transfers on Tempo’s public testnet.",
        panel: "Preparing the Tempo testnet stream.",
        stateLabel: "Preparing test transfers",
      };
    case "running":
      if (settled === 0) {
        return {
          announcement:
            "Test payment verified. Preparing the first testnet transfer.",
          heading: "Preparing the first testnet transfer.",
          intro:
            "Stripe verified the test payment. Tend is preparing the first pathUSD transfer on Tempo’s public testnet.",
          panel: "Funding the Tempo testnet stream.",
          stateLabel: "Preparing first transfer",
        };
      }
      return {
        announcement: `${settled} of ${total} testnet transfers settled.`,
        heading: "The testnet transfers are moving.",
        intro: `${settled} of ${total} pathUSD test transfers have settled on Tempo’s public testnet.`,
        panel: "Waiting for the next testnet settlement.",
        stateLabel: `${settled} of ${total} settled`,
      };
    case "complete":
      return {
        announcement:
          total > 0
            ? `Receipt complete. ${total} of ${total} testnet transfers settled.`
            : "Receipt complete. All testnet transfers settled.",
        heading: "Every settlement landed.",
        intro:
          total > 0
            ? `Stripe verified the test payment. All ${total} pathUSD test transfers settled on Tempo’s public testnet.`
            : "Stripe verified the test payment. All pathUSD test transfers settled on Tempo’s public testnet.",
        panel: "All testnet settlements are confirmed.",
        stateLabel: "Receipt complete",
      };
    case "error":
      return {
        announcement: terminalSettlementErrorCopy(settled, total),
        heading: "The testnet transfers stopped.",
        intro:
          settled > 0 && total > 0
            ? `Stripe verified the test payment. ${settled} of ${total} pathUSD test transfers settled before the stream stopped.`
            : "Stripe verified the test payment. The Tempo testnet stream stopped before a transfer settled.",
        panel:
          settled > 0
            ? "Confirmed test transfers remain on this receipt."
            : "No test transfers are confirmed on this receipt.",
        stateLabel: "Test transfers stopped",
      };
    case "payment-failed":
      return {
        announcement:
          "Stripe marked the test payment as failed. No Tempo testnet transfers started.",
        heading: "Test payment failed.",
        intro:
          "Stripe marked this test payment as failed. No Tempo testnet transfers started.",
        panel: "No Tempo testnet transfers started.",
        stateLabel: "Test payment failed",
      };
    case "unavailable": {
      const recovery = receiptRefreshRecoveryCopy(hasVerifiedPayment);
      return {
        announcement: recovery,
        heading: "Receipt status unavailable.",
        intro: hasVerifiedPayment
          ? "Tend could not refresh this test receipt. The last confirmed details remain below."
          : "Tend could not load the latest saved status for this test receipt.",
        panel: hasVerifiedPayment
          ? "Showing the last confirmed testnet settlement status."
          : "The latest test receipt status is unavailable.",
        stateLabel: "Receipt unavailable",
      };
    }
  }
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
            { method: "GET", signal: abort.signal },
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
  const totalSettlements = ready?.settlements ?? complete?.settlements ?? 0;
  const hasStreamPlan = Boolean(ready || complete);
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
    status === "error" ||
    Boolean(ready || complete || eventError);
  const paymentFailed = status === "payment-failed";
  const terminalSettlementError =
    status === "error"
      ? terminalSettlementErrorCopy(
          settlements.length,
          totalSettlements,
        )
      : null;
  const paymentFailureRecovery = paymentFailed
    ? terminalPaymentFailureRecoveryCopy()
    : null;
  const unavailableRecovery =
    status === "unavailable"
      ? receiptRefreshRecoveryCopy(stripeVerified)
      : null;
  const error =
    unavailableRecovery ??
    terminalSettlementError ??
    eventError?.message ??
    (paymentFailed
      ? "Stripe marked this test payment as failed. No Tempo testnet transfers started."
      : null);
  const errorAnnouncement =
    error && paymentFailureRecovery
      ? `${error} ${paymentFailureRecovery}`
      : error;
  const canRetry = Boolean(requestError) || status === "unavailable";
  const displayState =
    status === "unavailable" || paymentFailed ? "error" : status;
  const viewCopy = getViewCopy(
    status,
    settlements.length,
    totalSettlements,
    stripeVerified,
  );
  const awaitingPaymentUpdate =
    status === "awaiting-confirmation" ? awaitingPaymentUpdateCopy() : null;
  const stripeDetail = stripeVerified
    ? "Test payment verified"
    : paymentFailed
      ? "Test payment failed"
      : status === "awaiting-payment"
        ? "Test payment pending"
        : status === "unavailable"
          ? "Status unavailable"
          : status === "awaiting-confirmation"
            ? "Waiting for Stripe update"
            : "Checking status";
  const tempoDetail = paymentFailed
    ? "Skipped"
    : status === "unavailable"
      ? hasStreamPlan
        ? `${settlements.length}/${totalSettlements} last confirmed`
        : "Status unavailable"
      : !stripeVerified
        ? "Waiting for test payment"
        : hasStreamPlan
          ? `${settlements.length}/${totalSettlements} settled`
          : "Preparing transfers";
  const receiptDetail = paymentFailed
    ? "Not created"
    : status === "unavailable"
      ? "Refresh failed"
      : status === "complete"
        ? "Complete"
        : status === "error"
          ? "Stopped"
          : stripeVerified
            ? "Building"
            : "Pending";
  const routeSteps = [
    {
      active: stripeVerified,
      current:
        !stripeVerified && !paymentFailed && status !== "unavailable",
      detail: stripeDetail,
      label: "Stripe",
    },
    {
      active: stripeVerified && settlements.length > 0,
      current:
        stripeVerified &&
        status !== "complete" &&
        status !== "error" &&
        status !== "unavailable",
      detail: tempoDetail,
      label: "Tempo",
    },
    {
      active: status === "complete",
      current: status === "complete",
      detail: receiptDetail,
      label: "Receipt",
    },
  ];

  return (
    <section className="tempo-stream" ref={streamRef}>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {error ? "" : viewCopy.announcement}
      </p>
      {errorAnnouncement && (
        <p className="sr-only" role="alert" aria-atomic="true">
          {errorAnnouncement}
        </p>
      )}
      <header className="tempo-stream-hero">
        <div>
          <p className="pledge-kicker">
            {stripeVerified ? "Testnet receipt" : "Receipt status"}
          </p>
          <h1>{viewCopy.heading}</h1>
          <p>{viewCopy.intro}</p>
        </div>
        <div
          className="tempo-stream-state"
          data-state={displayState}
        >
          {status === "complete" ? (
            <Check size={15} aria-hidden="true" />
          ) : paymentFailed ? (
            <CircleX size={15} aria-hidden="true" />
          ) : status === "error" ? (
            <CircleX size={15} aria-hidden="true" />
          ) : status === "unavailable" ? (
            <RotateCw size={15} aria-hidden="true" />
          ) : (
            <LoaderCircle
              className="pledge-spinner"
              size={15}
              aria-hidden="true"
            />
          )}
          {viewCopy.stateLabel}
        </div>
      </header>

      <div
        className="tempo-route-steps"
        aria-label="Payment settlement route"
        role="list"
      >
        {routeSteps.map(({ active, current, detail, label }, index) => (
          <div
            key={label}
            className="tempo-route-step"
            data-active={active}
            role="listitem"
            aria-current={current ? "step" : undefined}
            aria-label={`${label}: ${detail}`}
          >
            <span aria-hidden="true">
              {active ? <Check size={13} /> : index + 1}
            </span>
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
                ? "unavailable"
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
            unverifiedConfirmation={awaitingPaymentUpdate?.receiptConfirmation}
            unverifiedDetail={awaitingPaymentUpdate?.receiptDetail}
            unverifiedStatusLabel={awaitingPaymentUpdate?.receiptStatusLabel}
          />
        </div>
      )}

      <div className="tempo-live-panel">
        {stripeVerified && hasStreamPlan ? (
          <>
            <div className="tempo-live-summary">
              <div>
                <span>Settled on testnet</span>
                <strong>
                  {cents(streamedCents)}
                  <small> / {cents(amountCents)}</small>
                </strong>
              </div>
              <div className="tempo-live-counter">
                <Radio size={14} aria-hidden="true" />
                {settlements.length} of {totalSettlements} test transfers · every{" "}
                {streamTime(ready?.streamIntervalSeconds)}
              </div>
            </div>

            <div
              className="tempo-progress"
              role="progressbar"
              aria-label="Tempo testnet transfer progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-valuetext={`${settlements.length} of ${totalSettlements} test transfers settled`}
            >
              <div style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </>
        ) : (
          <div className="tempo-transaction-empty">
            {paymentFailed ? (
              <CircleX size={16} aria-hidden="true" />
            ) : status === "unavailable" ? (
              <RotateCw size={16} aria-hidden="true" />
            ) : (
              <LoaderCircle
                className="pledge-spinner"
                size={16}
                aria-hidden="true"
              />
            )}
            {viewCopy.panel}
          </div>
        )}

        {stripeVerified && hasStreamPlan && (
          <div className="tempo-latest-settlement">
            {latest ? (
              <a
                className="tempo-transaction"
                href={`https://explore.testnet.tempo.xyz/tx/${latest.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <Check size={12} aria-hidden="true" /> Latest · #{latest.index}
                </span>
                <strong>{cents(latest.amountCents)} pathUSD</strong>
                <code>{shortHash(latest.hash)}</code>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <div className="tempo-transaction-empty">
                {status === "error" ? (
                  <CircleX size={16} aria-hidden="true" />
                ) : (
                  <LoaderCircle
                    className="pledge-spinner"
                    size={16}
                    aria-hidden="true"
                  />
                )}
                {viewCopy.panel}
              </div>
            )}
          </div>
        )}

        {orderedSettlements.length > 0 && (
          <details className="tempo-transaction-details">
            <summary>
              <span>Testnet transactions</span>
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
                    <Check size={12} aria-hidden="true" /> #{settlement.index}
                  </span>
                  <strong>{cents(settlement.amountCents)} pathUSD</strong>
                  <code>{shortHash(settlement.hash)}</code>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              ))}
            </div>
          </details>
        )}

        {error && (
          <div className="tempo-stream-error">
            <p>{paymentFailureRecovery ?? error}</p>
            {paymentFailed ? (
              <Link href="/pledge" className="btn tnd-btn-primary">
                Start a new test pledge
              </Link>
            ) : canRetry ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("connecting");
                  setRetryKey((key) => key + 1);
                }}
              >
                Check receipt again
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
