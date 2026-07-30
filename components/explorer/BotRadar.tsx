"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "motion/react";

/* ── Data ─────────────────────────────────────────────────── */

const N = 5;
const STEP = (Math.PI * 2) / N;
const TOP = -Math.PI / 2;

const LABELS = ["Velocity", "Engagement", "Acct Age", "View/Follow", "Shares"];
const WEIGHTS = [0.25, 0.3, 0.15, 0.15, 0.15];

type Status = "clean" | "moderate" | "flagged";

interface Sub {
  id: string;
  botScore: number;
  signals: readonly [number, number, number, number, number];
  status: Status;
}

const SUBS: Sub[] = [
  { id: "zx8RsYjf", botScore: 15, signals: [12, 8, 5, 22, 18], status: "clean" },
  { id: "jPThSwhJ8CE", botScore: 15, signals: [10, 12, 8, 15, 20], status: "clean" },
  { id: "kcGGSoaN2zA", botScore: 30, signals: [25, 35, 10, 40, 22], status: "moderate" },
  { id: "PpJY1Lyqdw4", botScore: 15, signals: [8, 15, 5, 18, 12], status: "clean" },
  { id: "FLAGGED_DEMO", botScore: 87, signals: [92, 85, 70, 95, 75], status: "flagged" },
];

const PAL: Record<Status, { fill: string; stroke: string; text: string; pill: string }> = {
  clean:    { fill: "rgba(34,197,94,0.12)",  stroke: "#22c55e", text: "#22c55e", pill: "rgba(34,197,94,0.12)" },
  moderate: { fill: "rgba(234,179,8,0.12)",  stroke: "#eab308", text: "#eab308", pill: "rgba(234,179,8,0.12)" },
  flagged:  { fill: "rgba(239,68,68,0.12)",  stroke: "#ef4444", text: "#ef4444", pill: "rgba(239,68,68,0.12)" },
};

const WORD: Record<Status, string> = { clean: "CLEAN", moderate: "MODERATE", flagged: "FLAGGED" };

/* ── Geometry ─────────────────────────────────────────────── */

function ang(i: number) { return TOP + i * STEP; }

function pentagonPoints(cx: number, cy: number, r: number, lv: number): string {
  return Array.from({ length: N }, (_, i) => {
    const a = ang(i);
    const rr = r * (lv / 100);
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(" ");
}

/* ── Animated score counter ───────────────────────────────── */

function ScoreCounter({ value, color }: { value: number; color: string }) {
  const sp = useSpring(0, { stiffness: 50, damping: 18 });
  const rounded = useTransform(sp, (v) => Math.round(v));
  const [txt, setTxt] = useState("0");

  useEffect(() => { sp.set(value); }, [value, sp]);
  useEffect(() => rounded.on("change", (v) => setTxt(String(v))), [rounded]);

  return (
    <span style={{
      fontSize: 48,
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontWeight: 800,
      color,
      lineHeight: 1,
      display: "block",
    }}>
      {txt}
    </span>
  );
}

/* ── Animated radar polygon ───────────────────────────────── */

function RadarPolygon({
  cx, cy, r, values, status, visible,
}: {
  cx: number; cy: number; r: number;
  values: readonly number[];
  status: Status;
  visible: boolean;
}) {
  const c = PAL[status];
  const cfg = { stiffness: 100, damping: 16, mass: 0.7 };

  /* eslint-disable react-hooks/rules-of-hooks */
  const s0 = useSpring(0, cfg);
  const s1 = useSpring(0, cfg);
  const s2 = useSpring(0, cfg);
  const s3 = useSpring(0, cfg);
  const s4 = useSpring(0, cfg);
  const springs = useMemo(() => [s0, s1, s2, s3, s4], [s0, s1, s2, s3, s4]);

  useEffect(() => {
    values.forEach((v, i) => springs[i].set(visible ? v : 0));
  }, [values, visible, springs]);

  const mk = (sp: MotionValue<number>, i: number, axis: "x" | "y") =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(sp, (v) => {
      const a = ang(i);
      const rr = r * (v / 100);
      return axis === "x" ? cx + rr * Math.cos(a) : cy + rr * Math.sin(a);
    });

  const x0 = mk(s0,0,"x"), y0 = mk(s0,0,"y");
  const x1 = mk(s1,1,"x"), y1 = mk(s1,1,"y");
  const x2 = mk(s2,2,"x"), y2 = mk(s2,2,"y");
  const x3 = mk(s3,3,"x"), y3 = mk(s3,3,"y");
  const x4 = mk(s4,4,"x"), y4 = mk(s4,4,"y");
  /* eslint-enable react-hooks/rules-of-hooks */

  const xs = [x0, x1, x2, x3, x4];
  const ys = [y0, y1, y2, y3, y4];

  const pathD = useTransform(
    [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4] as MotionValue<number>[],
    ([px0, py0, px1, py1, px2, py2, px3, py3, px4, py4]: number[]) =>
      `M ${px0},${py0} L ${px1},${py1} L ${px2},${py2} L ${px3},${py3} L ${px4},${py4} Z`,
  );

  return (
    <g>
      <defs>
        <filter id="radar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={c.stroke} floodOpacity="0.35" />
        </filter>
      </defs>
      <motion.path
        d={pathD}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        filter="url(#radar-glow)"
      />
      {springs.map((_, i) => (
        <motion.circle
          key={i}
          cx={xs[i] as unknown as number}
          cy={ys[i] as unknown as number}
          r={2.5}
          fill={c.stroke}
        />
      ))}
    </g>
  );
}

/* ── Vertex label position helper ─────────────────────────── */

function vertexOffset(i: number, R: number, svgSize: number) {
  const a = ang(i);
  const d = R + 28;
  return {
    xPct: (d * Math.cos(a) / svgSize) * 100,
    yPct: (d * Math.sin(a) / svgSize) * 100,
  };
}

/* ── Main ─────────────────────────────────────────────────── */

export function BotRadar() {
  const [sel, setSel] = useState(0);
  const [vis, setVis] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const sub = SUBS[sel];
  const c = PAL[sub.status];

  // Scroll trigger
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect(); } },
      { threshold: 0.15 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const pick = useCallback((i: number) => setSel(i), []);

  const SZ = 360;
  const CX = SZ / 2;
  const CY = SZ / 2;
  const R = 130;

  return (
    <div ref={root} style={{ position: "relative", width: "100%", maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;800&display=swap');
        .botradar-chips::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Chart container (square, relative for label positioning) ── */}
      <div style={{
        position: "relative",
        width: "100%",
        paddingTop: "100%",
        maxWidth: SZ,
        margin: "0 auto",
      }}>
        <svg
          viewBox={`0 0 ${SZ} ${SZ}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          {/* 3 concentric rings */}
          {[33, 66, 100].map((lv) => (
            <polygon
              key={lv}
              points={pentagonPoints(CX, CY, R, lv)}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={0.5}
            />
          ))}

          {/* Spokes */}
          {Array.from({ length: N }, (_, i) => {
            const a = ang(i);
            return (
              <line
                key={i}
                x1={CX} y1={CY}
                x2={CX + R * Math.cos(a)}
                y2={CY + R * Math.sin(a)}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={0.5}
              />
            );
          })}

          {/* Threshold ring at 85 */}
          <polygon
            points={pentagonPoints(CX, CY, R, 85)}
            fill="none"
            stroke="rgba(239,68,68,0.15)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={CX}
            y={CY - R * 0.85 - 6}
            textAnchor="middle"
            fill="rgba(248,113,113,0.5)"
            fontSize={8}
            fontFamily="'Geist Mono', 'SF Mono', monospace"
          >
            85
          </text>

          {/* Data polygon */}
          <RadarPolygon
            cx={CX} cy={CY} r={R}
            values={sub.signals}
            status={sub.status}
            visible={vis}
          />
        </svg>

        {/* ── Floating HTML axis labels ── */}
        {LABELS.map((label, i) => {
          const { xPct, yPct } = vertexOffset(i, R, SZ);

          let anchor: string;
          if (xPct < -5) anchor = "translate(-100%, -50%)";
          else if (xPct > 5) anchor = "translate(0%, -50%)";
          else anchor = "translate(-50%, -50%)";

          let align: "left" | "right" | "center";
          if (xPct < -5) align = "right";
          else if (xPct > 5) align = "left";
          else align = "center";

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `calc(50% + ${xPct}%)`,
                top: `calc(50% + ${yPct}%)`,
                transform: anchor,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                textAlign: align,
              }}
            >
              <div style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.3,
                fontFamily: "system-ui, sans-serif",
              }}>
                {label}
              </div>
              <div style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.15)",
                fontFamily: "'Geist Mono', 'SF Mono', monospace",
                lineHeight: 1.3,
              }}>
                {WEIGHTS[i].toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Score ── */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <ScoreCounter value={vis ? sub.botScore : 0} color={c.text} />
        <div style={{
          fontSize: 14,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          color: "rgba(255,255,255,0.2)",
          marginTop: 2,
        }}>
          /100
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: c.text,
            background: c.pill,
            padding: "3px 14px",
            borderRadius: 100,
            lineHeight: 1.4,
            fontFamily: "system-ui, sans-serif",
          }}>
            {WORD[sub.status]}
          </span>
        </div>
      </div>

      {/* ── Chip selector ── */}
      <div
        className="botradar-chips"
        style={{
          display: "flex",
          gap: 14,
          marginTop: 24,
          overflowX: "auto",
          scrollbarWidth: "none",
          justifyContent: "center",
          padding: "0 8px 8px",
        }}
      >
        {SUBS.map((s, i) => {
          const active = i === sel;
          const sc = PAL[s.status];
          return (
            <motion.button
              key={s.id}
              onClick={() => pick(i)}
              initial={vis ? { opacity: 0, x: -12 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.25 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 0",
                background: "none",
                border: "none",
                borderBottom: active ? `1.5px solid ${sc.stroke}` : "1.5px solid transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: active ? sc.stroke : "rgba(255,255,255,0.15)",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10,
                fontFamily: "'Geist Mono', 'SF Mono', monospace",
                color: active ? "#fff" : "rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
              }}>
                {s.id}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
