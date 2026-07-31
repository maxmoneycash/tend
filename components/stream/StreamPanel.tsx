"use client";

import {
  ArrowRight,
  Blocks,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

const AMOUNTS = [10, 20, 25, 50, 100];

function cleanAmount(value: string) {
  const clean = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimals] = clean.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

export function StreamPanel({
  tribeId,
  tribeName,
  zone,
}: {
  tribeId: "ramaytush" | "muwekma";
  tribeName: string;
  zone: string;
}) {
  const [amount, setAmount] = useState(20);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAmount = custom ? Number(custom) : amount;
  const amountValid =
    Number.isFinite(selectedAmount) &&
    selectedAmount >= 1 &&
    selectedAmount <= 10_000;
  const settlementAmount = amountValid ? selectedAmount / 20 : 0;

  async function checkout() {
    if (!amountValid) return;
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tribeId,
          amountCents: Math.round(selectedAmount * 100),
          interval: "once",
          returnTo: `/programs/${tribeId}`,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        loginUrl?: string;
        url?: string;
      };
      if (response.status === 401 && data.loginUrl) {
        window.location.assign(data.loginUrl);
        return;
      }
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Stripe Checkout could not open.");
      }
      window.location.assign(data.url);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Stripe Checkout could not open.",
      );
      setBusy(false);
    }
  }

  return (
    <section className="pledge-payment-panel" aria-labelledby="stream-title">
      <div className="pledge-payment-heading">
        <div>
          <p className="pledge-kicker">Stripe → Tempo</p>
          <h4 id="stream-title">Make a test contribution</h4>
        </div>
        <span className="pledge-live-state">
          <i aria-hidden="true" />
          {busy ? "Opening" : "Ready"}
        </span>
      </div>

      <div className="rounded-[10px] border border-black/[0.06] bg-black/[0.03] px-3 py-2.5">
        <p className="font-mono text-[11px] text-[#3a3a3a]">{zone}</p>
        <p className="mt-0.5 text-[10px] text-[#8a8a8a]">
          Stripe test payment followed by twenty public Tempo testnet receipts
          for {tribeName}.
        </p>
      </div>

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

      <div
        className="pledge-route"
        aria-label="Apple Pay or card through Stripe Checkout, followed by Tempo testnet receipts"
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
            <Blocks size={17} aria-hidden="true" />
          </span>
          <strong>Tempo</strong>
          <small>On-chain</small>
        </div>
      </div>

      <div className="pledge-micro-summary">
        <span>
          <strong>20</strong> receipts
        </span>
        <span>
          <strong>${settlementAmount.toFixed(2)}</strong> each
        </span>
        <span>
          <strong>Public</strong> explorer
        </span>
      </div>

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
            Pay ${amountValid ? selectedAmount.toFixed(2) : "0.00"}
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="pledge-wallet-note">
        <ShieldCheck size={13} aria-hidden="true" />
        On a supported iPhone, Stripe Checkout presents Apple Pay. After
        payment, Tend opens the live Stripe and Tempo receipt screen.
      </p>

      {error && (
        <p className="pledge-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
