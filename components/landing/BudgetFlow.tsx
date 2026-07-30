"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { animate } from "motion";

/* ── Flow data (Yunakin Land Tax) ─────────────── */
const DEPOSIT = 2000.0;
const CREATOR_PAYOUTS = 789.59;
const PLATFORM_FEE = 41.56;
const REMAINING = 1210.41;
const CREATOR_COUNT = 8;

const PAYOUT_PCT = (CREATOR_PAYOUTS / DEPOSIT) * 100;
const FEE_PCT = (PLATFORM_FEE / DEPOSIT) * 100;
const REMAINING_PCT = (REMAINING / DEPOSIT) * 100;

/* ── Helpers ─────────────────────────────────────────── */

function fmtDollar(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Animated flow arrow (repeating gradient) ────────── */

function FlowArrow({
  color,
  thickness,
  delay,
  animated,
}: {
  color: string;
  thickness: number;
  delay: number;
  animated: boolean;
}) {
  return (
    <div
      style={{
        height: thickness,
        borderRadius: thickness / 2,
        background: animated
          ? `linear-gradient(90deg, transparent 0%, ${color}44 20%, ${color} 50%, ${color}44 80%, transparent 100%)`
          : `${color}22`,
        backgroundSize: animated ? "200% 100%" : "100% 100%",
        animation: animated ? `flowStream 2s linear ${delay}s infinite` : "none",
        position: "relative",
        overflow: "hidden",
        flex: 1,
        minWidth: 20,
      }}
    >
      {/* Arrow head */}
      <div
        style={{
          position: "absolute",
          right: -1,
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: `${thickness / 2 + 3}px solid transparent`,
          borderBottom: `${thickness / 2 + 3}px solid transparent`,
          borderLeft: `${thickness / 2 + 4}px solid ${animated ? color : color + "44"}`,
        }}
      />
    </div>
  );
}

/* ── Flow Row ────────────────────────────────────────── */

function FlowRow({
  amount,
  label,
  pct,
  color,
  gradient,
  thickness,
  delay,
  animated,
}: {
  amount: string;
  label: string;
  pct: number;
  color: string;
  gradient?: string;
  thickness: number;
  delay: number;
  animated: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    if (!animated) return;

    animate(
      (progress: number) => {
        const current = progress * pct;
        setDisplayPct(Math.round(current * 10) / 10);
        if (barRef.current) {
          barRef.current.style.width = `${current}%`;
        }
      },
      { duration: 1.4, easing: [0.16, 1, 0.3, 1] }
    );
  }, [animated, pct]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <FlowArrow
          color={color}
          thickness={thickness}
          delay={delay}
          animated={animated}
        />
        <div style={{ minWidth: 180, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              marginRight: 6,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            {amount}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Percentage bar */}
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
          marginLeft: 0,
        }}
      >
        <div
          ref={barRef}
          style={{
            height: "100%",
            borderRadius: 2,
            background: gradient || color,
            width: "0%",
            transition: "none",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          fontVariantNumeric: "tabular-nums",
          fontFamily: "'Geist Mono', monospace",
        }}
      >
        {displayPct.toFixed(1)}%
      </span>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */

export function BudgetFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const runAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
  }, [hasAnimated]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runAnimation]);

  return (
    <div
      ref={containerRef}
      style={{
        background: "transparent",
        padding: "0 8px",
        width: "100%",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      {/* CSS keyframe for streaming flow animation */}
      <style>{`
        @keyframes flowStream {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(250,70,22,0.3), 0 0 40px rgba(250,70,22,0.1); }
          50% { box-shadow: 0 0 30px rgba(250,70,22,0.5), 0 0 60px rgba(250,70,22,0.2); }
        }
        @keyframes lockPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @media (max-width: 640px) {
          .budget-flow-main {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .budget-flow-left {
            flex-direction: row !important;
            justify-content: center !important;
            gap: 20px !important;
          }
          .budget-flow-right {
            gap: 20px !important;
          }
        }
      `}</style>

      {/* Main horizontal layout */}
      <div
        className="budget-flow-main"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 32,
        }}
      >
        {/* LEFT: Deposit + Escrow */}
        <div
          className="budget-flow-left"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
            minWidth: 140,
          }}
        >
          {/* Deposit circle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FA4616, #e03e12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: hasAnimated ? "pulseGlow 3s ease-in-out infinite" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                $2,000
                <br />
                <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.8, letterSpacing: "0.1em" }}>USDT</span>
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Brand Deposit
            </span>
          </div>

          {/* Arrow down */}
          <svg width="2" height="24" style={{ opacity: 0.3 }}>
            <line x1="1" y1="0" x2="1" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 3" />
            <polygon points="0,20 2,20 1,24" fill="rgba(255,255,255,0.4)" />
          </svg>

          {/* Escrow lock */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: hasAnimated ? "lockPulse 4s ease-in-out infinite" : "none",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                lineHeight: 1.3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Smart Contract
              <br />
              Escrow
            </span>
          </div>
        </div>

        {/* RIGHT: Three flow rows */}
        <div
          className="budget-flow-right"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            justifyContent: "center",
            minHeight: 260,
          }}
        >
          <FlowRow
            amount={fmtDollar(CREATOR_PAYOUTS)}
            label={`Creator Payouts (${CREATOR_COUNT} creators)`}
            pct={PAYOUT_PCT}
            color="#22c55e"
            gradient="linear-gradient(90deg, #22c55e, #34d399)"
            thickness={8}
            delay={0.2}
            animated={hasAnimated}
          />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
          <FlowRow
            amount={fmtDollar(PLATFORM_FEE)}
            label="Platform Fee (5%)"
            pct={FEE_PCT}
            color="#6b7280"
            thickness={4}
            delay={0.5}
            animated={hasAnimated}
          />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
          <FlowRow
            amount={fmtDollar(REMAINING)}
            label="Remaining in Escrow"
            pct={REMAINING_PCT}
            color="#3b82f6"
            thickness={6}
            delay={0.8}
            animated={hasAnimated}
          />
        </div>
      </div>

      {/* Bottom text */}
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.3)",
          margin: "28px 0 0 0",
          lineHeight: 1.6,
          letterSpacing: "0.2px",
          maxWidth: 480,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Budget locked on-chain before creators start. Payouts calculated by smart
        contract, not by the brand.
      </p>
    </div>
  );
}
