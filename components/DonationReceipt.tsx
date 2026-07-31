"use client";

import { Check, Copy, ExternalLink, Radio } from "lucide-react";
import { useState } from "react";

type ReceiptStatus = "processing" | "verified" | "streaming" | "complete" | "error";

type Props = {
  amountCents: number;
  completedSettlements?: number;
  interval?: string;
  kind: "donation" | "stream";
  lastHash?: string;
  organization: string;
  paymentMethod?: string;
  recipient?: string;
  reference?: string;
  receiptUrl?: string;
  settlements?: number;
  status: ReceiptStatus;
  streamDurationSeconds?: number;
  streamIntervalSeconds?: number;
  streamedCents?: number;
};

function short(value?: string, start = 8, end = 6) {
  if (!value) return "—";
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

function ReceiptEdge({ bottom = false }: { bottom?: boolean }) {
  return (
    <svg
      className="tend-receipt-edge"
      viewBox="0 0 240 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={
          bottom
            ? "M0,0 L0,6 Q4,12 8,6 Q12,0 16,6 Q20,12 24,6 Q28,0 32,6 Q36,12 40,6 Q44,0 48,6 Q52,12 56,6 Q60,0 64,6 Q68,12 72,6 Q76,0 80,6 Q84,12 88,6 Q92,0 96,6 Q100,12 104,6 Q108,0 112,6 Q116,12 120,6 Q124,0 128,6 Q132,12 136,6 Q140,0 144,6 Q148,12 152,6 Q156,0 160,6 Q164,12 168,6 Q172,0 176,6 Q180,12 184,6 Q188,0 192,6 Q196,12 200,6 Q204,0 208,6 Q212,12 216,6 Q220,0 224,6 Q228,12 232,6 Q236,0 240,6 L240,0 Z"
            : "M0,12 L0,6 Q4,0 8,6 Q12,12 16,6 Q20,0 24,6 Q28,12 32,6 Q36,0 40,6 Q44,12 48,6 Q52,0 56,6 Q60,12 64,6 Q68,0 72,6 Q76,12 80,6 Q84,0 88,6 Q92,12 96,6 Q100,0 104,6 Q108,12 112,6 Q116,0 120,6 Q124,12 128,6 Q132,0 136,6 Q140,12 144,6 Q148,0 152,6 Q156,12 160,6 Q164,0 168,6 Q172,12 176,6 Q180,0 184,6 Q188,12 192,6 Q196,0 200,6 Q204,12 208,6 Q212,0 216,6 Q220,12 224,6 Q228,0 232,6 Q236,12 240,6 L240,12 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function DonationReceipt({
  amountCents,
  completedSettlements = 0,
  interval = "once",
  kind,
  lastHash,
  organization,
  paymentMethod = "Stripe Checkout",
  recipient,
  reference,
  receiptUrl,
  settlements = 20,
  status,
  streamDurationSeconds,
  streamIntervalSeconds,
  streamedCents = 0,
}: Props) {
  const [copied, setCopied] = useState(false);
  const isStream = kind === "stream";
  const isComplete = status === "complete" || status === "verified";
  const displayAmount = isStream ? streamedCents : amountCents;
  const copyValue = lastHash ?? reference ?? "";

  async function copyReference() {
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article
      className="tend-receipt-wrap"
      data-kind={kind}
      data-state={status}
    >
      {isComplete && <div className="tend-receipt-ring" aria-hidden="true" />}
      <div className="tend-receipt">
        <ReceiptEdge />
        <div className="tend-receipt-paper">
          <header className="tend-receipt-header">
            <span>{isStream ? "Donation stream receipt" : "Stripe donation"}</span>
            <span className="tend-receipt-status">
              {status === "processing" && <Radio size={11} />}
              {status === "streaming" && <Radio size={11} />}
              {isComplete && <Check size={11} />}
              {status === "error" ? "Interrupted" : status}
            </span>
          </header>

          <div className="tend-receipt-total">
            <strong>${(displayAmount / 100).toFixed(2)}</strong>
            {isStream && (
              <span>of ${(amountCents / 100).toFixed(2)} pathUSD</span>
            )}
            {!isStream && (
              <span>{interval === "once" ? "one-time contribution" : `${interval}ly contribution`}</span>
            )}
          </div>

          <div className="tend-receipt-rule" />

          <dl className="tend-receipt-lines">
            <div>
              <dt>{isStream ? "For" : "To"}</dt>
              <dd>{organization}</dd>
            </div>
            {isStream ? (
              <>
                <div>
                  <dt>Paid with</dt>
                  <dd>{paymentMethod}</dd>
                </div>
                <div>
                  <dt>Stripe receipt</dt>
                  <dd>{short(reference, 10, 5)}</dd>
                </div>
                <div>
                  <dt>Settled</dt>
                  <dd>
                    {completedSettlements} / {settlements}
                  </dd>
                </div>
                <div>
                  <dt>Cadence</dt>
                  <dd>
                    Every {streamIntervalSeconds ?? "—"}s for{" "}
                    {streamDurationSeconds
                      ? streamDurationSeconds < 60
                        ? `${streamDurationSeconds}s`
                        : `${streamDurationSeconds / 60}m`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Network</dt>
                  <dd>Tempo Moderato · testnet</dd>
                </div>
                <div>
                  <dt>Demo treasury</dt>
                  <dd>{short(recipient)}</dd>
                </div>
                <div>
                  <dt>Last transaction</dt>
                  <dd>{short(lastHash)}</dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt>Paid with</dt>
                  <dd>{paymentMethod}</dd>
                </div>
                <div>
                  <dt>Processor</dt>
                  <dd>Stripe Checkout</dd>
                </div>
                <div>
                  <dt>Receipt</dt>
                  <dd>{short(reference, 10, 5)}</dd>
                </div>
              </>
            )}
          </dl>

          <div className="tend-receipt-rule" />

          <div className="tend-receipt-confirmation">
            <span>
              <i aria-hidden="true" />
              {status === "complete"
                ? "All settlements confirmed"
                : status === "verified"
                  ? "Payment verified"
                  : status === "error"
                    ? "Needs attention"
                    : isStream
                      ? "Settling on Tempo"
                      : "Verifying payment"}
            </span>
            {copyValue && (
              <button type="button" onClick={copyReference}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy ID"}
              </button>
            )}
          </div>
        </div>
        <ReceiptEdge bottom />
      </div>

      {(lastHash || receiptUrl) && (
        <div className="tend-receipt-links">
          {receiptUrl && (
            <a
              className="tend-receipt-explorer"
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
            >
              Stripe receipt <ExternalLink size={13} />
            </a>
          )}
          {lastHash && (
            <a
              className="tend-receipt-explorer"
              href={`https://explore.testnet.tempo.xyz/tx/${lastHash}`}
              target="_blank"
              rel="noreferrer"
            >
              Tempo transaction <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
