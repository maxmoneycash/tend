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
  tribeId,
  tribeName,
}: {
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
      setError(
        caught instanceof Error
          ? caught.message
          : "Stripe Checkout didn’t open. Check your connection.",
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
      data-state={error ? "error" : busy ? "loading" : "default"}
    >
      <div className="pledge-payment-heading">
        <div>
          <p className="pledge-kicker">Tend checkout preview</p>
          <h4 id="stream-title">Test the flow for {tribeName}</h4>
        </div>
        <span className="pledge-test-badge">
          Test mode
        </span>
      </div>

      <p className="pledge-payment-intro">
        Choose a test amount. Stripe creates a test session, then Tend shows
        the receipt settle on a public testnet.
      </p>

      <fieldset className="pledge-control">
        <legend>Amount</legend>
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
              aria-label="Custom contribution amount in dollars"
              aria-invalid={Boolean(custom) && !amountValid}
              inputMode="decimal"
              onChange={(event) => setCustom(cleanAmount(event.target.value))}
              placeholder="Other"
              value={custom}
            />
          </label>
        </div>
      </fieldset>

      <details className="pledge-stream-customizer">
        <summary>
          <span>
            <SlidersHorizontal size={15} aria-hidden="true" />
            Customize stream
          </span>
          <small>
            {settlementCount} transfers, every{" "}
            {formatStreamTime(streamIntervalSeconds)}
          </small>
        </summary>
        <StreamTimingControls
          amountCents={amountValid ? Math.round(selectedAmount * 100) : 0}
          durationSeconds={streamDurationSeconds}
          intervalSeconds={streamIntervalSeconds}
          onDurationChange={setStreamDurationSeconds}
          onIntervalChange={setStreamIntervalSeconds}
        />
      </details>

      <button
        type="button"
        className="pledge-checkout-button"
        data-state={error ? "error" : busy ? "loading" : "default"}
        disabled={busy || !amountValid}
        onClick={checkout}
      >
        {busy ? (
          <>
            <LoaderCircle className="pledge-spinner" size={17} />
            Opening Stripe
          </>
        ) : (
          <>
            Open ${amountValid ? selectedAmount.toFixed(2) : "0.00"} test checkout
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="pledge-wallet-note">
        <ShieldCheck size={13} aria-hidden="true" />
        Stripe Checkout presents Apple Pay on a supported iPhone.
      </p>

      {error && (
        <p className="pledge-error" role="alert">
          {error}
        </p>
      )}

      <p className="pledge-test-disclosure">
        Stripe test payment with faucet-funded pathUSD on Tempo Moderato
      </p>
    </section>
  );
}
