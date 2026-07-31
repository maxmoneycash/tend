"use client";

import {
  ArrowRight,
  Check,
  LoaderCircle,
  MapPin,
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

type TribeCard = {
  id: string;
  name: string;
  taxName: string;
  region: string;
  blurb: string;
  siteUrl: string;
};

type Located = {
  county: string | null;
  geocoded: boolean;
  tribes: TribeCard[];
  note: string | null;
  coveredCounties: string[];
};

type Interval = "once" | "month" | "year";

const AMOUNT_CHIPS = [25, 50, 100, 250];

function cleanAmount(value: string) {
  const clean = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = clean.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

export function PledgeFlow({ demo = false }: { demo?: boolean }) {
  const [address, setAddress] = useState("");
  const [located, setLocated] = useState<Located | null>(null);
  const [tribeId, setTribeId] = useState<string | null>(null);
  const [interval, setInterval] = useState<Interval>("once");
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState("");
  const [streamDurationSeconds, setStreamDurationSeconds] =
    useState<StreamDurationSeconds>(DEFAULT_STREAM_DURATION_SECONDS);
  const [streamIntervalSeconds, setStreamIntervalSeconds] =
    useState<StreamIntervalSeconds>(DEFAULT_STREAM_INTERVAL_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumeAttempted = useRef(false);

  async function locate(body: { address?: string; county?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("location request failed");
      const data = (await res.json()) as Located;
      setLocated(data);
      setTribeId(data.tribes.length === 1 ? data.tribes[0].id : null);
    } catch {
      setError(
        "We couldn’t locate that address. Choose a county below and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

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
    const intent = consumeCheckoutIntent("/pledge");
    if (!intent) return;

    queueMicrotask(() => {
      setTribeId(intent.tribeId);
      setInterval(intent.interval);
      setAmount(intent.amountCents / 100);
      setCustom("");
      setStreamDurationSeconds(intent.streamDurationSeconds);
      setStreamIntervalSeconds(intent.streamIntervalSeconds);
      void openCheckout(intent, true);
    });
  }, [openCheckout]);

  function checkout() {
    if (
      !tribeId ||
      (tribeId !== "ramaytush" && tribeId !== "muwekma") ||
      !amountValid
    ) {
      return;
    }
    void openCheckout({
      tribeId,
      amountCents: Math.round(selectedAmount * 100),
      interval,
      streamDurationSeconds,
      streamIntervalSeconds,
      returnTo: "/pledge",
    });
  }

  function chooseInterval(next: Interval) {
    setInterval(next);
  }

  const selectedTribe = located?.tribes.find((tribe) => tribe.id === tribeId);
  const selectedAmount = custom ? Number(custom) : amount;
  const amountValid =
    Number.isFinite(selectedAmount) && selectedAmount >= 1 && selectedAmount <= 10000;
  const settlementCount = streamSettlementCount(
    streamDurationSeconds,
    streamIntervalSeconds,
  );
  const state = error ? "error" : busy ? "loading" : "default";

  return (
    <section className="pledge-flow" data-state={state}>
      {demo && (
        <div className="pledge-demo-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Demo preview. No card charge will be created.
        </div>
      )}

      <div className="pledge-locate-heading">
        <div>
          <p className="pledge-kicker">Start here</p>
          <h3>Find the program for your address</h3>
        </div>
        <span>Stripe test mode</span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (address.trim()) locate({ address: address.trim() });
        }}
        className="pledge-address-form"
      >
        <label className="pledge-address-field">
          <span className="sr-only">Street address</span>
          <MapPin size={17} aria-hidden="true" />
          <input
            placeholder="Street address in the Bay Area"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "pledge-error" : undefined}
          />
        </label>
        <button
          className="pledge-primary-button"
          disabled={busy || !address.trim()}
          type="submit"
          data-state={busy && !located ? "loading" : "default"}
        >
          {busy && !located ? (
            <>
              <LoaderCircle className="pledge-spinner" size={16} />
              Locating
            </>
          ) : (
            <>
              Find my program
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="pledge-counties" aria-label="Choose a county instead">
        <span>Or choose a county</span>
        {(located?.coveredCounties ?? [
          "San Francisco",
          "San Mateo",
          "Santa Clara",
          "Alameda",
          "Contra Costa",
        ]).map((county) => (
          <button
            key={county}
            type="button"
            onClick={() => locate({ county })}
            disabled={busy}
          >
            {county}
          </button>
        ))}
      </div>

      {located && (
        <div className="pledge-programs">
          {located.county && located.tribes.length > 0 && (
            <div className="pledge-result-heading">
              <span>
                <Check size={14} aria-hidden="true" /> {located.county} County
              </span>
              <p>
                {located.tribes.length === 1
                  ? "One matching Indigenous-led program"
                  : `${located.tribes.length} matching programs. Choose one.`}
              </p>
            </div>
          )}
          {located.note && <p className="pledge-location-note">{located.note}</p>}

          <div className="pledge-program-grid">
            {located.tribes.map((tribe) => (
              <button
                type="button"
                key={tribe.id}
                onClick={() => setTribeId(tribe.id)}
                className="pledge-program"
                aria-pressed={tribeId === tribe.id}
              >
                <span className="pledge-program-check">
                  {tribeId === tribe.id && <Check size={13} aria-hidden="true" />}
                </span>
                <span>
                  <small>{tribe.region}</small>
                  <strong>{tribe.taxName}</strong>
                  <em>{tribe.name}</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTribe && (
        <div className="pledge-amount-stage">
          <div className="pledge-amount-header">
            <div>
              <p className="pledge-kicker">Choose your contribution</p>
              <h3>{selectedTribe.taxName}</h3>
            </div>
            <div className="pledge-suggestion">
              <span>Test amount</span>
              <strong>${selectedAmount}</strong>
            </div>
          </div>

          <div className="pledge-amount-grid">
            <div className="pledge-controls">
              <fieldset className="pledge-control">
                <legend>Frequency</legend>
                <div className="pledge-segmented pledge-frequency">
                  {(
                    [
                      ["once", "One time"],
                      ["month", "Monthly"],
                      ["year", "Yearly"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => chooseInterval(value)}
                      aria-pressed={interval === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="pledge-control">
                <legend>Amount</legend>
                <div className="pledge-amount-row">
                  {AMOUNT_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setAmount(chip);
                        setCustom("");
                      }}
                      className="pledge-amount-chip"
                      aria-pressed={amount === chip && !custom}
                    >
                      ${chip}
                    </button>
                  ))}
                  <label className="pledge-custom-amount">
                    <span>$</span>
                    <input
                      placeholder="Other"
                      inputMode="decimal"
                      value={custom}
                      onChange={(event) =>
                        setCustom(cleanAmount(event.target.value))
                      }
                      aria-label="Custom amount in dollars"
                      aria-invalid={Boolean(custom) && !amountValid}
                    />
                  </label>
                </div>
              </fieldset>

              <details className="pledge-stream-customizer pledge-stream-customizer-wide">
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
                  amountCents={
                    amountValid ? Math.round(selectedAmount * 100) : 0
                  }
                  durationSeconds={streamDurationSeconds}
                  intervalSeconds={streamIntervalSeconds}
                  onDurationChange={setStreamDurationSeconds}
                  onIntervalChange={setStreamIntervalSeconds}
                />
              </details>
            </div>

            <div className="pledge-payment-panel">
              <div className="pledge-payment-heading">
                <div>
                  <p className="pledge-kicker">Review</p>
                  <h4>Confirm your contribution</h4>
                </div>
                <span className="pledge-test-badge">
                  Test mode
                </span>
              </div>

              <div className="pledge-payment-review">
                <div>
                  <span>To</span>
                  <strong>{selectedTribe?.name ?? "Selected program"}</strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>
                    ${amountValid ? selectedAmount.toFixed(2) : "0.00"}
                  </strong>
                </div>
                <div>
                  <span>Receipt stream</span>
                  <strong>
                    {settlementCount} transfers over{" "}
                    {formatStreamTime(streamDurationSeconds)}
                  </strong>
                </div>
              </div>

              <p className="pledge-payment-note">
                Stripe handles the test payment. Tend then mirrors the amount
                as faucet-funded pathUSD on Tempo Moderato.
              </p>

              <button
                type="button"
                onClick={checkout}
                disabled={busy || !amountValid}
                className="pledge-checkout-button"
                data-state={state}
              >
                {busy ? (
                  <>
                    <LoaderCircle className="pledge-spinner" size={17} />
                    Opening Stripe
                  </>
                ) : (
                  <>
                    <span>
                      Open ${amountValid ? selectedAmount.toFixed(2) : "0.00"}{" "}
                      test checkout
                    </span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </button>
              <p className="pledge-wallet-note">
                <ShieldCheck size={13} aria-hidden="true" />
                Apple Pay appears in Stripe Checkout on a supported iPhone.
              </p>
              <p className="pledge-test-disclosure">
                Stripe test payment with a pathUSD testnet receipt
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p id="pledge-error" className="pledge-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
