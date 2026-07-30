"use client";

import { useEffect, useRef, useState } from "react";

/* Streaming donation into a private Tempo zone (mock demo).
 * Deposit once; the zone streams it out in 250ms batches; the accumulated
 * stream offramps to the tribe's own Stripe account. */

const DEPOSITS = [25, 50, 100];
const RATES = [0.5, 1, 5]; // $ per minute

export function StreamPanel({ tribeName, zone }: { tribeName: string; zone: string }) {
  const [deposit, setDeposit] = useState(50);
  const [rate, setRate] = useState(1);
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState(0);
  const [offramped, setOfframped] = useState(0);
  const [batches, setBatches] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!streaming) return;
    // zone batch cadence: 250ms
    timer.current = setInterval(() => {
      setStreamed((s) => {
        const next = Math.min(s + rate / 240, deposit);
        if (next >= deposit && timer.current) {
          clearInterval(timer.current);
          setStreaming(false);
        }
        return next;
      });
      setBatches((b) => b + 1);
      setOfframped((o) => o + rate / 260); // Stripe offramp trails slightly
    }, 250);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [streaming, rate, deposit]);

  const remaining = Math.max(deposit - streamed, 0);
  const pct = Math.min((streamed / deposit) * 100, 100);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="surface-1 rounded-[16px] p-5">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-display font-semibold text-[#6b6b6b] uppercase tracking-wider">
          Stream a donation
        </p>
        <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#7C3AED] uppercase tracking-wider">
          Private zone
        </span>
      </div>

      {/* zone identity */}
      <div className="mt-3 rounded-[10px] bg-black/[0.03] border border-black/[0.06] px-3 py-2.5">
        <p className="font-mono text-[11px] text-[#3a3a3a]">{zone}</p>
        <p className="text-[10px] text-[#8a8a8a] mt-0.5">
          anchored to Tempo · confidential balances · TIP-403 allowlist:{" "}
          {tribeName} + Tend
        </p>
      </div>

      {!streaming && streamed === 0 ? (
        <>
          <p className="mt-4 text-[10px] text-[#8a8a8a] uppercase tracking-wider">Deposit</p>
          <div className="mt-1.5 flex gap-2">
            {DEPOSITS.map((d) => (
              <button
                key={d}
                onClick={() => setDeposit(d)}
                className={`px-3.5 py-2 rounded-[10px] text-[13px] font-semibold border transition-colors ${
                  deposit === d
                    ? "bg-[#FA4616]/10 border-[#FA4616]/30 text-[#FA4616]"
                    : "bg-white border-black/[0.08] text-[#555555] hover:border-black/[0.16]"
                }`}
              >
                ${d}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#8a8a8a] uppercase tracking-wider">Stream rate</p>
          <div className="mt-1.5 flex gap-2">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`px-3.5 py-2 rounded-[10px] text-[13px] font-semibold border transition-colors ${
                  rate === r
                    ? "bg-[#FA4616]/10 border-[#FA4616]/30 text-[#FA4616]"
                    : "bg-white border-black/[0.08] text-[#555555] hover:border-black/[0.16]"
                }`}
              >
                ${r.toFixed(2)}/min
              </button>
            ))}
          </div>
          <button
            onClick={() => setStreaming(true)}
            className="btn-whop mt-4 w-full py-3 rounded-[12px] text-[13px] font-semibold"
          >
            Deposit {fmt(deposit)} &amp; open stream
          </button>
          <p className="mt-2 text-[10px] font-mono text-[#8a8a8a]">
            encrypted deposit → zone streams in 250ms batches → Stripe offramp
          </p>
        </>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-2">
            {streaming ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-[#8a8a8a]" />
            )}
            <span className="text-[12px] font-medium text-[#111111]">
              {streaming ? "Streaming" : "Stream complete"}
            </span>
            <span className="ml-auto font-mono text-[10px] text-[#8a8a8a]">
              batch #{batches} · 250ms cadence
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-black/[0.05] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FA4616] to-[#ff7a4a]"
              style={{ width: `${pct}%`, transition: "width 250ms linear" }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[10px] bg-black/[0.03] p-2.5 text-center">
              <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">In zone</p>
              <p className="font-mono text-[15px] font-bold text-[#111111]">{fmt(remaining)}</p>
            </div>
            <div className="rounded-[10px] bg-black/[0.03] p-2.5 text-center">
              <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">Streamed</p>
              <p className="font-mono text-[15px] font-bold text-[#111111]">{fmt(streamed)}</p>
            </div>
            <div className="rounded-[10px] bg-black/[0.03] p-2.5 text-center">
              <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">Offramped</p>
              <p className="font-mono text-[15px] font-bold text-green-700">
                {fmt(Math.min(offramped, streamed))}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {streaming ? (
              <button
                onClick={() => setStreaming(false)}
                className="flex-1 py-2.5 rounded-[10px] bg-black/[0.05] text-[#3a3a3a] text-[12px] font-medium hover:bg-black/[0.08] transition-colors"
              >
                Pause stream
              </button>
            ) : (
              <button
                onClick={() => (streamed >= deposit ? (setStreamed(0), setOfframped(0), setBatches(0)) : setStreaming(true))}
                className="flex-1 py-2.5 rounded-[10px] bg-black/[0.05] text-[#3a3a3a] text-[12px] font-medium hover:bg-black/[0.08] transition-colors"
              >
                {streamed >= deposit ? "New stream" : "Resume"}
              </button>
            )}
          </div>
          <p className="mt-2 text-[10px] font-mono text-[#8a8a8a]">
            demo stream · funds settle to {tribeName}&apos;s Stripe account
          </p>
        </>
      )}
    </div>
  );
}
