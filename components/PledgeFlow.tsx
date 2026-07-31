"use client";

import {
  ArrowRight,
  Check,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { StreamTimingControls } from "@/components/stream/StreamTimingControls";
import {
  consumeCheckoutReturn,
  startCheckout,
  type CheckoutIntent,
  type CheckoutInterval,
} from "@/lib/checkout-client";
import {
  buildPledgeCheckoutIntent,
  pledgeCheckoutButtonLabel,
  pledgeCheckoutCanceledError,
  pledgeCheckoutError,
  pledgeResumeError,
  resolvePledgeProgram,
  restorePledgeDraft,
  restorePledgeSelection,
} from "@/lib/pledge-flow-state";
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

const AMOUNT_CHIPS = [25, 50, 100, 250];
const INTERVAL_LABELS: Record<CheckoutInterval, string> = {
  once: "One time",
  month: "Monthly",
  year: "Yearly",
};

function cleanAmount(value: string) {
  const clean = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = clean.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

export function PledgeFlow({
  demo = false,
  programs,
}: {
  demo?: boolean;
  programs: TribeCard[];
}) {
  const [address, setAddress] = useState("");
  const [located, setLocated] = useState<Located | null>(null);
  const [tribeId, setTribeId] = useState<string | null>(null);
  const [interval, setInterval] = useState<CheckoutInterval>("once");
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState("");
  const [streamDurationSeconds, setStreamDurationSeconds] =
    useState<StreamDurationSeconds>(DEFAULT_STREAM_DURATION_SECONDS);
  const [streamIntervalSeconds, setStreamIntervalSeconds] =
    useState<StreamIntervalSeconds>(DEFAULT_STREAM_INTERVAL_SECONDS);
  const [busyAction, setBusyAction] = useState<
    "locate" | "checkout" | null
  >(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeAttempted = useRef(false);

  async function locate(body: { address?: string; county?: string }) {
    setBusyAction("locate");
    setLocationError(null);
    setCheckoutError(null);
    setResumeError(null);
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("location request failed");
      const data = (await res.json()) as Located;
      setLocated(data);
      setTribeId(null);
    } catch {
      setLocationError(
        "We couldn’t locate that address. Choose a county below and try again.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  const openCheckout = useCallback(async (
    intent: CheckoutIntent,
    resuming = false,
  ) => {
    setBusyAction("checkout");
    setCheckoutError(null);
    try {
      await startCheckout(intent, { preserveCancelIntent: true, resuming });
    } catch (caught) {
      setCheckoutError(pledgeCheckoutError(caught, demo));
      setBusyAction(null);
    }
  }, [demo]);

  useEffect(() => {
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;
    const checkoutReturn = consumeCheckoutReturn("/pledge");
    if (!checkoutReturn) return;

    queueMicrotask(() => {
      if (checkoutReturn.status === "invalid") {
        const restored = restorePledgeDraft(checkoutReturn.draft);
        if (restored.tribeId !== undefined) setTribeId(restored.tribeId);
        if (restored.interval !== undefined) setInterval(restored.interval);
        if (restored.amount !== undefined) setAmount(restored.amount);
        if (restored.custom !== undefined) setCustom(restored.custom);
        if (restored.streamDurationSeconds !== undefined) {
          setStreamDurationSeconds(restored.streamDurationSeconds);
        }
        if (restored.streamIntervalSeconds !== undefined) {
          setStreamIntervalSeconds(restored.streamIntervalSeconds);
        }

        const error = pledgeResumeError({
          demo,
          hasProgram: restored.tribeId !== undefined,
        });
        if (restored.tribeId !== undefined) {
          setCheckoutError(error);
        } else {
          setResumeError(error);
        }
        return;
      }

      const { canceled, intent } = checkoutReturn;
      const restored = restorePledgeSelection(intent);
      setTribeId(restored.tribeId);
      setInterval(restored.interval);
      setAmount(restored.amount);
      setCustom(restored.custom);
      setStreamDurationSeconds(restored.streamDurationSeconds);
      setStreamIntervalSeconds(restored.streamIntervalSeconds);
      if (canceled) {
        setCheckoutError(pledgeCheckoutCanceledError(demo));
      } else {
        void openCheckout(intent, true);
      }
    });
  }, [demo, openCheckout]);

  function checkout() {
    if (
      !tribeId ||
      (tribeId !== "ramaytush" && tribeId !== "muwekma") ||
      !amountValid
    ) {
      return;
    }
    void openCheckout(
      buildPledgeCheckoutIntent({
        tribeId,
        selectedAmount,
        interval,
        streamDurationSeconds,
        streamIntervalSeconds,
        returnTo: "/pledge",
      }),
    );
  }

  function chooseInterval(next: CheckoutInterval) {
    setInterval(next);
  }

  const selectedTribe = resolvePledgeProgram(
    located?.tribes,
    programs,
    tribeId,
  );
  const selectedAmount = custom ? Number(custom) : amount;
  const amountValid =
    Number.isFinite(selectedAmount) && selectedAmount >= 1 && selectedAmount <= 10000;
  const settlementCount = streamSettlementCount(
    streamDurationSeconds,
    streamIntervalSeconds,
  );
  const busy = busyAction !== null;
  const state =
    locationError || checkoutError || resumeError
      ? "error"
      : busy
        ? "loading"
        : "default";
  const checkoutButtonLabel = pledgeCheckoutButtonLabel({
    amountValid,
    checkoutError,
    demo,
    selectedAmount,
  });

  return (
    <section className="pledge-flow" data-state={state} aria-busy={busy}>
      {demo && (
        <div className="pledge-demo-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Demo mode. Stripe Checkout and Tempo stay idle.
        </div>
      )}

      <div className="pledge-locate-heading">
        <div>
          <p className="pledge-kicker">Test program finder</p>
          <h2 className="m-0 mt-[0.2rem] font-display text-[clamp(1.2rem,2vw,1.55rem)] font-bold tracking-[-0.025em] text-[var(--pledge-ink)]">
            See programs listed for your address
          </h2>
        </div>
        <span>{demo ? "Demo mode" : "Stripe test mode"}</span>
      </div>
      <p id="pledge-location-help" className="pledge-location-note">
        Tend uses public program information and may show more than one
        listing.
      </p>

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
            name="address"
            autoComplete="street-address"
            placeholder="Street address in the Bay Area"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            aria-invalid={Boolean(locationError)}
            aria-describedby={
              locationError
                ? "pledge-location-help pledge-location-error"
                : "pledge-location-help"
            }
          />
        </label>
        <button
          className="pledge-primary-button"
          disabled={busy || !address.trim()}
          type="submit"
          data-state={busyAction === "locate" ? "loading" : "default"}
        >
          {busyAction === "locate" ? (
            <>
              <LoaderCircle className="pledge-spinner" size={16} />
              Locating
            </>
          ) : (
            <>
              Show programs for this address
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

      {resumeError && (
        <p className="pledge-error" role="alert">
          {resumeError}
        </p>
      )}

      {locationError && (
        <p
          id="pledge-location-error"
          className="pledge-error"
          role="alert"
        >
          {locationError}
        </p>
      )}

      {located && (
        <div className="pledge-programs">
          {located.county && located.tribes.length > 0 && (
            <div className="pledge-result-heading" role="status">
              <span>
                <Check size={14} aria-hidden="true" /> {located.county} County
              </span>
              <p>
                {located.tribes.length === 1
                  ? `One program is listed for ${located.county} County. Select it to continue.`
                  : `${located.tribes.length} programs are listed for ${located.county} County. Select one to continue.`}
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
              <p className="pledge-kicker">
                {demo ? "Tend demo preview" : "Tend test checkout"}
              </p>
              <h3>
                Choose a {demo ? "sample" : "Stripe test"} amount for{" "}
                {selectedTribe.taxName}
              </h3>
            </div>
            <div className="pledge-suggestion">
              <span>{demo ? "Sample amount" : "Stripe test amount"}</span>
              <strong>${selectedAmount}</strong>
            </div>
          </div>
          <p className="pledge-location-note">
            For a real donation, view the{" "}
            <Link
              href={`/programs/${selectedTribe.id}`}
              className="font-semibold underline underline-offset-4"
            >
              official donation links for {selectedTribe.name}
            </Link>
            .{" "}
            {demo
              ? "The demo below shows a sample receipt. Stripe and Tempo stay idle."
              : "Tend’s checkout below uses test funds."}
          </p>

          <div className="pledge-amount-grid">
            <div className="pledge-controls">
              <fieldset className="pledge-control">
                <legend>
                  {demo ? "Preview frequency" : "Test payment frequency"}
                </legend>
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
                <legend>
                  {demo ? "Sample amount" : "Stripe test amount"}
                </legend>
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
                      aria-label={
                        demo
                          ? "Custom sample amount in dollars"
                          : "Custom Stripe test amount in dollars"
                      }
                      aria-invalid={Boolean(custom) && !amountValid}
                      aria-describedby="pledge-amount-help"
                    />
                  </label>
                </div>
                <p id="pledge-amount-help" className="pledge-location-note">
                  Enter {demo ? "a sample" : "a Stripe test"} amount from $1
                  to $10,000. No real funds move.
                </p>
              </fieldset>

              <details className="pledge-stream-customizer pledge-stream-customizer-wide">
                <summary>
                  <span>
                    <SlidersHorizontal size={15} aria-hidden="true" />
                    {demo
                      ? "Set demo receipt timing"
                      : "Plan Tempo testnet timing"}
                  </span>
                  <small>
                    {settlementCount}{" "}
                    {demo ? "preview transfers" : "planned test transfers"}, every{" "}
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
                  preview={demo}
                />
              </details>
            </div>

            <div className="pledge-payment-panel">
              <div className="pledge-payment-heading">
                <div>
                  <p className="pledge-kicker">Review</p>
                  <h4>
                    {demo ? "Review the demo preview" : "Review the test checkout"}
                  </h4>
                </div>
                <span className="pledge-test-badge">
                  {demo ? "Demo mode" : "Test mode"}
                </span>
              </div>

              <div className="pledge-payment-review">
                <div>
                  <span>Program listing</span>
                  <strong>{selectedTribe?.name ?? "Selected program"}</strong>
                </div>
                <div>
                  <span>{demo ? "Sample amount" : "Stripe test amount"}</span>
                  <strong>
                    ${amountValid ? selectedAmount.toFixed(2) : "0.00"}
                  </strong>
                </div>
                <div>
                  <span>{demo ? "Preview schedule" : "Stripe test schedule"}</span>
                  <strong>{INTERVAL_LABELS[interval]}</strong>
                </div>
                <div>
                  <span>
                    {demo ? "Preview transfers" : "Planned testnet transfers"}
                  </span>
                  <strong>{settlementCount}</strong>
                </div>
                <div>
                  <span>
                    {demo ? "Preview window" : "Planned transfer window"}
                  </span>
                  <strong>{formatStreamTime(streamDurationSeconds)}</strong>
                </div>
                <div>
                  <span>
                    {demo ? "Preview interval" : "Planned transfer interval"}
                  </span>
                  <strong>
                    Every {formatStreamTime(streamIntervalSeconds)}
                  </strong>
                </div>
              </div>

              <p className="pledge-payment-note">
                {demo ? (
                  <>
                    This page shows a sample amount and timing plan. Stripe
                    Checkout and Tempo stay idle. {selectedTribe.name} receives
                    no money.
                  </>
                ) : (
                  <>
                    The button asks Stripe to open a test checkout for this
                    amount and schedule. Tend attempts this Tempo plan once
                    after Stripe confirms the payment. The receipt lists only
                    testnet transfers that settle. No real money reaches{" "}
                    {selectedTribe.name}.
                  </>
                )}
              </p>

              <button
                type="button"
                onClick={checkout}
                disabled={busy || !amountValid}
                className="pledge-checkout-button"
                data-state={state}
                aria-describedby={
                  checkoutError ? "pledge-checkout-error" : undefined
                }
              >
                {busyAction === "checkout" ? (
                  <>
                    <LoaderCircle className="pledge-spinner" size={17} />
                    {demo
                      ? "Opening demo receipt preview"
                      : "Opening Stripe test checkout"}
                  </>
                ) : (
                  <>
                    <span>{checkoutButtonLabel}</span>
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
              {checkoutError && (
                <p
                  id="pledge-checkout-error"
                  className="pledge-error"
                  role="alert"
                >
                  {checkoutError}
                </p>
              )}
              <p className="pledge-test-disclosure">
                {demo
                  ? "Demo preview only. Stripe Checkout and Tempo stay idle."
                  : "Test only. Stripe may record a checkout attempt; the receipt shows only confirmed Tempo testnet transfers. No real funds move."}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
