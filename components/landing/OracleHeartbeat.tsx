// @ts-nocheck — Animation component: motion library overload mismatches
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   Oracle Heartbeat Monitor
   Real-time visualization of the oracle checking clips,
   verifying views, detecting bots, and sending USDT payouts.
   ═══════════════════════════════════════════════════════════════ */

const ORACLE_SUBMISSIONS = [
  { clipId: "zx8RsYjf", views: "1,487,994", botScore: 15, payout: "$333.93" },
  { clipId: "5z0Gr5-pHMo", views: "4,026", botScore: 5, payout: "$2.82" },
  { clipId: "jPThSwhJ8CE", views: "408,969", botScore: 15, payout: "$291.05" },
  { clipId: "kcGGSoaN2zA", views: "40,094", botScore: 30, payout: "$28.18" },
  { clipId: "TDZYAJvpHXo", views: "8,386", botScore: 7, payout: "$5.58" },
  { clipId: "s5SRnFV9WFY", views: "1,299", botScore: 8, payout: "$0.91" },
  { clipId: "PpJY1Lyqdw4", views: "122,001", botScore: 15, payout: "$86.93" },
] as const;

const MAX_VISIBLE = 4;
const PULSE_INTERVAL = 4500; // ms between pulses
const LINE_SPEED = 1.8; // pixels per frame (~108px/s at 60fps)

// ECG pulse shape: a sequence of (dx, dy) offsets from current position.
// This produces the classic QRS complex shape.
const PULSE_SHAPE: [number, number][] = [
  [4, 0],      // flat lead-in
  [3, 6],      // small P-wave up
  [3, -6],     // back to baseline
  [4, 0],      // flat
  [2, 8],      // slight rise
  [3, -48],    // sharp Q dip (inverted for SVG: negative = up)
  [4, 0],      // mid
  [3, 60],     // tall R spike down (positive = down in SVG)
  [3, -45],    // sharp S recovery
  [2, -10],    // overshoot up
  [3, 5],      // settle
  [4, 0],      // flat
  [4, 4],      // gentle T-wave
  [5, 0],      // T-wave peak
  [4, -4],     // T-wave descent
  [6, 0],      // flat trail-out
];

const PULSE_WIDTH = PULSE_SHAPE.reduce((sum, [dx]) => sum + dx, 0);

interface FeedItem {
  id: number;
  submission: (typeof ORACLE_SUBMISSIONS)[number];
}

export function OracleHeartbeat() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const submissionIndexRef = useRef(0);
  const feedIdCounter = useRef(0);

  // IntersectionObserver to start animations when in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "Last check: Xs ago" timer
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      if (lastCheckTime > 0) {
        setSecondsAgo(Math.floor((Date.now() - lastCheckTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible, lastCheckTime]);

  // Canvas heartbeat line + pulse injection
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;
    const midY = H / 2;

    // The line is stored as an array of y-values, one per pixel column.
    // We scroll from right to left: new data enters on the right.
    const points = new Float32Array(Math.ceil(W) + PULSE_WIDTH + 20);
    points.fill(midY);

    let head = 0; // write position (rightmost point)
    let accumulator = 0;
    let pulseQueue: [number, number][] | null = null;
    let pulseIdx = 0;
    let pulseDxAccum = 0;

    // Schedule pulse injections
    let nextPulseTime = performance.now() + 1500; // first pulse after 1.5s
    let rafId: number;

    const GREEN = "#16a34a";
    const GREEN_GLOW = "rgba(22, 163, 74, 0.35)";
    const BG = "#0a0a0a";

    function injectPulse() {
      pulseQueue = [...PULSE_SHAPE];
      pulseIdx = 0;
      pulseDxAccum = 0;
    }

    function getNextY(): number {
      if (pulseQueue && pulseIdx < pulseQueue.length) {
        const [dx, dy] = pulseQueue[pulseIdx];
        pulseDxAccum += 1;
        if (pulseDxAccum >= dx) {
          pulseDxAccum = 0;
          pulseIdx++;
        }
        // Current offset from baseline
        let offsetY = 0;
        for (let i = 0; i <= Math.min(pulseIdx, pulseQueue.length - 1); i++) {
          offsetY += pulseQueue[i][1];
        }
        // Interpolate within current segment
        if (pulseIdx < pulseQueue.length) {
          const [segDx, segDy] = pulseQueue[pulseIdx];
          const t = segDx > 0 ? pulseDxAccum / segDx : 1;
          offsetY += segDy * t;
          // Recalculate: sum up to pulseIdx-1, then partial current
          offsetY = 0;
          for (let i = 0; i < pulseIdx; i++) {
            offsetY += pulseQueue[i][1];
          }
          offsetY += pulseQueue[pulseIdx][1] * t;
        }
        if (pulseIdx >= pulseQueue.length) {
          pulseQueue = null;
        }
        return midY + offsetY;
      }
      // Add subtle noise to baseline for realism
      return midY + (Math.random() - 0.5) * 0.6;
    }

    let lastTime = performance.now();

    function draw(now: number) {
      const dt = now - lastTime;
      lastTime = now;
      accumulator += (dt / 1000) * 60 * LINE_SPEED; // pixels to advance

      // Check if it's time for a pulse
      if (now >= nextPulseTime && !pulseQueue) {
        injectPulse();
        nextPulseTime = now + PULSE_INTERVAL;
        // Trigger feed update + pulse indicator
        setIsPulsing(true);
        setLastCheckTime(Date.now());
        setSecondsAgo(0);
        setTimeout(() => setIsPulsing(false), 600);

        // Add new feed item
        const idx = submissionIndexRef.current % ORACLE_SUBMISSIONS.length;
        const newItem: FeedItem = {
          id: feedIdCounter.current++,
          submission: ORACLE_SUBMISSIONS[idx],
        };
        submissionIndexRef.current++;
        setFeedItems((prev) => {
          const next = [newItem, ...prev];
          return next.slice(0, MAX_VISIBLE + 1); // keep 1 extra for exit animation
        });
      }

      // Advance the line
      while (accumulator >= 1) {
        accumulator -= 1;
        head = (head + 1) % points.length;
        points[head] = getNextY();
      }

      // Draw
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Glow effect
      ctx.shadowColor = GREEN_GLOW;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      const len = Math.ceil(W);
      for (let i = 0; i < len; i++) {
        const arrIdx = (head - (len - 1 - i) + points.length * 2) % points.length;
        const y = points[arrIdx];
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }
      ctx.stroke();

      // Bright dot at the leading edge
      ctx.shadowBlur = 16;
      ctx.shadowColor = GREEN;
      ctx.fillStyle = GREEN;
      ctx.beginPath();
      ctx.arc(len - 1, points[head], 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Faint grid lines for medical-monitor aesthetic
      ctx.strokeStyle = "rgba(22, 163, 74, 0.06)";
      ctx.lineWidth = 0.5;
      const gridSpacing = 20;
      for (let y = gridSpacing; y < H; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let x = gridSpacing; x < W; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafId);
  }, [isVisible]);

  return (
    <div ref={containerRef} style={styles.wrapper}>
      {/* Header row */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span style={styles.headerTitle}>Oracle Heartbeat Monitor</span>
        </div>
        <div style={styles.liveIndicator}>
          <span
            style={{
              ...styles.liveDot,
              boxShadow: isPulsing
                ? "0 0 12px 4px rgba(22, 163, 74, 0.7)"
                : "0 0 6px 2px rgba(22, 163, 74, 0.4)",
              transform: isPulsing ? "scale(1.4)" : "scale(1)",
            }}
          />
          <span style={styles.liveText}>LIVE</span>
        </div>
      </div>

      {/* Canvas heartbeat */}
      <div style={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />
        {!isVisible && (
          <div style={styles.canvasPlaceholder}>
            <span style={{ color: "#4a4a4a", fontSize: 14 }}>
              Waiting for signal...
            </span>
          </div>
        )}
      </div>

      {/* Live feed */}
      <div style={styles.feed}>
        <AnimatePresence mode="popLayout" initial={false}>
          {feedItems.slice(0, MAX_VISIBLE).map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              animate={{
                opacity: 1 - index * 0.2,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{
                layout: { duration: 0.35, ease: "easeOut" },
                opacity: { duration: 0.4 },
                filter: { duration: 0.3 },
                y: { duration: 0.35, ease: "easeOut" },
              }}
              style={styles.feedItem}
            >
              <span style={styles.feedCheck}>Checking clip </span>
              <span style={styles.feedClipId}>{item.submission.clipId}</span>
              <span style={styles.feedArrow}> → </span>
              <span style={styles.feedViews}>
                {item.submission.views} views
              </span>
              <span style={styles.feedArrow}> → </span>
              <span style={styles.feedBot}>
                bot {item.submission.botScore}
              </span>
              <span style={styles.feedArrow}> → </span>
              <span style={styles.feedPayout}>
                {item.submission.payout} USDT
              </span>
              <span style={styles.feedCheckmark}> ✓</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {feedItems.length === 0 && isVisible && (
          <div style={styles.feedWaiting}>
            <span style={{ color: "#4a4a4a", fontSize: 13, fontFamily: "'Geist Mono', monospace" }}>
              Awaiting next oracle cycle...
            </span>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Oracle</span>
          <span style={styles.statValue}>0x7bbc...5ff3</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statLabel}>Reports</span>
          <span style={styles.statValue}>24</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statLabel}>Clips Tracked</span>
          <span style={styles.statValue}>7</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statLabel}>Last Check</span>
          <span style={styles.statValue}>
            {lastCheckTime > 0 ? `${secondsAgo}s ago` : "--"}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <p style={styles.tagline}>
        The oracle never sleeps. Every 60 seconds, it checks your clips,
        verifies views, detects bots, and sends USDT to your wallet.
        Automatically.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Inline styles — dark monitor theme
   ═══════════════════════════════════════════════════════════════ */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: "transparent",
    overflow: "hidden",
    maxWidth: 800,
    width: "100%",
    margin: "0 auto",
    padding: "0 8px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: "-0.02em",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#16a34a",
    display: "inline-block",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
  },
  liveText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#16a34a",
    letterSpacing: "0.1em",
    fontFamily: "'Geist Mono', monospace",
  },
  canvasContainer: {
    position: "relative" as const,
    width: "100%",
    height: 100,
    padding: "0 20px",
  },
  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  canvasPlaceholder: {
    position: "absolute" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
  },
  feed: {
    padding: "8px 20px 4px",
    minHeight: 100,
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  feedWaiting: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    opacity: 0.5,
  },
  feedItem: {
    fontFamily: "'Geist Mono', monospace",
    fontSize: 12.5,
    lineHeight: 1.7,
    color: "rgba(255, 255, 255, 0.7)",
    padding: "6px 0",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
  },
  feedCheck: {
    color: "rgba(255, 255, 255, 0.45)",
  },
  feedClipId: {
    color: "#60a5fa",
    fontWeight: 500,
    fontFamily: "'Geist Mono', monospace",
  },
  feedArrow: {
    color: "rgba(255, 255, 255, 0.2)",
  },
  feedViews: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  feedBot: {
    color: "#f59e0b",
    fontWeight: 500,
  },
  feedPayout: {
    color: "#16a34a",
    fontWeight: 600,
  },
  feedCheckmark: {
    color: "#16a34a",
    fontWeight: 700,
  },
  statsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "14px 20px",
    margin: "8px 16px 0",
    background: "transparent",
    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  stat: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.3)",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "'Geist Mono', monospace",
    fontVariantNumeric: "tabular-nums" as const,
  },
  statDivider: {
    width: 1,
    height: 20,
    background: "rgba(255, 255, 255, 0.1)",
  },
  tagline: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center" as const,
    padding: "16px 24px 20px",
    margin: 0,
    fontFamily: "'Inter', system-ui, sans-serif",
    maxWidth: 520,
    marginLeft: "auto",
    marginRight: "auto",
  },
};
