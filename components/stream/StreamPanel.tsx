"use client";

import {
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StreamTimingControls } from "@/components/stream/StreamTimingControls";
import {
  consumeCheckoutIntent,
  startCheckout,
  type CheckoutIntent,
} from "@/lib/checkout-client";
import {
  DEFAULT_STREAM_DURATION_SECONDS,
  DEFAULT_STREAM_INTERVAL_SECONDS,
  formatStreamTime,
  streamSettlementCount,
  type StreamDurationSeconds,
  type StreamIntervalSeconds,
} from "@/lib/stream-plan";

const AMOUNTS = [10, 20, 25, 50, 100];

function cleanAmount(value: string) {
  const clean = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = clean.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

export function StreamPanel({
  demo = false,
  tribeId,
  tribeName,
}: {
  demo?: boolean;
  tribeId: "ramaytush" | "muwekma";
  tribeName: string;
}) {
  const [amount, setAmount] = useState(20);
  const [custom, setCustom] = useState("");
  const [streamDurationSeconds, setStreamDurationSeconds] =
    useState<StreamDurationSeconds>(DEFAULT_STREAM_DURATION_SECONDS);
  const [streamIntervalSeconds, setStreamIntervalSeconds] =
    useState<StreamIntervalSeconds>(DEFAULT_STREAM_INTERVAL_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumeAttempted = useRef(false);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  const selectedAmount = custom ? Number(custom) : amount;
  const amountValid =
    Number.isFinite(selectedAmount) &&
    selectedAmount >= 1 &&
    selectedAmount <= 10_000;
  const settlementCount = streamSettlementCount(
    streamDurationSeconds,
    streamIntervalSeconds,
  );

  const openCheckout = useCallback(async (
    intent: CheckoutIntent,
    resuming = false,
  ) => {
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
    }
  }, []);

  useEffect(() => {
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;
    const expectedPath = `/programs/${tribeId}`;
    const intent = consumeCheckoutIntent(expectedPath);
    if (!intent || intent.tribeId !== tribeId || intent.interval !== "once") {
      return;
    }

    queueMicrotask(() => {
      const dollars = intent.amountCents / 100;
      if (AMOUNTS.includes(dollars)) {
        setAmount(dollars);
        setCustom("");
      } else {
        setCustom(String(dollars));
      }
      setStreamDurationSeconds(intent.streamDurationSeconds);
      setStreamIntervalSeconds(intent.streamIntervalSeconds);
      void openCheckout(intent, true);
    });
  }, [openCheckout, tribeId]);

  useEffect(() => {
    if (error && !busy) {
      checkoutButtonRef.current?.focus();
    }
  }, [busy, error]);

  function checkout() {
    if (!amountValid) return;
    void openCheckout({
      tribeId,
      amountCents: Math.round(selectedAmount * 100),
      interval: "once",
      streamDurationSeconds,
      streamIntervalSeconds,
      returnTo: `/programs/${tribeId}`,
    });
  }

  return (
    <section
      className="pledge-payment-panel pledge-payment-panel-primary"
      aria-labelledby="stream-title"
      aria-busy={busy}
      data-state={error ? "error" : busy ? "loading" : "default"}
    >
      <div className="pledge-payment-heading">
        <div>
          <p className="pledge-kicker">Tend checkout preview</p>
          <h4 id="stream-title">
            {demo
              ? "Preview a sample contribution"
              : "Preview Tend’s Stripe test checkout"}
          </h4>
        </div>
        <span className="pledge-test-badge">
          {demo ? "Demo mode" : "Stripe test mode"}
        </span>
      </div>

      <p className="pledge-payment-intro">
        {demo
          ? `Choose a sample amount to preview a receipt while Stripe and Tempo stay idle. ${tribeName} receives no money.`
          : `Choose a test amount, then open Stripe Checkout in test mode. No real money reaches ${tribeName}.`}
      </p>

      <fieldset className="pledge-control">
        <legend>Test amount</legend>
        <div className="pledge-amount-row">
          {AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              className="pledge-amount-chip"
              aria-pressed={amount === value && !custom}
              onClick={() => {
                setAmount(value);
                setCustom("");
              }}
            >
              ${value}
            </button>
          ))}
          <label className="pledge-custom-amount">
            <span>$</span>
            <input
              aria-label="Custom test amount in dollars"
              aria-invalid={Boolean(custom) && !amountValid}
              inputMode="decimal"
              onChange={(event) => setCustom(cleanAmount(event.target.value))}
              placeholder="Other"
              value={custom}
              aria-describedby="stream-amount-help"
            />
          </label>
        </div>
        <p id="stream-amount-help" className="pledge-location-note">
          Enter an amount from $1 to $10,000.
        </p>
      </fieldset>

      <details className="pledge-stream-customizer">
        <summary>
          <span>
            <SlidersHorizontal size={15} aria-hidden="true" />
            {demo
              ? "Set demo receipt timing"
              : "Set Tempo testnet transfer timing"}
          </span>
          <small>
            {settlementCount} {demo ? "receipt steps" : "testnet transfers"}, every{" "}
            {formatStreamTime(streamIntervalSeconds)}
          </small>
        </summary>
        <StreamTimingControls
          amountCents={amountValid ? Math.round(selectedAmount * 100) : 0}
          durationSeconds={streamDurationSeconds}
          intervalSeconds={streamIntervalSeconds}
          onDurationChange={setStreamDurationSeconds}
          onIntervalChange={setStreamIntervalSeconds}
          preview={demo}
        />
      </details>

      <div className="pledge-checkout-action">
        <button
          ref={checkoutButtonRef}
          type="button"
          className="pledge-checkout-button"
          data-state={error ? "error" : busy ? "loading" : "default"}
          disabled={busy || !amountValid}
          onClick={checkout}
          aria-describedby={error ? "stream-checkout-error" : undefined}
        >
          {busy ? (
            <>
              <LoaderCircle className="pledge-spinner" size={17} />
              {demo
                ? "Opening demo receipt preview"
                : "Opening Stripe test checkout"}
            </>
          ) : (
            <>
              {error
                ? demo
                  ? "Try demo receipt preview again"
                  : "Try Stripe test checkout again"
                : demo
                  ? `Preview a $${amountValid ? selectedAmount.toFixed(2) : "0.00"} demo receipt`
                  : `Open a $${amountValid ? selectedAmount.toFixed(2) : "0.00"} Stripe test checkout`}
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>

        {!demo && (
          <p className="pledge-wallet-note">
            <ShieldCheck size={13} aria-hidden="true" />
            Stripe may offer Apple Pay on a supported iPhone.
          </p>
        )}

        {error && (
          <p id="stream-checkout-error" className="pledge-error" role="alert">
            {error}
          </p>
        )}

        <p className="pledge-test-disclosure">
          {demo
            ? "Demo receipt only. Stripe Checkout and Tempo stay idle. Use the official donation link above to contribute."
            : "Test only. Stripe Checkout can start faucet-funded pathUSD transfers on the Tempo Moderato testnet. Use the official donation link above to contribute real funds."}
        </p>
      </div>
    </section>
  );
}
