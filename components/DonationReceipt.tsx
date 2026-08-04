"use client";

import { ArrowRight, Check, ExternalLink, Radio } from "lucide-react";
import { CopyButton } from "@/components/interior/CopyButton";
import {
  stripeHostedReceiptUrl,
  tempoTestnetAddressUrl,
  tempoTestnetTransactionUrl,
} from "@/lib/receipt-proof";

type ReceiptStatus =
  | "preview"
  | "unverified"
  | "processing"
  | "verified"
  | "streaming"
  | "complete"
  | "error"
  | "unavailable";

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
  unverifiedConfirmation?: string;
  unverifiedDetail?: string;
  unverifiedStatusLabel?: string;
};

function short(value?: string, start = 8, end = 6) {
  if (!value) return "Pending";
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
  unverifiedConfirmation = "Waiting for Stripe test confirmation",
  unverifiedDetail = "waiting for Stripe test confirmation",
  unverifiedStatusLabel = "Awaiting Stripe",
}: Props) {
  const isStream = kind === "stream";
  const isPreview = status === "preview";
  const isComplete = status === "complete" || status === "verified";
  const isUnverified = status === "unverified";
  const isUnavailable = status === "unavailable";
  const isPreparingAmount =
    isStream && status === "processing" && amountCents === 0;
  const isUnavailableAmount = isUnavailable && amountCents === 0;
  const hasStreamDetails = isStream && amountCents > 0;
  const displayAmount = isPreview
    ? amountCents
    : isStream
      ? streamedCents
      : amountCents;
  const copyValue = reference ?? lastHash ?? "";
  const copyButtonLabel = reference
    ? "Copy session ID"
    : "Copy transaction ID";
  const stripeReceiptUrl = stripeHostedReceiptUrl(receiptUrl);
  const recipientUrl = tempoTestnetAddressUrl(recipient);
  const lastTransactionUrl = tempoTestnetTransactionUrl(lastHash);
  const statusLabel = {
    preview: "Preview",
    unverified: unverifiedStatusLabel,
    processing: "Preparing",
    verified: "Test payment verified",
    streaming: "Settling",
    complete: "Complete",
    error: "Stopped",
    unavailable: "Unavailable",
  }[status];
  const confirmationLabel = {
    preview: "Proof appears after checkout",
    unverified: unverifiedConfirmation,
    processing: "Preparing testnet transfers",
    verified: "Test payment verified",
    streaming: `${completedSettlements} of ${settlements} test settlements confirmed`,
    complete: "All test settlements confirmed",
    error: "Test settlements stopped",
    unavailable: "Receipt refresh failed",
  }[status];

  if (isPreview) {
    return (
      <article className="donation-proof-preview">
        <header>
          <span>Your donation</span>
          <strong>{amountCents > 0 ? `$${(amountCents / 100).toFixed(2)}` : "—"}</strong>
        </header>
        <div className="donation-proof-route">
          <span><small>Card</small><strong>Secure checkout</strong></span>
          <ArrowRight size={16} aria-hidden="true" />
          <span><small>Drip</small><strong>{settlements} small payments</strong></span>
          <ArrowRight size={16} aria-hidden="true" />
          <span><small>Proof</small><strong>Live receipt</strong></span>
        </div>
        <footer>
          <span>{organization}</span>
          <span>Every {streamIntervalSeconds}s until fully sent</span>
        </footer>
      </article>
    );
  }

  return (
    <article
      className="tend-receipt-wrap"
      data-kind={kind}
      data-state={isUnavailable ? "error" : status}
    >
      {isComplete && <div className="tend-receipt-ring" aria-hidden="true" />}
      <div className="tend-receipt">
        <ReceiptEdge />
        <div className="tend-receipt-paper">
          <header className="tend-receipt-header">
            <span>
              {isPreview
                ? "Receipt preview"
                : isStream
                  ? "Testnet transfer receipt"
                  : "Stripe test receipt"}
            </span>
            <span className="tend-receipt-status">
              {(isUnverified ||
                status === "processing" ||
                status === "streaming") && (
                <Radio size={11} aria-hidden="true" />
              )}
              {isComplete && <Check size={11} aria-hidden="true" />}
              {statusLabel}
            </span>
          </header>

          <div className="tend-receipt-total">
            <strong>
              {isUnverified
                ? "Pending"
                : isPreparingAmount
                  ? "Preparing"
                  : isUnavailableAmount
                    ? "Unavailable"
                    : `$${(displayAmount / 100).toFixed(2)}`}
            </strong>
            {isUnverified && <span>{unverifiedDetail}</span>}
            {isPreparingAmount && (
              <span>test payment verified; preparing transfers</span>
            )}
            {isUnavailableAmount && (
              <span>receipt amount could not be loaded</span>
            )}
            {isPreview && <span>selected Stripe test amount</span>}
            {isStream &&
              !isPreview &&
              !isUnverified &&
              !isPreparingAmount &&
              !isUnavailableAmount && (
              <span>of ${(amountCents / 100).toFixed(2)} pathUSD</span>
            )}
            {!isStream && !isPreview && (
              <span>{interval === "once" ? "one-time test payment" : `${interval}ly test payment`}</span>
            )}
          </div>

          <div className="tend-receipt-rule" />

          <dl className="tend-receipt-lines">
            <div>
              <dt>Program reference</dt>
              <dd>{organization}</dd>
            </div>
            {hasStreamDetails ? (
              <>
                <div>
                  <dt>Paid with</dt>
                  <dd>{isPreview ? "Stripe Checkout · test" : paymentMethod}</dd>
                </div>
                <div>
                  <dt>Drip rate</dt>
                  <dd>
                    {streamIntervalSeconds && streamDurationSeconds
                      ? `Every ${streamIntervalSeconds}s until complete`
                      : "Preparing"}
                  </dd>
                </div>
                {!isPreview && (
                  <>
                    <div>
                      <dt>Progress</dt>
                      <dd>{completedSettlements} / {settlements}</dd>
                    </div>
                    <div>
                      <dt>Recipient</dt>
                      <dd>{recipient ? short(recipient) : "Preparing"}</dd>
                    </div>
                    <div>
                      <dt>Last transaction</dt>
                      <dd>{lastHash ? short(lastHash) : "None yet"}</dd>
                    </div>
                  </>
                )}
              </>
            ) : !isStream ? (
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
                  <dt>Checkout session ID</dt>
                  <dd>{short(reference, 10, 5)}</dd>
                </div>
              </>
            ) : (
              <div>
                <dt>Checkout session ID</dt>
                <dd>{short(reference, 10, 5)}</dd>
              </div>
            )}
          </dl>

          <div className="tend-receipt-rule" />

          <div className="tend-receipt-confirmation">
            <span>
              <i aria-hidden="true" />
              {confirmationLabel}
            </span>
            {copyValue && (
              <CopyButton
                className="tend-receipt-copy-interior"
                value={copyValue}
                label={copyButtonLabel}
                copiedLabel={
                  reference ? "Session ID copied" : "Transaction ID copied"
                }
                errorLabel="Try copy again"
              />
            )}
          </div>
        </div>
        <ReceiptEdge bottom />
      </div>

      {(lastTransactionUrl || recipientUrl || stripeReceiptUrl) && (
        <div className="tend-receipt-links">
          {stripeReceiptUrl && (
            <a
              className="tend-receipt-explorer"
              href={stripeReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the Stripe test receipt in a new tab"
            >
              View Stripe test receipt{" "}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
          {recipientUrl && (
            <a
              className="tend-receipt-explorer"
              href={recipientUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the recipient address on Tempo testnet in a new tab"
            >
              View recipient on Tempo testnet{" "}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
          {lastTransactionUrl && (
            <a
              className="tend-receipt-explorer"
              href={lastTransactionUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the last Tempo testnet transaction in a new tab"
            >
              View Tempo transaction on testnet{" "}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
