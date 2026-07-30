"use client";

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

const MONTHLY_CHIPS = [10, 25, 50, 100];
const YEARLY_CHIPS = [100, 250, 500, 1000];

function suggest(housing: string, bracket: string): number {
  if (housing === "rent") {
    return bracket === "low" ? 15 : bracket === "mid" ? 25 : 40;
  }
  return bracket === "low" ? 30 : bracket === "mid" ? 50 : 75;
}

export function PledgeFlow({ demo = false }: { demo?: boolean }) {
  const [address, setAddress] = useState("");
  const [located, setLocated] = useState<Located | null>(null);
  const [tribeId, setTribeId] = useState<string | null>(null);
  const [interval, setInterval] = useState<"month" | "year">("month");
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
      const data = (await res.json()) as Located;
      setLocated(data);
      setTribeId(data.tribes.length === 1 ? data.tribes[0].id : null);
    } catch {
      setError("Something went sideways — try the county picker.");
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    if (!tribeId) return;
    setBusy(true);
    setError(null);
    try {
      const cents = Math.round(
        (custom ? Number(custom) : amount) * 100,
      );
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tribeId, amountCents: cents, interval }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout could not start.");
        setBusy(false);
      }
    } catch {
      setError("Checkout could not start.");
      setBusy(false);
    }
  }

  const chips = interval === "month" ? MONTHLY_CHIPS : YEARLY_CHIPS;
  const suggested =
    interval === "month"
      ? suggest(housing, bracket)
      : suggest(housing, bracket) * 10;
  const selectedTribe = located?.tribes.find((t) => t.id === tribeId);

  return (
    <section className="card p-6 sm:p-8">
      {demo && (
        <p className="mb-4 font-display text-sm font-semibold text-sun-deep">
          Hackathon demo — no real charge will be created
        </p>
      )}
      {/* Step 1 — locate */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (address.trim()) locate({ address: address.trim() });
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          className="field flex-1"
          placeholder="Your street address — e.g. 1 Dr Carlton B Goodlett Pl, San Francisco"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-label="Street address"
        />
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy && !located ? "Locating…" : "Whose land am I on?"}
        </button>
      </form>

      <div className="mt-3 text-sm text-faded">
        or choose your county:{" "}
        {(located?.coveredCounties ?? [
          "San Francisco",
          "San Mateo",
          "Santa Clara",
          "Alameda",
          "Contra Costa",
        ]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => locate({ county: c })}
            className="underline decoration-sand underline-offset-4 hover:text-ink mr-3"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Step 2 — the answer */}
      {located && (
        <div className="mt-8">
          {located.county && located.tribes.length > 0 && (
            <h2 className="font-display text-3xl font-semibold">
              {located.county} County —{" "}
              {located.tribes.length === 1
                ? `${located.tribes[0].name.replace("Association of ", "")} land`
                : "two tribes call this home"}
            </h2>
          )}
          {located.note && (
            <p className="mt-3 max-w-2xl text-sm text-faded leading-relaxed">
              {located.note}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {located.tribes.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTribeId(t.id)}
                className={`card p-5 text-left transition ${
                  tribeId === t.id ? "card-selected" : "hover:border-moss"
                }`}
              >
                <div className="font-display text-sm font-semibold text-tide">
                  {t.region}
                </div>
                <div className="font-display text-xl font-semibold mt-1">
                  {t.name}
                </div>
                <p className="mt-2 text-sm text-faded leading-relaxed">
                  {t.blurb}
                </p>
                <div className="mt-3 text-sm font-medium text-moss">
                  {t.taxName} →
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — amount */}
      {selectedTribe && (
        <div className="mt-8 rule pt-8">
          <h3 className="font-display text-2xl font-semibold">
            Your {selectedTribe.taxName}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <select
              className="field w-auto"
              value={housing}
              onChange={(e) => setHousing(e.target.value)}
              aria-label="Housing situation"
            >
              <option value="rent">I rent</option>
              <option value="own">I own</option>
            </select>
            <select
              className="field w-auto"
              value={bracket}
              onChange={(e) => setBracket(e.target.value)}
              aria-label="Housing cost bracket"
            >
              {housing === "rent" ? (
                <>
                  <option value="low">under $2k/mo</option>
                  <option value="mid">$2k–4k/mo</option>
                  <option value="high">over $4k/mo</option>
                </>
              ) : (
                <>
                  <option value="low">under $1M home</option>
                  <option value="mid">$1–2M home</option>
                  <option value="high">over $2M home</option>
                </>
              )}
            </select>
            <span className="text-faded">
              sliding-scale suggestion: <strong>${suggested}</strong>/
              {interval}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-sand overflow-hidden mr-2">
              {(["month", "year"] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInterval(i)}
                  className={`px-4 py-2 text-sm font-semibold ${
                    interval === i ? "bg-moss text-cream" : "bg-cream"
                  }`}
                >
                  {i === "month" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setAmount(c);
                  setCustom("");
                }}
                className={`chip ${amount === c && !custom ? "chip-active" : ""}`}
              >
                ${c}
              </button>
            ))}
            <input
              className="field w-28"
              placeholder="custom $"
              inputMode="decimal"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))}
              aria-label="Custom amount in dollars"
            />
          </div>

          <button
            type="button"
            onClick={checkout}
            disabled={busy || (!custom && !amount)}
            className="btn btn-primary mt-6"
          >
            {busy
              ? "Opening checkout…"
              : `${demo ? "Preview" : "Begin"} — $${custom || amount}/${interval}, no Tend fee`}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
    </section>
  );
}
