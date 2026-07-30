// @ts-nocheck
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

/* ────────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────────── */

interface Step {
  hour: number;
  views: number;
  payout: number;
  cumulative: number;
}

interface Submission {
  id: string;
  label: string;
  color: string;
  steps: Step[];
}

const SUBMISSIONS: Submission[] = [
  {
    id: "zx8RsYjf",
    label: "Yunakin Garage",
    color: "#FA4616",
    steps: [
      { hour: 0.5, views: 150000, payout: 106.88, cumulative: 106.88 },
      { hour: 1.5, views: 380000, payout: 163.88, cumulative: 270.75 },
      { hour: 3.0, views: 720000, payout: 242.25, cumulative: 512.99 },
      { hour: 6.0, views: 1100000, payout: 196.94, cumulative: 333.93 },
    ],
  },
  {
    id: "jPThSwhJ8CE",
    label: "Ranch Life Clip",
    color: "#3b82f6",
    steps: [
      { hour: 1.0, views: 50000, payout: 35.63, cumulative: 35.63 },
      { hour: 4.0, views: 180000, payout: 92.63, cumulative: 128.25 },
      { hour: 8.0, views: 310000, payout: 92.63, cumulative: 220.88 },
      { hour: 12.0, views: 408969, payout: 70.17, cumulative: 291.05 },
    ],
  },
  {
    id: "PpJY1Lyqdw4",
    label: "Surprise Car",
    color: "#22c55e",
    steps: [
      { hour: 0.1, views: 122001, payout: 86.93, cumulative: 86.93 },
    ],
  },
  {
    id: "kcGGSoaN2zA",
    label: "Family BBQ",
    color: "#8B5CF6",
    steps: [
      { hour: 2.0, views: 15000, payout: 10.69, cumulative: 10.69 },
      { hour: 6.0, views: 28000, payout: 9.28, cumulative: 19.96 },
      { hour: 10.0, views: 40094, payout: 8.22, cumulative: 28.18 },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────────────── */

const X_MAX = 24;
const Y_MAX = 400;
const Y_TICKS = [0, 100, 200, 300];
const X_TICKS = [0, 6, 12, 18, 24];
const PAD = { top: 16, right: 52, bottom: 32, left: 12 };

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

function fmtDollar(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

/* ────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────── */

export function EarningsWaterfall() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [dims, setDims] = useState({ w: 800, h: 340 });
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [mouseClientPos, setMouseClientPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<Set<number>>(
    () => new Set(SUBMISSIONS.map((_, i) => i))
  );
  const [entered, setEntered] = useState(false);

  // ResizeObserver for responsive width
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setDims({ w, h: Math.max(300, Math.min(420, w * 0.42)) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // IntersectionObserver for entrance
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEntered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Plot area
  const plotW = dims.w - PAD.left - PAD.right;
  const plotH = dims.h - PAD.top - PAD.bottom;

  const xScale = useCallback((h: number) => PAD.left + (h / X_MAX) * plotW, [plotW]);
  const yScale = useCallback((d: number) => PAD.top + plotH - (d / Y_MAX) * plotH, [plotH]);

  // Build step path + area path for each submission
  const paths = useMemo(() => {
    return SUBMISSIONS.map((sub) => {
      const lineSegs: string[] = [];
      const areaSegs: string[] = [];
      let prevX = xScale(0);
      let prevY = yScale(0);

      lineSegs.push(`M ${prevX} ${prevY}`);
      areaSegs.push(`M ${prevX} ${yScale(0)}`);
      areaSegs.push(`L ${prevX} ${prevY}`);

      for (const step of sub.steps) {
        const sx = xScale(step.hour);
        const sy = yScale(step.cumulative);
        // horizontal then vertical (staircase)
        lineSegs.push(`L ${sx} ${prevY}`);
        lineSegs.push(`L ${sx} ${sy}`);
        areaSegs.push(`L ${sx} ${prevY}`);
        areaSegs.push(`L ${sx} ${sy}`);
        prevX = sx;
        prevY = sy;
      }

      // extend flat to end
      lineSegs.push(`L ${xScale(X_MAX)} ${prevY}`);
      areaSegs.push(`L ${xScale(X_MAX)} ${prevY}`);
      // close area back down
      areaSegs.push(`L ${xScale(X_MAX)} ${yScale(0)}`);
      areaSegs.push("Z");

      return { line: lineSegs.join(" "), area: areaSegs.join(" ") };
    });
  }, [xScale, yScale]);

  // Measure path lengths after render
  const pathLengths = useRef<number[]>([]);
  useEffect(() => {
    if (!svgRef.current) return;
    const els = svgRef.current.querySelectorAll<SVGPathElement>("[data-line]");
    pathLengths.current = Array.from(els).map((p) => p.getTotalLength());
  }, [paths, dims]);

  // Cumulative value at a given hour for a submission
  const valueAtHour = useCallback((sub: Submission, hour: number): number => {
    let val = 0;
    for (const step of sub.steps) {
      if (step.hour <= hour) val = step.cumulative;
      else break;
    }
    return val;
  }, []);

  // Nearest step to a given hour
  const nearestStep = useCallback((sub: Submission, hour: number): Step | null => {
    let best: Step | null = null;
    let bestDist = Infinity;
    for (const step of sub.steps) {
      const d = Math.abs(step.hour - hour);
      if (d < bestDist) {
        bestDist = d;
        best = step;
      }
    }
    return best;
  }, []);

  // Mouse handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const scaleX = dims.w / rect.width;
      const scaledX = localX * scaleX;

      if (scaledX >= PAD.left && scaledX <= dims.w - PAD.right && localY * (dims.h / rect.height) >= PAD.top && localY * (dims.h / rect.height) <= dims.h - PAD.bottom) {
        const hour = ((scaledX - PAD.left) / plotW) * X_MAX;
        setHoveredX(hour);
        setMouseClientPos({ x: localX, y: localY });
      } else {
        setHoveredX(null);
        setMouseClientPos(null);
      }
    },
    [dims, plotW]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredX(null);
    setMouseClientPos(null);
  }, []);

  const toggleSeries = useCallback((idx: number) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        if (next.size > 1) next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  // Computed summary
  const totalEarned = useMemo(
    () => SUBMISSIONS.reduce((s, sub) => s + sub.steps[sub.steps.length - 1].cumulative, 0),
    []
  );
  const avgEarned = totalEarned / SUBMISSIONS.length;

  // Tooltip data at hoveredX
  const tooltipData = useMemo(() => {
    if (hoveredX === null) return null;
    // Find the submission with the highest value at this hour among visible ones, for primary display
    // Show the nearest step's data
    const items: { sub: Submission; idx: number; val: number; step: Step | null }[] = [];
    SUBMISSIONS.forEach((sub, i) => {
      if (!visibleSeries.has(i)) return;
      const val = valueAtHour(sub, hoveredX);
      const step = nearestStep(sub, hoveredX);
      items.push({ sub, idx: i, val, step });
    });
    // Sort by value descending
    items.sort((a, b) => b.val - a.val);
    return items.length > 0 ? items[0] : null;
  }, [hoveredX, visibleSeries, valueAtHour, nearestStep]);

  // Crosshair pixel X
  const crosshairPx = hoveredX !== null ? xScale(hoveredX) : null;

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <style>{`
        @keyframes ew-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ew-dot-flash {
          0% { r: 3; opacity: 1; }
          30% { r: 7; opacity: 0.9; }
          60% { r: 5; opacity: 0.5; }
          100% { r: 3; opacity: 0.7; }
        }
        @keyframes ew-area-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Floating label */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          fontSize: 9,
          fontFamily: "'Geist Mono', monospace",
          color: "rgba(255,255,255,0.15)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          zIndex: 2,
          userSelect: "none",
        }}
      >
        EARNINGS
      </motion.span>

      {/* Chart */}
      <div style={{ position: "relative", marginTop: 18, cursor: "crosshair" }}>
        <svg
          ref={svgRef}
          width={dims.w}
          height={dims.h}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient defs for area fills */}
          <defs>
            {SUBMISSIONS.map((sub, i) => (
              <linearGradient key={`grad-${i}`} id={`ew-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sub.color} stopOpacity={0.08} />
                <stop offset="100%" stopColor={sub.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal grid lines - fade in */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            {Y_TICKS.map((d) => (
              <line
                key={`hg-${d}`}
                x1={PAD.left}
                y1={yScale(d)}
                x2={dims.w - PAD.right}
                y2={yScale(d)}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={1}
              />
            ))}
          </motion.g>

          {/* Y-axis labels (right-aligned) */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {Y_TICKS.map((d) => (
              <text
                key={`yl-${d}`}
                x={dims.w - PAD.right + 8}
                y={yScale(d) + 3}
                fill="rgba(255,255,255,0.12)"
                fontSize={9}
                fontFamily="'Geist Mono', monospace"
                textAnchor="start"
              >
                ${d}
              </text>
            ))}
          </motion.g>

          {/* X-axis labels */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {X_TICKS.map((h) => (
              <text
                key={`xl-${h}`}
                x={xScale(h)}
                y={dims.h - PAD.bottom + 18}
                fill="rgba(255,255,255,0.12)"
                fontSize={9}
                fontFamily="'Geist Mono', monospace"
                textAnchor="middle"
              >
                {h}h
              </text>
            ))}
          </motion.g>

          {/* Area fills */}
          {SUBMISSIONS.map((sub, si) => {
            if (!visibleSeries.has(si)) return null;
            const isDimmed = selectedSubmission !== null && selectedSubmission !== si;
            return (
              <path
                key={`area-${si}`}
                d={paths[si].area}
                fill={`url(#ew-grad-${si})`}
                opacity={isDimmed ? 0.15 : 1}
                style={
                  entered
                    ? {
                        animation: `ew-area-fade 1s ease-out ${si * 0.3 + 0.5}s both`,
                      }
                    : { opacity: 0 }
                }
              />
            );
          })}

          {/* Step lines */}
          {SUBMISSIONS.map((sub, si) => {
            if (!visibleSeries.has(si)) return null;
            const isDimmed = selectedSubmission !== null && selectedSubmission !== si;
            const len = pathLengths.current[si] || 2000;

            return (
              <path
                key={`line-${si}`}
                data-line={si}
                d={paths[si].line}
                fill="none"
                stroke={sub.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={isDimmed ? 0.15 : 0.9}
                style={
                  entered
                    ? {
                        strokeDasharray: len,
                        strokeDashoffset: len,
                        animation: `ew-draw 2.5s ease-out ${si * 0.3}s forwards`,
                        transition: "opacity 0.3s ease",
                      }
                    : {
                        strokeDasharray: len,
                        strokeDashoffset: len,
                        transition: "opacity 0.3s ease",
                      }
                }
              />
            );
          })}

          {/* Step dots */}
          {entered &&
            SUBMISSIONS.map((sub, si) => {
              if (!visibleSeries.has(si)) return null;
              const isDimmed = selectedSubmission !== null && selectedSubmission !== si;
              return sub.steps.map((step, sti) => {
                const cx = xScale(step.hour);
                const cy = yScale(step.cumulative);
                // Calculate when this dot should appear based on the line draw timing
                // The line draws over 2.5s with stagger of 0.3s per line
                // Each dot appears roughly when the line reaches it
                const lineProgress = (step.hour / X_MAX);
                const dotDelay = si * 0.3 + lineProgress * 2.5;
                return (
                  <circle
                    key={`dot-${si}-${sti}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={sub.color}
                    opacity={0}
                    style={{
                      animation: `ew-dot-flash 0.6s ease-out ${dotDelay}s forwards`,
                      opacity: isDimmed ? 0.15 : undefined,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                );
              });
            })}

          {/* Vertical crosshair */}
          {crosshairPx !== null && (
            <line
              x1={crosshairPx}
              y1={PAD.top}
              x2={crosshairPx}
              y2={dims.h - PAD.bottom}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          )}

          {/* Intersection dots on crosshair */}
          {hoveredX !== null &&
            SUBMISSIONS.map((sub, si) => {
              if (!visibleSeries.has(si)) return null;
              const val = valueAtHour(sub, hoveredX);
              if (val === 0 && sub.steps[0].hour > hoveredX) return null;
              return (
                <circle
                  key={`ch-dot-${si}`}
                  cx={crosshairPx!}
                  cy={yScale(val)}
                  r={3.5}
                  fill={sub.color}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={1}
                />
              );
            })}
        </svg>

        {/* Tooltip — glass panel */}
        {hoveredX !== null && tooltipData && mouseClientPos && (
          <div
            style={{
              position: "absolute",
              left: mouseClientPos.x + 16,
              top: mouseClientPos.y - 20,
              pointerEvents: "none",
              zIndex: 20,
              background: "rgba(10,10,10,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "10px 14px",
              minWidth: 140,
              transform:
                mouseClientPos.x > dims.w * 0.65
                  ? "translateX(calc(-100% - 32px))"
                  : "none",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: "'Geist Mono', monospace",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 4,
              }}
            >
              {tooltipData.sub.id}
            </div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 2,
              }}
            >
              {fmtDollar(tooltipData.val)}
            </div>
            {tooltipData.step && (
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'Geist Mono', monospace",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {fmtViews(tooltipData.step.views)} views
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 12,
          paddingLeft: PAD.left,
        }}
      >
        {SUBMISSIONS.map((sub, si) => {
          const active = visibleSeries.has(si);
          return (
            <button
              key={sub.id}
              onClick={() => toggleSeries(si)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                opacity: active ? 1 : 0.1,
                transition: "opacity 0.25s ease",
                outline: "none",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: sub.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'Geist Mono', monospace",
                  color: active
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.3)",
                  transition: "color 0.25s ease",
                }}
              >
                {sub.id}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Summary line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.5 }}
        style={{
          marginTop: 10,
          paddingLeft: PAD.left,
          fontSize: 11,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        <span style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
          {SUBMISSIONS.length}
        </span>{" "}
        clips{" "}
        <span style={{ margin: "0 2px", color: "rgba(255,255,255,0.1)" }}>&middot;</span>{" "}
        <span style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
          {fmtDollar(totalEarned)}
        </span>{" "}
        total{" "}
        <span style={{ margin: "0 2px", color: "rgba(255,255,255,0.1)" }}>&middot;</span>{" "}
        avg{" "}
        <span style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
          {fmtDollar(avgEarned)}
        </span>
      </motion.div>
    </div>
  );
}
