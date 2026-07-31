"use client";

import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  CreditCard,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

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

const AMOUNT_CHIPS = [10, 20, 25, 50, 100];
const YEARLY_CHIPS = [100, 200, 250, 500, 1000];

function suggest(housing: string, bracket: string): number {
  if (housing === "rent") {
    return bracket === "low" ? 15 : bracket === "mid" ? 25 : 40;
  }
  return bracket === "low" ? 30 : bracket === "mid" ? 50 : 75;
}

function suggestedAmount(
  housing: string,
  bracket: string,
  interval: Interval,
) {
  const monthly = suggest(housing, bracket);
  return interval === "year" ? monthly * 10 : monthly;
}

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
  const [housing, setHousing] = useState("rent");
  const [bracket, setBracket] = useState("mid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function checkout() {
    if (!tribeId || !amountValid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tribeId,
          amountCents: Math.round(selectedAmount * 100),
          interval,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(
          data.error ??
            "Stripe Checkout didn’t open. Check the amount and try again.",
        );
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(
        "Stripe Checkout didn’t open. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  function chooseInterval(next: Interval) {
    setInterval(next);
    setAmount(suggestedAmount(housing, bracket, next));
    setCustom("");
  }

  function chooseHousing(next: string) {
    setHousing(next);
    setAmount(suggestedAmount(next, bracket, interval));
    setCustom("");
  }

  function chooseBracket(next: string) {
    setBracket(next);
    setAmount(suggestedAmount(housing, next, interval));
    setCustom("");
  }

  const chips = interval === "year" ? YEARLY_CHIPS : AMOUNT_CHIPS;
  const suggested = suggestedAmount(housing, bracket, interval);
  const selectedTribe = located?.tribes.find((tribe) => tribe.id === tribeId);
  const selectedAmount = custom ? Number(custom) : amount;
  const amountValid =
    Number.isFinite(selectedAmount) && selectedAmount >= 1 && selectedAmount <= 10000;
  const microAmount = amountValid ? selectedAmount / 20 : 0;
  const state = error ? "error" : busy ? "loading" : "default";

  return (
    <section className="pledge-flow" data-state={state}>
      {demo && (
        <div className="pledge-demo-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Demo preview — no card charge will be created
        </div>
      )}

      <div className="pledge-locate-heading">
        <div>
          <p className="pledge-kicker">Start here</p>
          <h3>Find the program for your address</h3>
        </div>
        <span>No account needed</span>
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
                  : `${located.tribes.length} matching programs — you choose`}
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
              <span>Suggested</span>
              <strong>${suggested}</strong>
            </div>
          </div>

          <div className="pledge-amount-grid">
            <div className="pledge-controls">
              <fieldset className="pledge-control">
                <legend>Housing</legend>
                <div className="pledge-segmented">
                  {[
                    ["rent", "I rent"],
                    ["own", "I own"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => chooseHousing(value)}
                      aria-pressed={housing === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="pledge-control">
                <span>Housing cost</span>
                <select
                  value={bracket}
                  onChange={(event) => chooseBracket(event.target.value)}
                >
                  {housing === "rent" ? (
                    <>
                      <option value="low">Under $2k / month</option>
                      <option value="mid">$2k–4k / month</option>
                      <option value="high">Over $4k / month</option>
                    </>
                  ) : (
                    <>
                      <option value="low">Under $1M home</option>
                      <option value="mid">$1–2M home</option>
                      <option value="high">Over $2M home</option>
                    </>
                  )}
                </select>
              </label>

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
                  {chips.map((chip) => (
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
            </div>

            <div className="pledge-payment-panel">
              <div className="pledge-payment-heading">
                <div>
                  <p className="pledge-kicker">Payment stream</p>
                  <h4>Watch every dollar move</h4>
                </div>
                <span className="pledge-live-state">
                  <i aria-hidden="true" />
                  {busy ? "Connecting" : "Ready"}
                </span>
              </div>

              <div
                className="pledge-route"
                aria-label="Apple Pay or card to Stripe, then a Tempo testnet settlement stream to the organization"
              >
                <div className="pledge-route-node">
                  <span>
                    <WalletCards size={17} aria-hidden="true" />
                  </span>
                  <strong>You</strong>
                  <small>Apple Pay</small>
                </div>
                <div className="pledge-route-line" aria-hidden="true" />
                <div className="pledge-route-node">
                  <span>
                    <CreditCard size={17} aria-hidden="true" />
                  </span>
                  <strong>Stripe</strong>
                  <small>Verified</small>
                </div>
                <div
                  className="pledge-route-line pledge-route-line-delay"
                  aria-hidden="true"
                />
                <div className="pledge-route-node">
                  <span>
                    <Building2 size={17} aria-hidden="true" />
                  </span>
                  <strong>Tempo</strong>
                  <small>Testnet</small>
                </div>
              </div>

              <div className="pledge-micro-summary">
                <span>
                  <strong>20</strong> settlements
                </span>
                <span>
                  <strong>${microAmount.toFixed(2)}</strong> each
                </span>
                <span>
                  <strong>~1s</strong> finality
                </span>
              </div>

              <p className="pledge-payment-note">
                Stripe verifies the card payment, then Tend mirrors it as
                AlphaUSD micropayments on Tempo testnet.
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
                      {demo ? "Preview" : "Pay"} ${amountValid ? selectedAmount : 0}
                    </span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </button>
              <p className="pledge-wallet-note">
                <ShieldCheck size={13} aria-hidden="true" />
                Apple Pay appears in Stripe Checkout on a supported iPhone.
              </p>

              <div className="pledge-machine-preview">
                <Bot size={14} aria-hidden="true" />
                Agents can use the same route through Stripe MPP
                <span>Preview</span>
              </div>
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
