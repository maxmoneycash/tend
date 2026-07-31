"use client";

import { Check, ExternalLink, LoaderCircle, Radio, RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

type StreamStatus = "connecting" | "preparing" | "streaming" | "complete" | "error";

function cents(value: number) {
  return `$${(value / 100).toFixed(2)}`;
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function streamTime(seconds?: number) {
  if (!seconds) return "—";
  return seconds < 60 ? `${seconds}s` : `${seconds / 60}m`;
}

export function TempoStream({
  sessionId,
  fallbackOrganization,
}: {
  sessionId: string;
  fallbackOrganization: string;
}) {
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [ready, setReady] = useState<ReadyEvent | null>(null);
  const [settlements, setSettlements] = useState<SettlementEvent[]>([]);
  const [complete, setComplete] = useState<CompleteEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    // Display-only: the Stripe webhook triggers all Tempo settlement work.
    // This component just polls the durable receipt state and renders it.
    const abort = new AbortController();
    let stopped = false;

    async function poll() {
      setError(null);
      try {
        while (!stopped) {
          const response = await fetch(
            `/api/tempo/stream?sessionId=${encodeURIComponent(sessionId)}`,
            { signal: abort.signal },
          );
          const data = (await response.json()) as {
            status?: string;
            events?: TempoEvent[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(data.error ?? "The receipt state is unavailable.");
          }

          if (data.status === "payment-failed") {
            setError(
              "Stripe reported this payment as failed. No settlements will stream.",
            );
            setStatus("error");
            return;
          }

          for (const event of data.events ?? []) {
            if (event.type === "preparing") {
              setStatus("preparing");
            } else if (event.type === "ready") {
              setReady(event);
              setStatus("preparing");
            } else if (event.type === "settlement") {
              setSettlements((current) => {
                if (current.some((item) => item.hash === event.hash)) return current;
                return [...current, event];
              });
              setStatus("streaming");
            } else if (event.type === "complete") {
              setComplete(event);
              setStatus("complete");
            } else if (event.type === "error") {
              setError(event.message);
              setStatus("error");
            }
          }

          if (data.status === "complete" || data.status === "error") return;
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      } catch (caught) {
        if (abort.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "The receipt state is unavailable.",
        );
        setStatus("error");
      }
    }

    void poll();
    return () => {
      stopped = true;
      abort.abort();
    };
  }, [retryKey, sessionId]);

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

  return (
    <section className="tempo-stream">
      <header className="tempo-stream-hero">
        <div>
          <p className="pledge-kicker">Test receipt</p>
          <h1>
            {status === "complete"
              ? "Every settlement landed."
              : "Your contribution is moving."}
          </h1>
          <p>
            Stripe verified the payment. Tend is now mirroring it as{" "}
            {totalSettlements} real pathUSD transfers on Tempo’s public
            testnet.
          </p>
        </div>
        <div className="tempo-stream-state" data-state={status}>
          {status === "complete" ? (
            <Check size={15} />
          ) : status === "error" ? (
            <RotateCw size={15} />
          ) : (
            <LoaderCircle className="pledge-spinner" size={15} />
          )}
          {status === "connecting" && "Verifying Stripe"}
          {status === "preparing" && "Preparing Tempo"}
          {status === "streaming" && "Streaming test receipt"}
          {status === "complete" && "Complete"}
          {status === "error" && "Connection paused"}
        </div>
      </header>

      <div className="tempo-route-steps" aria-label="Payment settlement route">
        {[
          ["Stripe", "Payment verified", true],
          [
            "Tempo",
            `${settlements.length}/${totalSettlements} settled`,
            settlements.length > 0,
          ],
          [
            "Receipt",
            status === "complete" ? "Auditable" : "Building",
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

      <div className="tempo-receipt-grid">
        <DonationReceipt
          kind="stream"
          status={
            status === "complete"
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

      <div className="tempo-live-panel">
        <div className="tempo-live-summary">
          <div>
            <span>Streamed</span>
            <strong>
              {cents(streamedCents)}
              <small> / {cents(amountCents)}</small>
            </strong>
          </div>
          <div className="tempo-live-counter">
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
              <LoaderCircle className="pledge-spinner" size={16} />
              {status === "connecting"
                ? "Checking the Stripe receipt…"
                : status === "error"
                  ? "No new settlements are arriving."
                  : "Funding the testnet stream…"}
            </div>
          )}
        </div>

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
            <button
              type="button"
              onClick={() => {
                setStatus("connecting");
                setRetryKey((key) => key + 1);
              }}
            >
              Reconnect to receipt
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
