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
    const abort = new AbortController();

    async function connect() {
      setError(null);
      try {
        const response = await fetch("/api/tempo/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          signal: abort.signal,
        });
        if (!response.ok || !response.body) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "The settlement stream could not start.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const packets = buffer.split("\n\n");
          buffer = packets.pop() ?? "";

          for (const packet of packets) {
            const line = packet
              .split("\n")
              .find((candidate) => candidate.startsWith("data: "));
            if (!line) continue;
            const event = JSON.parse(line.slice(6)) as TempoEvent;

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
        }
      } catch (caught) {
        if (abort.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "The settlement stream could not start.",
        );
        setStatus("error");
      }
    }

    void connect();
    return () => abort.abort();
  }, [retryKey, sessionId]);

  const latest = settlements.at(-1);
  const amountCents = ready?.amountCents ?? complete?.amountCents ?? 0;
  const streamedCents = latest?.streamedCents ?? (complete ? amountCents : 0);
  const totalSettlements = ready?.settlements ?? complete?.settlements ?? 20;
  const progress =
    amountCents > 0 ? Math.min(100, (streamedCents / amountCents) * 100) : 0;
  const organization = ready?.organization ?? fallbackOrganization;
  const lastHash = complete?.lastHash ?? latest?.hash;
  const visibleSettlements = useMemo(
    () => settlements.slice(-5).reverse(),
    [settlements],
  );

  return (
    <section className="tempo-stream">
      <header className="tempo-stream-hero">
        <div>
          <p className="pledge-kicker">Live receipt</p>
          <h1>
            {status === "complete"
              ? "Every settlement landed."
              : "Your contribution is moving."}
          </h1>
          <p>
            Stripe verified the payment. Tend is now mirroring it as twenty
            real AlphaUSD transfers on Tempo’s public testnet.
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
          {status === "streaming" && "Streaming live"}
          {status === "complete" && "Complete"}
          {status === "error" && "Connection paused"}
        </div>
      </header>

      <div className="tempo-route-steps" aria-label="Payment settlement route">
        {[
          ["Stripe", "Payment verified", true],
          ["Tempo", `${settlements.length}/${totalSettlements} settled`, settlements.length > 0],
          ["Receipt", status === "complete" ? "Auditable" : "Building", status === "complete"],
        ].map(([label, detail, active], index) => (
          <div key={String(label)} className="tempo-route-step" data-active={active}>
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
          kind="donation"
          status={ready ? "verified" : status === "error" ? "error" : "processing"}
          amountCents={amountCents}
          organization={organization}
          interval={ready?.interval}
          paymentMethod={ready?.paymentMethod}
          reference={ready?.stripeReceipt ?? sessionId}
          receiptUrl={ready?.stripeReceiptUrl}
        />
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
          completedSettlements={settlements.length}
          settlements={totalSettlements}
          recipient={ready?.recipient ?? complete?.recipient}
          lastHash={lastHash}
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
            {settlements.length} of {totalSettlements}
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

        <div className="tempo-transactions" aria-live="polite">
          {visibleSettlements.length === 0 ? (
            <div className="tempo-transaction-empty">
              <LoaderCircle className="pledge-spinner" size={16} />
              {status === "connecting"
                ? "Checking the Stripe receipt…"
                : status === "error"
                  ? "No new settlements are arriving."
                  : "Funding the testnet stream…"}
            </div>
          ) : (
            visibleSettlements.map((settlement) => (
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
                <strong>{cents(settlement.amountCents)} AlphaUSD</strong>
                <code>{shortHash(settlement.hash)}</code>
                <ExternalLink size={12} />
              </a>
            ))
          )}
        </div>

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
