/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
/* Hallmark · component: donor amount + delivery controls · genre: playful editorial · theme: Tend locked system
 * states: default · hover · focus · active · disabled · loading · error · success · contrast: pass
 */
"use client";

import { CreditCard, ReceiptText, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingButton } from "@/components/interior/LoadingButton";
import {
  consumeCheckoutIntent,
  startCheckout,
  type CheckoutInterval,
  type CheckoutIntent,
} from "@/lib/checkout-client";
import {
  DEFAULT_STREAM_INTERVAL_SECONDS,
  streamDurationForInterval,
  type StreamIntervalSeconds,
} from "@/lib/stream-plan";

function cleanAmount(value: string) {
  const clean = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = clean.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

const PAYMENT_FREQUENCIES = [
  { value: "once", label: "One time" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
] satisfies Array<{ value: CheckoutInterval; label: string }>;

export function StreamPanel({
  demo = false,
  programName,
  tribeId,
  tribeName,
}: {
  demo?: boolean;
  programName: string;
  tribeId: "ramaytush" | "muwekma";
  tribeName: string;
}) {
  const [amountInput, setAmountInput] = useState("20");
  const [amountTouched, setAmountTouched] = useState(false);
  const [interval, setInterval] = useState<CheckoutInterval>("once");
  const [streamIntervalSeconds, setStreamIntervalSeconds] =
    useState<StreamIntervalSeconds>(DEFAULT_STREAM_INTERVAL_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumeAttempted = useRef(false);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  const selectedAmount = Number(amountInput);
  const amountValid =
    amountInput.trim().length > 0 &&
    Number.isFinite(selectedAmount) &&
    selectedAmount >= 1 &&
    selectedAmount <= 10_000;
  const amountHasError = amountTouched && !amountValid;
  const streamDurationSeconds = streamDurationForInterval(streamIntervalSeconds);
  const formattedAmount = amountValid ? selectedAmount.toFixed(2) : "—";
  const checkoutLabel =
    interval === "once"
      ? `Pay $${formattedAmount} with Stripe`
      : `Start $${formattedAmount} ${interval === "month" ? "monthly" : "yearly"} pledge`;

  const openCheckout = useCallback(
    async (intent: CheckoutIntent, resuming = false) => {
      setBusy(true);
      setError(null);
      try {
        await startCheckout(intent, { resuming });
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "The checkout preview didn’t open. Check your connection.";
        setError(
          message === "Stripe Checkout didn’t open. Check your connection."
            ? "The checkout preview didn’t open. Check your connection."
            : message,
        );
        setBusy(false);
        return false;
      }
      return true;
    },
    [],
  );

  useEffect(() => {
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;
    const expectedPath = `/programs/${tribeId}`;
    const intent = consumeCheckoutIntent(expectedPath);
    if (!intent || intent.tribeId !== tribeId) {
      return;
    }

    queueMicrotask(() => {
      const dollars = intent.amountCents / 100;
      setAmountInput(String(dollars));
      setAmountTouched(false);
      setInterval(intent.interval);
      setStreamIntervalSeconds(intent.streamIntervalSeconds);
      void openCheckout(
        {
          ...intent,
          streamDurationSeconds: streamDurationForInterval(
            intent.streamIntervalSeconds,
          ),
        },
        true,
      );
    });
  }, [openCheckout, tribeId]);

  useEffect(() => {
    if (error && !busy) {
      checkoutButtonRef.current?.focus();
    }
  }, [busy, error]);

  async function checkout() {
    if (!amountValid) throw new Error("Enter a donation amount first.");
    const opened = await openCheckout({
      tribeId,
      amountCents: Math.round(selectedAmount * 100),
      interval,
      streamDurationSeconds,
      streamIntervalSeconds,
      returnTo: `/programs/${tribeId}`,
    });
    if (!opened) throw new Error("Stripe Checkout did not open.");
  }

  return (
    <section
      className="donation-checkout"
      aria-labelledby="stream-title"
      aria-label={`Donation for ${tribeName}`}
      aria-busy={busy}
      data-state={error ? "error" : busy ? "loading" : "default"}
    >
      <header className="donation-checkout__header">
        <div>
          <h2 id="stream-title">Make a donation</h2>
          <p>{programName}</p>
        </div>
        <span className="donation-checkout__mode" role="note">
          {demo ? "Demo" : "Test mode"}
          <small>No real money</small>
        </span>
      </header>

      <div className="donation-checkout__body">
        <div
          className="donation-checkout__frequency"
          role="radiogroup"
          aria-label="Donation frequency"
        >
          {PAYMENT_FREQUENCIES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={interval === option.value}
              disabled={busy}
              onClick={() => setInterval(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="donation-checkout__amount">
          <span>{demo ? "Sample amount" : "Donation amount"}</span>
          <span
            className="donation-checkout__amount-field"
            data-invalid={amountHasError || undefined}
          >
            <span aria-hidden="true">$</span>
            <input
              aria-invalid={amountHasError || undefined}
              aria-describedby={amountHasError ? "donation-amount-error" : undefined}
              disabled={busy}
              inputMode="decimal"
              onBlur={() => setAmountTouched(true)}
              onChange={(event) => setAmountInput(cleanAmount(event.target.value))}
              value={amountInput}
            />
            <small>USD</small>
          </span>
          <small
            id="donation-amount-error"
            className="donation-checkout__amount-error"
            aria-live="polite"
          >
            {amountHasError ? "Enter $1 to $10,000." : ""}
          </small>
        </label>

        <div className="donation-checkout__assurances" aria-label="Checkout details">
          <span><CreditCard aria-hidden="true" size={16} /> Secure Stripe checkout</span>
          <span><ReceiptText aria-hidden="true" size={16} /> Receipt after payment</span>
        </div>

        <div className="donation-checkout__action">
          <LoadingButton
            ariaDescribedBy={error ? "stream-checkout-error" : undefined}
            buttonRef={checkoutButtonRef}
            className="donation-checkout__button"
            disabled={busy || !amountValid}
            errorLabel="Try checkout again"
            onAction={checkout}
            pendingLabel={demo ? "Opening preview" : "Opening Stripe"}
            successLabel={demo ? "Preview opened" : "Stripe opened"}
          >
            {demo ? "Open receipt preview" : checkoutLabel}
          </LoadingButton>

          {!demo && (
            <p className="donation-checkout__wallet-note">
              <ShieldCheck size={14} aria-hidden="true" />
              Apple Pay when available · $0 platform fee
            </p>
          )}

          {error && (
            <p id="stream-checkout-error" className="pledge-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
