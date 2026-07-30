"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   PayoutRace — "3.8 Seconds" split-screen payout comparison
   Left:  Traditional creator platforms (slow, gray, frustrating)
   Right: Shelby + Aptos (instant, green, celebratory)
   ═══════════════════════════════════════════════════════════════ */

/* ── Step definitions ─────────────────────────────────────────── */

interface Step {
  label: string;
  detail?: string;
  delay: number;        // ms from animation start
  icon: "check" | "spinner" | "clock" | "tx" | "confetti";
  clockLabel?: string;  // for the traditional side's day counter
  timerValue?: string;  // for the Shelby side's running timer
}

const traditionalSteps: Step[] = [
  { label: "Content Submitted",         delay: 0,     icon: "check" },
  { label: "Pending Review...",          delay: 2000,  icon: "spinner" },
  { label: "Day 1... Under Review",     delay: 5000,  icon: "clock", clockLabel: "1 day" },
  { label: "Day 3... Still Reviewing",  delay: 8000,  icon: "clock", clockLabel: "3 days" },
  { label: "Day 5... Approved!",        delay: 11000, icon: "check", clockLabel: "5 days" },
  { label: "Day 7... Payout Processing",delay: 13000, icon: "spinner", clockLabel: "7 days" },
  { label: "Day 9 — $12.50 deposited",  delay: 15000, icon: "check", clockLabel: "9 days" },
];

const shelbySteps: Step[] = [
  { label: "Content Submitted",           delay: 0,    icon: "check",    timerValue: "0.0" },
  { label: "Eligibility Check",           delay: 300,  icon: "check",    timerValue: "0.2" },
  { label: "On-Chain Submit",             delay: 800,  icon: "tx",       timerValue: "0.8" },
  { label: "YouTube Scrape",              delay: 1200, icon: "check",    timerValue: "1.7" },
  { label: "Bot Check",                   delay: 1500, icon: "check",    timerValue: "1.9" },
  { label: "Evidence \u2192 Shelby",      delay: 2000, icon: "check",    timerValue: "3.1" },
  { label: "$86.93 USDT Transferred",     delay: 2500, icon: "confetti", timerValue: "3.8" },
];

const shelbyDetails: Record<number, string> = {
  2: "0x5f09...a3c7",
  3: "122,001 views",
  4: "Score: 15/100",
  5: "blob:0xe7f2...91b4",
};

/* ── Icon sub-components ──────────────────────────────────────── */

function CheckIcon({ color = "#22c55e" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill={color} opacity={0.15} />
      <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: "payout-spin 1s linear infinite" }}>
      <circle cx="10" cy="10" r="8" stroke="#6b7280" strokeWidth="2" opacity={0.2} />
      <path d="M10 2a8 8 0 0 1 8 8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#9ca3af" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {label && <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{label}</span>}
    </div>
  );
}

function TxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="3" stroke="#22c55e" strokeWidth="1.5" />
      <path d="M6 10h8M10 7v6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ConfettiIcon() {
  return (
    <div style={{ position: "relative", width: 20, height: 20 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#22c55e" opacity={0.2} />
        <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StepIcon({ icon, clockLabel, muted }: { icon: Step["icon"]; clockLabel?: string; muted?: boolean }) {
  switch (icon) {
    case "check":    return <CheckIcon color={muted ? "#6b7280" : "#22c55e"} />;
    case "spinner":  return <SpinnerIcon />;
    case "clock":    return <ClockIcon label={clockLabel} />;
    case "tx":       return <TxIcon />;
    case "confetti": return <ConfettiIcon />;
  }
}

/* ── Confetti particles ───────────────────────────────────────── */

function ConfettiParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200 - 60,
    rotate: Math.random() * 720 - 360,
    scale: 0.5 + Math.random() * 0.8,
    color: ["#22c55e", "#4ade80", "#86efac", "#fbbf24", "#60a5fa", "#a78bfa", "#f472b6"][i % 7],
    delay: Math.random() * 0.3,
    shape: i % 3, // 0=circle, 1=square, 2=rect
  }));

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      width: 0,
      height: 0,
      pointerEvents: "none",
      zIndex: 10,
    }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: [0, p.scale, p.scale * 0.5],
            rotate: p.rotate,
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "absolute",
            width: p.shape === 2 ? 8 : 6,
            height: p.shape === 2 ? 4 : 6,
            borderRadius: p.shape === 0 ? "50%" : 1,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

/* ── Glow pulse behind the final payout amount ────────────────── */

function GlowPulse() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.6, 0.3], scale: [0.5, 1.5, 1.2] }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 180,
        height: 80,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(34,197,94,0.35) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ── Main component ───────────────────────────────────────────── */

export function PayoutRace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [tradStep, setTradStep] = useState(-1);
  const [shelbyStep, setShelbyStep] = useState(-1);
  const [shelbyTimer, setShelbyTimer] = useState("0.0");
  const [showConfetti, setShowConfetti] = useState(false);
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  /* ── Run animation sequence once started ────────────────── */
  const runAnimation = useCallback(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Traditional side steps
    traditionalSteps.forEach((step, i) => {
      const t = setTimeout(() => setTradStep(i), step.delay);
      timeouts.push(t);
    });

    // Shelby side steps + timer
    shelbySteps.forEach((step, i) => {
      const t = setTimeout(() => {
        setShelbyStep(i);
        if (step.timerValue) setShelbyTimer(step.timerValue);
        if (step.icon === "confetti") {
          setShowConfetti(true);
        }
      }, step.delay);
      timeouts.push(t);
    });

    timeoutsRef.current = timeouts;
  }, []);

  useEffect(() => {
    if (started) runAnimation();
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [started, runAnimation]);

  /* ── Render a step row ──────────────────────────────────── */
  const renderStep = (
    step: Step,
    index: number,
    currentStep: number,
    side: "trad" | "shelby"
  ) => {
    const active = index <= currentStep;
    const isCurrent = index === currentStep;
    const isTrad = side === "trad";
    const isLastShelby = side === "shelby" && index === shelbySteps.length - 1;

    return (
      <AnimatePresence key={`${side}-${index}`}>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: isLastShelby ? 0.5 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: isLastShelby ? "10px 0" : "7px 0",
              background: "transparent",
              position: "relative",
              overflow: "visible",
              ...(index > 0
                ? { borderTop: "1px solid rgba(255,255,255,0.04)" }
                : {}),
            }}
          >
            {isLastShelby && showConfetti && <ConfettiParticles />}
            {isLastShelby && showConfetti && <GlowPulse />}

            <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
              <StepIcon
                icon={step.icon}
                clockLabel={step.clockLabel}
                muted={isTrad}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
              <div style={{
                fontSize: isLastShelby ? 15 : 13,
                fontWeight: isLastShelby ? 700 : isCurrent ? 600 : 500,
                color: isLastShelby
                  ? "#22c55e"
                  : isTrad
                    ? (step.icon === "check" && index === traditionalSteps.length - 1 ? "#9ca3af" : "#9ca3af")
                    : "#e2e8f0",
                letterSpacing: isLastShelby ? "0.01em" : 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {step.label}
                {!isTrad && step.icon === "check" && index > 0 && index < shelbySteps.length - 1 && (
                  <span style={{ marginLeft: 4 }}>{"\u2713"}</span>
                )}
              </div>

              {/* Detail line for Shelby steps */}
              {!isTrad && shelbyDetails[index] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.25 }}
                  style={{
                    fontSize: 11,
                    fontFamily: "'Geist Mono', monospace",
                    color: "rgba(34,197,94,0.6)",
                    marginTop: 1,
                  }}
                >
                  {shelbyDetails[index]}
                </motion.div>
              )}
            </div>

            {/* Timestamp on the right for traditional */}
            {isTrad && step.clockLabel && step.icon === "clock" && (
              <div style={{
                fontSize: 11,
                color: "#6b7280",
                fontWeight: 500,
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
              }}>
                {step.clockLabel}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  /* ── Timer display for Shelby side ──────────────────────── */
  const timerDisplay = (
    <motion.div
      key={shelbyTimer}
      initial={{ scale: 1.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFamily: "'Geist Mono', monospace",
        fontSize: 28,
        fontWeight: 800,
        color: shelbyStep === shelbySteps.length - 1 ? "#22c55e" : "#e2e8f0",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        transition: "color 0.3s ease",
      }}
    >
      {shelbyTimer}s
    </motion.div>
  );

  /* ── "Still waiting" label on traditional side ──────────── */
  const showStillWaiting = shelbyStep >= shelbySteps.length - 1 && tradStep < traditionalSteps.length - 1;

  return (
    <section
      ref={containerRef}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 20px",
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 100,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            fontSize: 13,
            fontWeight: 600,
            color: "#22c55e",
            marginBottom: 16,
            letterSpacing: "0.1em",
          }}
        >
          <span style={{ fontSize: 16 }}>{"\u26A1"}</span> SPEED COMPARISON
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-figtree), 'Figtree', 'Inter', system-ui, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}
        >
          9 Days vs 3.8 Seconds
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(15px, 2vw, 17px)",
            color: "#64748b",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Traditional platforms take days to review and pay. Shelby settles on-chain in seconds.
        </motion.p>
      </div>

      {/* Split-screen race cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
      }}
        className="payout-race-grid"
      >
        {/* ─── LEFT: Traditional ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "transparent",
            padding: "0 8px",
            position: "relative",
            overflow: "hidden",
            perspective: 1200,
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(107,114,128,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            position: "relative",
            zIndex: 1,
          }}>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}>
                Traditional Platforms
              </div>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#9ca3af",
              }}>
                Creator Payout Flow
              </div>
            </div>

            {/* Day counter */}
            {tradStep >= 2 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: "transparent",
                  borderRadius: 0,
                  padding: "6px 0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: "#9ca3af", lineHeight: 1, fontVariantNumeric: "tabular-nums", fontFamily: "'Geist Mono', monospace" }}>
                  {traditionalSteps[tradStep]?.clockLabel || "1 day"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>elapsed</div>
              </motion.div>
            )}
          </div>

          {/* Steps */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}>
            {traditionalSteps.map((step, i) => renderStep(step, i, tradStep, "trad"))}
          </div>

          {/* "Still waiting..." overlay when Shelby is done */}
          <AnimatePresence>
            {showStillWaiting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  zIndex: 5,
                }}
              >
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 20px",
                  borderRadius: 100,
                  background: "rgba(107,114,128,0.12)",
                  border: "1px solid rgba(107,114,128,0.2)",
                }}>
                  <span style={{ animation: "payout-spin 1s linear infinite", display: "inline-block" }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#6b7280" strokeWidth="2" opacity={0.2} />
                      <path d="M10 2a8 8 0 0 1 8 8" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                    Still waiting...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── RIGHT: Shelby + Aptos ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "transparent",
            padding: "0 8px",
            position: "relative",
            overflow: "hidden",
            perspective: 1200,
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Green radial glow */}
          <div style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            position: "relative",
            zIndex: 1,
          }}>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#22c55e",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}>
                Shelby + Aptos
              </div>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#e2e8f0",
              }}>
                On-Chain Settlement
              </div>
            </div>

            {/* Running timer */}
            {shelbyStep >= 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: "transparent",
                  padding: "6px 0",
                  textAlign: "center",
                  transition: "background 0.3s ease",
                }}
              >
                <AnimatePresence mode="wait">
                  {timerDisplay}
                </AnimatePresence>
                <div style={{
                  fontSize: 10,
                  color: shelbyStep === shelbySteps.length - 1 ? "#4ade80" : "rgba(34,197,94,0.6)",
                  fontWeight: 500,
                  marginTop: 2,
                  transition: "color 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>
                  {shelbyStep === shelbySteps.length - 1 ? "complete!" : "elapsed"}
                </div>
              </motion.div>
            )}
          </div>

          {/* Steps */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}>
            {shelbySteps.map((step, i) => renderStep(step, i, shelbyStep, "shelby"))}
          </div>

          {/* Explorer link */}
          <AnimatePresence>
            {shelbyStep >= shelbySteps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <a
                  href="https://explorer.aptoslabs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#22c55e",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.15)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)";
                  }}
                >
                  View on Aptos Explorer
                  <span style={{ fontSize: 15 }}>{"\u2192"}</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          marginTop: 28,
          textAlign: "center",
          padding: 0,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#22c55e" strokeWidth="1.5" />
          <path d="M10 6v4l2.5 2.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{
          fontSize: "clamp(13px, 1.8vw, 15px)",
          color: "#94a3b8",
          fontWeight: 500,
        }}>
          Average payout time across 24 verified payouts:{" "}
          <span style={{ color: "#22c55e", fontWeight: 700, fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums" }}>3.8 seconds</span>
        </span>
      </motion.div>

      {/* Scoped CSS */}
      <style>{`
        @keyframes payout-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .payout-race-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
