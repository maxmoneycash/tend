"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ────────────────────────────────────────────────────────────
   Demo data — matches the real on-chain submission
   0xed863e…9108f on Aptos testnet
   ──────────────────────────────────────────────────────────── */
const DEMO_SUBMISSION_ADDRESS =
  "0xed863e61760fb70ca9169307d26385b983afb33359925c96839e3f4cb779108f";
const DEMO_TX_HASH =
  "0x5f09d9b53f6788bffea8672f95b751cb3ce416f42e1c562fdf4dff8489a35b3a";

interface Layer {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  rows: { label: string; value: string; link?: string; mono?: boolean }[];
}

const DEMO_LAYERS: Layer[] = [
  {
    id: "submission",
    title: "On-Chain Submission",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    color: "rgb(22, 163, 74)",
    rows: [
      { label: "Address", value: "0xed863e…9108f", mono: true },
      { label: "Status", value: "Tracking" },
      { label: "Creator", value: "0x943d8…oracle", mono: true },
    ],
  },
  {
    id: "youtube",
    title: "YouTube Verification",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
    color: "rgb(239, 68, 68)",
    rows: [
      { label: "Video ID", value: "dQw4w9WgXcQ", mono: true },
      { label: "View Count", value: "122,001" },
      { label: "Public Status", value: "Public" },
    ],
  },
  {
    id: "bot",
    title: "Bot Detection",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 014 4v1H8V6a4 4 0 014-4z" />
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <circle cx="9" cy="13" r="1.5" fill="currentColor" />
        <circle cx="15" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
    color: "rgb(22, 163, 74)",
    rows: [
      { label: "Bot Score", value: "15 / 100 (clean)" },
      { label: "Velocity", value: "Normal" },
      { label: "Engagement", value: "Organic" },
      { label: "Account Age", value: "Established" },
      { label: "View / Follower", value: "Healthy" },
      { label: "Share Ratio", value: "Natural" },
    ],
  },
  {
    id: "payout",
    title: "Payout Calculation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    color: "#FA4616",
    rows: [
      { label: "Views", value: "122,001" },
      { label: "Rate", value: "$0.75 / 1K views" },
      { label: "Gross", value: "$91.50" },
      { label: "Platform Fee (5%)", value: "-$4.58" },
      { label: "Creator Payout", value: "$86.93" },
    ],
  },
  {
    id: "aptos",
    title: "Aptos Transaction",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "rgb(59, 130, 246)",
    rows: [
      {
        label: "Tx Hash",
        value: "0x5f09d9…5b3a",
        mono: true,
        link: `https://explorer.aptoslabs.com/txn/${DEMO_TX_HASH}?network=testnet`,
      },
      { label: "Amount", value: "86.93 USDT" },
      { label: "Network", value: "Aptos Testnet" },
    ],
  },
  {
    id: "shelby",
    title: "Shelby Attestation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    color: "rgb(168, 85, 247)",
    rows: [
      { label: "Blob ID", value: "shelby_att_0xed86…", mono: true },
      { label: "Evidence Hash", value: "0x7c3a9f…b412", mono: true },
      { label: "Timestamp", value: "2026-03-15T14:32:07Z" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   Styles — inline objects to match the landing page aesthetic
   ──────────────────────────────────────────────────────────── */
const styles = {
  wrapper: {
    width: "100%",
    maxWidth: 760,
    margin: "0 auto",
    marginTop: 48,
  } as React.CSSProperties,

  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "4px 4px 4px 18px",
    backdropFilter: "blur(12px)",
    transition: "border-color 0.2s",
  } as React.CSSProperties,

  searchBarFocused: {
    borderColor: "rgba(250, 70, 22, 0.5)",
  } as React.CSSProperties,

  input: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Geist Mono', monospace",
    letterSpacing: "-0.01em",
    padding: "12px 0",
    minWidth: 0,
  } as React.CSSProperties,

  verifyBtn: {
    flexShrink: 0,
    background: "#FA4616",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "-0.02em",
    transition: "background 0.15s, transform 0.1s",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,

  layerCard: {
    background: "transparent",
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    borderRadius: 0,
    padding: "18px 0",
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  } as React.CSSProperties,

  indicator: (color: string) =>
    ({
      width: 4,
      minHeight: 40,
      borderRadius: 4,
      background: color,
      flexShrink: 0,
      alignSelf: "stretch",
      boxShadow: `0 0 12px ${color}44`,
    }) as React.CSSProperties,

  layerHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  } as React.CSSProperties,

  layerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "-0.02em",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  } as React.CSSProperties,

  layerIcon: (color: string) =>
    ({
      color,
      display: "flex",
      alignItems: "center",
    }) as React.CSSProperties,

  rowGrid: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: "6px 12px",
    fontSize: 13,
  } as React.CSSProperties,

  rowLabel: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: 500,
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  } as React.CSSProperties,

  rowValue: {
    color: "rgba(255,255,255,0.88)",
    fontWeight: 500,
    wordBreak: "break-all" as const,
  } as React.CSSProperties,

  rowValueMono: {
    fontFamily: "'Geist Mono', monospace",
    fontSize: 12.5,
    fontVariantNumeric: "tabular-nums" as const,
  } as React.CSSProperties,

  rowLink: {
    color: "rgb(96, 165, 250)",
    textDecoration: "underline",
    textUnderlineOffset: 2,
    cursor: "pointer",
  } as React.CSSProperties,

  signalDot: (ok: boolean) =>
    ({
      display: "inline-block",
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: ok ? "rgb(22, 163, 74)" : "rgb(239, 68, 68)",
      marginRight: 6,
      verticalAlign: "middle",
      boxShadow: ok ? "0 0 6px rgba(22,163,74,0.5)" : "0 0 6px rgba(239,68,68,0.5)",
    }) as React.CSSProperties,

  loadingBar: {
    width: "100%",
    height: 3,
    borderRadius: 3,
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginTop: 20,
  } as React.CSSProperties,

  loadingFill: {
    height: "100%",
    background: "linear-gradient(90deg, #FA4616, #ff7a4a)",
    borderRadius: 3,
  } as React.CSSProperties,

  footer: {
    textAlign: "center" as const,
    marginTop: 32,
    padding: "0 20px",
  } as React.CSSProperties,

  footerText: {
    fontSize: 15,
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    letterSpacing: "-0.01em",
  } as React.CSSProperties,

  footerHighlight: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: 600,
  } as React.CSSProperties,
} as const;

/* ────────────────────────────────────────────────────────────
   Bot-detection signal badge helper
   ──────────────────────────────────────────────────────────── */
const BOT_SIGNALS = ["Velocity", "Engagement", "Account Age", "View / Follower", "Share Ratio"];

function SignalBadges() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
      {BOT_SIGNALS.map((s) => (
        <span
          key={s}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(22, 163, 74, 0.1)",
            border: "1px solid rgba(22, 163, 74, 0.2)",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 11.5,
            fontWeight: 500,
            color: "rgb(74, 222, 128)",
            letterSpacing: "-0.01em",
          }}
        >
          <span style={styles.signalDot(true)} />
          {s}
        </span>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Layer Card
   ──────────────────────────────────────────────────────────── */
function LayerCard({ layer, index }: { layer: Layer; index: number }) {
  const isBotLayer = layer.id === "bot";
  const isPayoutLayer = layer.id === "payout";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={styles.layerCard}
    >
      <div style={styles.indicator(layer.color)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.layerHeader}>
          <span style={styles.layerIcon(layer.color)}>{layer.icon}</span>
          <span style={styles.layerTitle}>{layer.title}</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.12 + 0.3, type: "spring", stiffness: 400, damping: 15 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: layer.color,
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.span>
        </div>
        <div style={styles.rowGrid}>
          {layer.rows.map((row) => {
            // Skip individual signal rows for bot layer — we render badges instead
            if (isBotLayer && BOT_SIGNALS.includes(row.label)) return null;

            return (
              <React.Fragment key={row.label}>
                <span style={styles.rowLabel}>{row.label}</span>
                {row.link ? (
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...styles.rowValue,
                      ...(row.mono ? styles.rowValueMono : {}),
                      ...styles.rowLink,
                    }}
                  >
                    {row.value} &#8599;
                  </a>
                ) : (
                  <span
                    style={{
                      ...styles.rowValue,
                      ...(row.mono ? styles.rowValueMono : {}),
                      ...(isPayoutLayer && row.label === "Creator Payout"
                        ? { color: "rgb(74, 222, 128)", fontWeight: 700 }
                        : {}),
                    }}
                  >
                    {row.value}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {isBotLayer && <SignalBadges />}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Widget Component
   ──────────────────────────────────────────────────────────── */
type WidgetState = "idle" | "loading" | "revealed";

export default function VerifyWidget() {
  const [inputValue, setInputValue] = useState(DEMO_SUBMISSION_ADDRESS);
  const [state, setState] = useState<WidgetState>("idle");
  const [focused, setFocused] = useState(false);

  const handleVerify = useCallback(() => {
    if (state === "loading") return;
    if (!inputValue.trim()) return;

    setState("loading");

    // Simulate a brief fetch delay, then reveal
    setTimeout(() => {
      setState("revealed");
    }, 1400);
  }, [inputValue, state]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleVerify();
    },
    [handleVerify],
  );

  const handleReset = useCallback(() => {
    setState("idle");
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* ── Search bar ── */}
      <div
        style={{
          ...styles.searchBar,
          ...(focused ? styles.searchBarFocused : {}),
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (state === "revealed") setState("idle");
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Paste submission address or tx hash..."
          style={styles.input}
          spellCheck={false}
          autoComplete="off"
        />
        {state === "revealed" ? (
          <button
            onClick={handleReset}
            style={{
              ...styles.verifyBtn,
              background: "rgba(255,255,255,0.1)",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            Clear
          </button>
        ) : (
          <button
            onClick={handleVerify}
            disabled={state === "loading"}
            style={{
              ...styles.verifyBtn,
              ...(state === "loading" ? { opacity: 0.7, cursor: "default" } : {}),
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {state === "loading" ? "Verifying..." : "Verify"}
          </button>
        )}
      </div>

      {/* ── Loading bar ── */}
      <AnimatePresence>
        {state === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.loadingBar}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.3, ease: "easeInOut" }}
              style={styles.loadingFill}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Revealed layers ── */}
      <AnimatePresence>
        {state === "revealed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}
          >
            {/* Connecting line behind cards */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "calc(50% - 1px)",
                top: 0,
                width: 2,
                height: "100%",
                background: "rgba(255,255,255,0.04)",
                transformOrigin: "top",
                pointerEvents: "none",
                display: "none", // hidden — reserved for future use
              }}
            />

            {DEMO_LAYERS.map((layer, i) => (
              <LayerCard key={layer.id} layer={layer} index={i} />
            ))}

            {/* Completion badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: DEMO_LAYERS.length * 0.12 + 0.2, duration: 0.4 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 20px",
                background: "rgba(22, 163, 74, 0.08)",
                border: "1px solid rgba(22, 163, 74, 0.18)",
                borderRadius: 10,
                marginTop: 4,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(74, 222, 128)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgb(74, 222, 128)",
                  letterSpacing: "-0.02em",
                }}
              >
                Full proof chain verified — 6 / 6 layers passed
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer message ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: state === "revealed" ? DEMO_LAYERS.length * 0.12 + 0.5 : 0, duration: 0.5 }}
        style={styles.footer}
      >
        <p style={styles.footerText}>
          Every payout on Content Rewards is cryptographically verified.{" "}
          <span style={styles.footerHighlight}>Pick any transaction. Check our work.</span>
        </p>
      </motion.div>
    </div>
  );
}
