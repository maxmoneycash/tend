"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import NumberFlow from "@number-flow/react";
import { Activity } from "lucide-react";

/* ── data ── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = 24;

function seed(): number[][] {
  const g: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const r: number[] = [];
    for (let h = 0; h < HOURS; h++) {
      const wk = d >= 5;
      const pk = h >= 16 && h <= 23;
      const af = h >= 12 && h <= 16;
      const mw = d >= 2 && d <= 3;
      let v = wk ? 0 : 1;
      if (pk) v += wk ? 2 : mw ? 6 : 4;
      else if (af) v += wk ? 1 : 2;
      if (h >= 1 && h <= 6) v = wk ? 0 : Math.max(0, v - 2);
      r.push(Math.max(0, v + Math.floor(Math.random() * 3) - 1));
    }
    g.push(r);
  }
  return g;
}

function cellAlpha(v: number, max: number): number {
  if (v === 0) return 0.04;
  return 0.12 + (v / max) * 0.58;
}

function fmtHour(h: number): string {
  if (h === 0) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

/* ── component ── */

export function OracleHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [hover, setHover] = useState<{
    d: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const data = useMemo(seed, []);
  const max = useMemo(() => Math.max(...data.flat()), [data]);
  const total = useMemo(() => data.flat().reduce((a, b) => a + b, 0), [data]);
  const dayTotals = useMemo(
    () => data.map((r) => r.reduce((a, b) => a + b, 0)),
    [data],
  );
  const peakDay = useMemo(
    () => dayTotals.indexOf(Math.max(...dayTotals)),
    [dayTotals],
  );

  const tip = useMemo(() => {
    if (!hover) return null;
    const reports = data[hover.d][hover.h];
    const views = reports * (3800 + Math.floor(Math.random() * 4200));
    const usd = +(views * 0.00075).toFixed(2);
    return { reports, views, usd };
  }, [hover?.d, hover?.h, data]);

  const onCellEnter = useCallback(
    (d: number, h: number, e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setHover({ d, h, x: rect.left + rect.width / 2, y: rect.top });
    },
    [],
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVis(true); io.disconnect(); }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      {/* ── header ── */}
      <div className="flex items-start justify-between mb-5 px-4 sm:px-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/20">
            <Activity size={13} />
            <span className="text-[10px] font-medium uppercase tracking-[0.1em]">
              Oracle Activity
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-[28px] font-bold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', system-ui" }}
            >
              <NumberFlow value={vis ? total : 0} />
            </span>
            <span className="text-[11px] text-white/25">reports this week</span>
          </div>
        </div>
        <div className="flex gap-5 pt-1">
          {[
            { label: "Views", value: "2.07M" },
            { label: "Paid", value: "$789" },
          ].map((s) => (
            <div key={s.label} className="text-right">
              <div className="text-[13px] font-semibold text-white/50 tabular-nums font-mono">
                {s.value}
              </div>
              <div className="text-[9px] text-white/15 uppercase tracking-[0.08em]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── heatmap — responsive grid fills container ── */}
      <div className="px-2 sm:px-3">
        {/* hour labels */}
        <div
          className="mb-1"
          style={{
            display: "grid",
            gridTemplateColumns: "24px 1fr 20px",
          }}
        >
          <div />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${HOURS}, 1fr)`,
              gap: 2,
            }}
          >
            {Array.from({ length: HOURS }, (_, h) => (
              <span
                key={h}
                className="text-[7px] sm:text-[8px] font-mono text-white/10 text-center select-none leading-none"
              >
                {h % 6 === 0 ? fmtHour(h) : ""}
              </span>
            ))}
          </div>
          <div />
        </div>

        {/* rows */}
        {data.map((row, di) => (
          <div
            key={di}
            className="mb-[2px]"
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 20px",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* day label */}
            <span
              className={`text-[8px] sm:text-[9px] font-mono text-right select-none leading-none ${
                di === peakDay ? "text-[#FA4616]/50" : "text-white/12"
              }`}
            >
              {DAYS[di].slice(0, 3)}
            </span>

            {/* cells grid — 1fr columns = fill width, aspect-ratio = square */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${HOURS}, 1fr)`,
                gap: 2,
              }}
            >
              {row.map((v, hi) => (
                <div
                  key={hi}
                  className="cursor-crosshair"
                  style={{ aspectRatio: "1" }}
                  onMouseEnter={(e) => onCellEnter(di, hi, e)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className="w-full h-full rounded-[2px] sm:rounded-[2.5px] transition-all duration-150"
                    style={{
                      backgroundColor: `rgba(250, 70, 22, ${cellAlpha(v, max)})`,
                      boxShadow:
                        hover?.d === di && hover?.h === hi
                          ? `0 0 8px rgba(250,70,22,${0.15 + (v / max) * 0.35}), inset 0 0 0 1px rgba(250,70,22,0.4)`
                          : "none",
                      animation: vis
                        ? `hm-pop 0.25s ease-out ${hi * 10 + di * 20}ms both`
                        : "none",
                      opacity: vis ? undefined : 0,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* day total */}
            <span
              className={`text-[8px] sm:text-[9px] font-mono tabular-nums select-none text-right leading-none ${
                di === peakDay ? "text-[#FA4616]/50" : "text-white/8"
              }`}
            >
              {dayTotals[di]}
            </span>
          </div>
        ))}
      </div>

      {/* ── legend ── */}
      <div className="flex items-center justify-between mt-3 px-4 sm:px-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-white/10">less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{
                width: 10,
                height: 10,
                backgroundColor: `rgba(250, 70, 22, ${cellAlpha(Math.round(t * max), max)})`,
              }}
            />
          ))}
          <span className="text-[8px] font-mono text-white/10">more</span>
        </div>
        <span className="text-[9px] font-mono text-white/15 tabular-nums">
          {DAYS[peakDay]} peak &middot; {dayTotals[peakDay]} reports
        </span>
      </div>

      {/* ── tooltip via portal ── */}
      {mounted &&
        hover &&
        tip &&
        tip.reports > 0 &&
        createPortal(
          <div
            style={{
              position: "fixed",
              zIndex: 99999,
              left: hover.x,
              top: hover.y - 10,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <div
              className="rounded-[10px] px-3.5 py-2.5 shadow-2xl"
              style={{
                background: "rgba(10, 10, 10, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.06)",
                minWidth: 150,
              }}
            >
              <div className="text-[9px] font-mono text-white/25 mb-1.5">
                {DAYS[hover.d]}, {fmtHour(hover.h)}
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span
                  className="text-[18px] font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', system-ui" }}
                >
                  {tip.reports}
                </span>
                <span className="text-[10px] text-white/30">
                  report{tip.reports !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-4 text-[10px] font-mono">
                <div>
                  <span className="text-white/20">views </span>
                  <span className="text-white/50 tabular-nums">
                    {tip.views >= 1000
                      ? `${(tip.views / 1000).toFixed(1)}K`
                      : tip.views}
                  </span>
                </div>
                <div>
                  <span className="text-white/20">paid </span>
                  <span className="text-[#22c55e]/70 tabular-nums">
                    ${tip.usd.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((tip.reports / max) * 100, 5)}%`,
                    background: "linear-gradient(90deg, #FA4616, #ff7a4a)",
                  }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      <style>{`
        @keyframes hm-pop {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
