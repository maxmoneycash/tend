"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   DisputeTimeline — Vertical timeline showing how a hypothetical
   dispute is resolved using on-chain evidence.

   Scroll-triggered, step-by-step reveal with dramatic pacing.
   ═══════════════════════════════════════════════════════════════ */

/* ── Step data ─────────────────────────────────────────────────── */

interface TimelineStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  lines: (string | { text: string; mono?: boolean; highlight?: string })[];
  badge: { label: string; color: string; glow: string };
  timestamp?: string;
  radar?: { label: string; value: number }[];
  isConclusion?: boolean;
}

const STEPS: TimelineStep[] = [
  {
    id: "view-verification",
    title: "Oracle Report #1 \u2014 View Verification",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    iconColor: "rgb(59, 130, 246)",
    iconBg: "rgba(59, 130, 246, 0.15)",
    lines: [
      "Oracle queried YouTube Data API v3",
      { text: "Result: 508,247 verified views (public video)", highlight: "rgb(74, 222, 128)" },
      { text: "Response hash: 0xa7b3f9...2c41", mono: true },
    ],
    badge: { label: "VERIFIED", color: "rgb(34, 197, 94)", glow: "rgba(34, 197, 94, 0.3)" },
    timestamp: "March 15, 2:14 PM UTC",
  },
  {
    id: "engagement-analysis",
    title: "Oracle Report #2 \u2014 Engagement Analysis",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    iconColor: "rgb(59, 130, 246)",
    iconBg: "rgba(59, 130, 246, 0.15)",
    lines: [
      { text: "Engagement ratio: 2.8% (likes/views)", highlight: "rgb(74, 222, 128)" },
      "Comment sentiment: 87% positive",
      "Share count: 4,231 (healthy)",
    ],
    badge: { label: "ORGANIC", color: "rgb(34, 197, 94)", glow: "rgba(34, 197, 94, 0.3)" },
    timestamp: "March 15, 2:14 PM UTC",
  },
  {
    id: "bot-detection",
    title: "Bot Detection Assessment",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    iconColor: "rgb(34, 197, 94)",
    iconBg: "rgba(34, 197, 94, 0.15)",
    lines: [
      "5-signal weighted analysis:",
    ],
    radar: [
      { label: "Velocity", value: 12 },
      { label: "Engagement", value: 8 },
      { label: "Acct Age", value: 5 },
      { label: "View/Follow", value: 22 },
      { label: "Share", value: 18 },
    ],
    badge: { label: "CLEAN", color: "rgb(34, 197, 94)", glow: "rgba(34, 197, 94, 0.3)" },
    timestamp: "March 15, 2:14 PM UTC",
  },
  {
    id: "shelby-attestation",
    title: "Shelby Evidence Attestation",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    iconColor: "rgb(168, 85, 247)",
    iconBg: "rgba(168, 85, 247, 0.15)",
    lines: [
      "Content existed at: March 14, 11:02 AM UTC",
      { text: "Evidence pack hash: 0x6ce68f8f...", mono: true },
      { text: "Shelby blob: cr/attestations/...", mono: true },
      { text: "Merkle proof: valid (3 nodes verified)", highlight: "rgb(192, 132, 252)" },
    ],
    badge: { label: "ATTESTED", color: "rgb(168, 85, 247)", glow: "rgba(168, 85, 247, 0.3)" },
    timestamp: "March 15, 2:15 PM UTC",
  },
  {
    id: "payout-record",
    title: "On-Chain Payout Record",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    iconColor: "rgb(249, 115, 22)",
    iconBg: "rgba(249, 115, 22, 0.15)",
    lines: [
      "Smart contract calculated:",
      { text: "508,247 views \u00d7 $0.75/1K = $380.69 gross", highlight: "rgba(255,255,255,0.88)" },
      "Platform fee (5%): -$19.03",
      { text: "Creator payout: $361.65 USDT", highlight: "rgb(74, 222, 128)" },
      { text: "Tx: 0x8b42...c71d", mono: true },
    ],
    badge: { label: "PAID", color: "rgb(34, 197, 94)", glow: "rgba(34, 197, 94, 0.3)" },
    timestamp: "March 15, 2:15 PM UTC",
  },
  {
    id: "resolution",
    title: "Dispute Resolution",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    iconColor: "rgb(34, 197, 94)",
    iconBg: "rgba(34, 197, 94, 0.2)",
    lines: [
      { text: "Evidence supports the creator.", highlight: "rgb(74, 222, 128)" },
      { text: "5/5 verification checks passed", highlight: "rgb(74, 222, 128)" },
      "All evidence is cryptographically signed and publicly verifiable",
      { text: "The brand\u2019s dispute is resolved \u2014 the data is on-chain.", highlight: "rgba(255,255,255,0.95)" },
    ],
    badge: { label: "RESOLVED \u2014 Creator Verified", color: "rgb(34, 197, 94)", glow: "rgba(34, 197, 94, 0.45)" },
    isConclusion: true,
  },
];

/* ── Mini radar chart for bot detection ───────────────────────── */

function MiniRadar({ signals, animate }: { signals: { label: string; value: number }[]; animate: boolean }) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 52;
  const count = signals.length;

  const getPoint = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  };

  // Threshold polygon (at 85/100)
  const thresholdPoints = signals
    .map((_, i) => {
      const p = getPoint(i, (85 / 100) * maxR);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  // Value polygon
  const valuePoints = signals
    .map((s, i) => {
      const p = getPoint(i, (s.value / 100) * maxR);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, marginBottom: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={signals.map((_, i) => { const p = getPoint(i, maxR * f); return `${p.x},${p.y}`; }).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {signals.map((_, i) => {
          const p = getPoint(i, maxR);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}
        {/* Threshold line (dashed) */}
        <polygon
          points={thresholdPoints}
          fill="rgba(239, 68, 68, 0.05)"
          stroke="rgba(239, 68, 68, 0.3)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Value polygon */}
        <motion.polygon
          points={animate ? valuePoints : signals.map((_, i) => `${cx},${cy}`).join(" ")}
          animate={{ points: valuePoints }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          fill="rgba(34, 197, 94, 0.15)"
          stroke="rgb(34, 197, 94)"
          strokeWidth="1.5"
        />
        {/* Value dots */}
        {signals.map((s, i) => {
          const p = getPoint(i, (s.value / 100) * maxR);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="rgb(34, 197, 94)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
            />
          );
        })}
        {/* Labels */}
        {signals.map((s, i) => {
          const p = getPoint(i, maxR + 16);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.45)"
              fontSize="9"
              fontWeight="500"
            >
              {s.label}
            </text>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {signals.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", width: 72, fontWeight: 500 }}>{s.label}</span>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 2, background: s.value < 30 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}
              />
            </div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", fontSize: 11, fontWeight: 600, width: 24, textAlign: "right" }}>{s.value}</span>
          </div>
        ))}
        <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          Weighted score: <span style={{ color: "rgb(74, 222, 128)", fontWeight: 700 }}>15/100</span>
          <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>(threshold: 85)</span>
        </div>
      </div>
    </div>
  );
}

/* ── Avatars for the scenario header ──────────────────────────── */

function BrandAvatar() {
  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.08) 100%)",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(248, 113, 113)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    </div>
  );
}

function CreatorAvatar() {
  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.08) 100%)",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(74, 222, 128)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

/* ── Timeline step card ───────────────────────────────────────── */

function StepCard({
  step,
  index,
  visible,
  isLast,
}: {
  step: TimelineStep;
  index: number;
  visible: boolean;
  isLast: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "relative",
            display: "flex",
            gap: 0,
            alignItems: "flex-start",
          }}
        >
          {/* ── Timeline column: dot + line ── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 48,
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}>
            {/* Dot / icon circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
              style={{
                width: step.isConclusion ? 44 : 38,
                height: step.isConclusion ? 44 : 38,
                borderRadius: "50%",
                background: step.iconBg,
                border: `2px solid ${step.iconColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: step.iconColor,
                boxShadow: step.isConclusion
                  ? `0 0 20px ${step.badge.glow}, 0 0 40px ${step.badge.glow}`
                  : `0 0 12px ${step.iconBg}`,
                position: "relative",
                zIndex: 2,
              }}
            >
              {step.icon}
              {/* Conclusion glow pulse ring */}
              {step.isConclusion && (
                <motion.div
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: `2px solid ${step.iconColor}`,
                    pointerEvents: "none",
                  }}
                />
              )}
            </motion.div>
          </div>

          {/* ── Card content ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              flex: 1,
              minWidth: 0,
              background: step.isConclusion
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(34, 197, 94, 0.01) 100%)"
                : "transparent",
              border: "none",
              borderRadius: 0,
              padding: step.isConclusion ? "22px 24px" : "16px 20px 16px 4px",
              position: "relative",
              overflow: "hidden",
              marginBottom: isLast ? 0 : 0,
              ...(step.isConclusion ? {
                borderRadius: 12,
                boxShadow: "0 0 20px rgba(34,197,94,0.1)",
              } : {}),
            }}
          >
            {/* Conclusion card background glow */}
            {step.isConclusion && (
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(34, 197, 94, 0.12) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Card header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
              flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: step.isConclusion ? 17 : 14,
                fontWeight: 700,
                color: step.isConclusion ? "rgb(74, 222, 128)" : "#fff",
                letterSpacing: "-0.02em",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}>
                {step.title}
              </span>
              {step.timestamp && (
                <span style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                  fontFamily: "'Geist Mono', monospace",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}>
                  {step.timestamp}
                </span>
              )}
            </div>

            {/* Content lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {step.lines.map((line, i) => {
                const text = typeof line === "string" ? line : line.text;
                const mono = typeof line === "object" && line.mono;
                const highlight = typeof line === "object" ? line.highlight : undefined;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                    style={{
                      fontSize: step.isConclusion ? 14 : 13,
                      fontWeight: highlight ? 600 : 500,
                      color: highlight || "rgba(255,255,255,0.55)",
                      lineHeight: 1.5,
                      ...(mono
                        ? {
                            fontFamily: "'Geist Mono', monospace",
                            fontVariantNumeric: "tabular-nums" as const,
                            fontSize: 12,
                            color: highlight || "rgba(255,255,255,0.4)",
                          }
                        : {}),
                    }}
                  >
                    {text}
                  </motion.div>
                );
              })}
            </div>

            {/* Radar chart for bot detection */}
            {step.radar && (
              <MiniRadar signals={step.radar} animate={visible} />
            )}

            {/* Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 18,
                delay: step.isConclusion ? 0.4 : 0.35,
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                padding: step.isConclusion ? "8px 18px" : "5px 12px",
                borderRadius: 100,
                background: `${step.badge.color}15`,
                border: `1px solid ${step.badge.color}40`,
                boxShadow: `0 0 16px ${step.badge.glow}`,
                fontSize: step.isConclusion ? 14 : 12,
                fontWeight: 700,
                color: step.badge.color,
                letterSpacing: "0.1em",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              <svg width={step.isConclusion ? 16 : 12} height={step.isConclusion ? 16 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {step.badge.label}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main component ───────────────────────────────────────────── */

export function DisputeTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [lineHeight, setLineHeight] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Intersection observer to trigger on scroll ─────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  /* ── Step-by-step reveal with timeouts ─────────────────── */
  const runSequence = useCallback(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const stepDelay = 400; // ms between each step

    STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
        // Animate the vertical timeline line
        const progress = (i + 1) / STEPS.length;
        setLineHeight(progress * 100);
      }, i * stepDelay + 200); // +200ms initial delay
      timeouts.push(t);
    });

    timeoutsRef.current = timeouts;
  }, []);

  useEffect(() => {
    if (started) runSequence();
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [started, runSequence]);

  return (
    <section
      ref={containerRef}
      style={{
        background: "transparent",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial background glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        {/* ── Section label ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 100,
              background: "rgba(168, 85, 247, 0.1)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              fontSize: 13,
              fontWeight: 600,
              color: "rgb(192, 132, 252)",
              letterSpacing: "0.1em",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            DISPUTE RESOLUTION
          </span>
        </motion.div>

        {/* ── Title ── */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: "center",
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          What Happens When Someone Disputes a Payout?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: "center",
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "rgba(255,255,255,0.5)",
            maxWidth: 540,
            margin: "0 auto",
            lineHeight: 1.6,
            marginBottom: 48,
          }}
        >
          A brand claims a creator&apos;s 500K views are fake. The creator says they&apos;re legitimate. Let&apos;s see what the on-chain evidence says.
        </motion.p>

        {/* ── Brand vs Creator header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 48,
          }}
          className="dispute-header-grid"
        >
          {/* Brand side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 0,
              background: "transparent",
              border: "none",
            }}
          >
            <BrandAvatar />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgb(248, 113, 113)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                Brand disputes
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500, lineHeight: 1.4 }}>
                &ldquo;Views look artificial&rdquo;
              </div>
            </div>
          </div>

          {/* Creator side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 0,
              background: "transparent",
              border: "none",
            }}
          >
            <CreatorAvatar />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgb(74, 222, 128)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                Creator claims
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500, lineHeight: 1.4 }}>
                &ldquo;Views are real, check the proof&rdquo;
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Timeline container ── */}
        <div style={{ position: "relative" }}>
          {/* Vertical timeline line (draws itself) */}
          <div
            style={{
              position: "absolute",
              left: 23,
              top: 20,
              bottom: 20,
              width: 2,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 1,
              zIndex: 1,
            }}
          >
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: `${lineHeight}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: "100%",
                background: "linear-gradient(180deg, rgb(59, 130, 246), rgb(168, 85, 247), rgb(34, 197, 94))",
                borderRadius: 1,
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
              }}
            />
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 2 }}>
            {STEPS.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                visible={i <= currentStep}
                isLast={i === STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* ── Bottom summary ── */}
        <AnimatePresence>
          {currentStep >= STEPS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textAlign: "center",
                marginTop: 48,
              }}
            >
              <p style={{
                fontSize: 15,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                maxWidth: 480,
                margin: "0 auto",
              }}>
                Every piece of evidence is{" "}
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  cryptographically signed
                </span>
                ,{" "}
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  timestamped on-chain
                </span>
                , and{" "}
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  publicly verifiable
                </span>
                . Disputes resolve themselves.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 640px) {
          .dispute-header-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
