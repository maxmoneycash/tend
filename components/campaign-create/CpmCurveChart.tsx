"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

// ── CPM curve math (mirrors whitepaper + scoring.move) ───────

function mapToCurve(normalized: number, curveType: number): number {
  if (curveType === 1) return normalized * normalized; // convex: x²
  if (curveType === 2) return Math.sqrt(normalized);   // concave: √x
  return normalized;                                    // linear: x
}

function computeEffectiveCpm(
  trustScore: number,
  floorCpm: number,
  ceilingCpm: number,
  curveType: number,
): number {
  const normalized = Math.max(0, Math.min(1, (trustScore - 1) / 9));
  const reputationFactor = mapToCurve(normalized, curveType);
  // Assume 85% confidence (quality_factor ≈ 0.25)
  const qualityFactor = 0.25;
  const combined = reputationFactor * 0.5 + qualityFactor * 0.5;
  return floorCpm + combined * (ceilingCpm - floorCpm);
}

// ── Custom tooltip ───────────────────────────────────────────

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-[#1a1a1a] border border-white/[0.08] px-3 py-2 shadow-xl">
      <div className="text-[10px] text-zinc-500 mb-0.5">
        Trust Score {d.trust.toFixed(1)}
      </div>
      <div className="text-[14px] font-bold font-mono text-white">
        ${d.cpm.toFixed(2)}
        <span className="text-[10px] font-normal text-zinc-500 ml-1">/ 1K views</span>
      </div>
    </div>
  );
}

// ── Chart component ──────────────────────────────────────────

export function CpmCurveChart({
  floorCpm,
  ceilingCpm,
  curveType,
}: {
  floorCpm: number;
  ceilingCpm: number;
  curveType: number;
}) {
  const data = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const trust = 1 + (i / 50) * 9;
      const cpm = computeEffectiveCpm(trust, floorCpm, ceilingCpm, curveType);
      pts.push({ trust: +trust.toFixed(1), cpm: +cpm.toFixed(4) });
    }
    return pts;
  }, [floorCpm, ceilingCpm, curveType]);

  const curveLabel = curveType === 1 ? "Convex" : curveType === 2 ? "Concave" : "Linear";

  // Key trust score breakpoints for the legend
  const breakpoints = [1, 3, 5, 7, 10].map((t) => ({
    trust: t,
    cpm: computeEffectiveCpm(t, floorCpm, ceilingCpm, curveType),
  }));

  return (
    <div className="rounded-lg bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
        <div className="text-[11px] font-medium text-zinc-400">
          Effective CPM by Clipper Trust Score
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">
          {curveLabel} · 85% confidence
        </div>
      </div>

      <div className="px-2 pb-1" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="cpmFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FA4616" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FA4616" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="trust"
              type="number"
              domain={[1, 10]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              label={{
                value: "Trust Score",
                position: "insideBottom",
                offset: -2,
                fill: "rgba(255,255,255,0.2)",
                fontSize: 9,
              }}
            />

            <YAxis
              domain={[
                (dataMin: number) => Math.floor(dataMin * 20) / 20,
                (dataMax: number) => Math.ceil(dataMax * 20) / 20,
              ]}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              width={60}
              label={{
                value: "Effective CPM",
                angle: -90,
                position: "insideLeft",
                offset: 14,
                style: {
                  fill: "rgba(255,255,255,0.2)",
                  fontSize: 9,
                  fontFamily: "sans-serif",
                },
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.1)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="cpm"
              stroke="#FA4616"
              strokeWidth={2.5}
              fill="url(#cpmFill)"
            />

            {/* Endpoint dots */}
            <ReferenceDot
              x={1}
              y={breakpoints[0].cpm}
              r={5}
              fill="#FA4616"
              stroke="#151515"
              strokeWidth={2}
            />
            <ReferenceDot
              x={10}
              y={breakpoints[4].cpm}
              r={5}
              fill="#FA4616"
              stroke="#151515"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend: CPM at key trust scores */}
      <div className="grid grid-cols-5 gap-1 px-4 pb-3.5 pt-1 border-t border-white/[0.04]">
        {breakpoints.map(({ trust, cpm }) => (
          <div key={trust} className="text-center">
            <div className="text-[12px] font-mono font-bold text-white">
              ${cpm.toFixed(2)}
            </div>
            <div className="text-[9px] text-zinc-600">
              Score {trust.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
