"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   SubmissionLifecycle — Animated state machine diagram showing
   a submission's journey through the Content Rewards system.
   ═══════════════════════════════════════════════════════════════ */

/* ── Types ─────────────────────────────────────────────────────── */

type LifecycleState =
  | "SUBMIT"
  | "ELIGIBILITY"
  | "TRACKING"
  | "ORACLE_CYCLE"
  | "PAYOUT"
  | "COMPLETED";

interface DemoSubmission {
  id: string;
  label: string;
  currentState: LifecycleState;
  views: number;
  earned: number;
  botScore: number;
  oracleReports: number;
  daysActive: number;
}

interface StateNode {
  id: LifecycleState;
  label: string;
  description: string;
}

interface Particle {
  id: number;
  progress: number; // 0..1 along the path
  speed: number;
  edgeIndex: number; // which edge this particle travels on
  size: number;
  opacity: number;
}

/* ── Data ──────────────────────────────────────────────────────── */

const STATES: StateNode[] = [
  { id: "SUBMIT", label: "SUBMIT", description: "Content submitted to campaign" },
  { id: "ELIGIBILITY", label: "ELIGIBILITY", description: "Checking requirements (10s+, public, from source)" },
  { id: "TRACKING", label: "TRACKING", description: "Oracle begins monitoring views" },
  { id: "ORACLE_CYCLE", label: "ORACLE CYCLE", description: "Scrape views \u2192 Bot check \u2192 Evidence \u2192 Payout" },
  { id: "PAYOUT", label: "PAYOUT", description: "USDT transferred to creator" },
  { id: "COMPLETED", label: "COMPLETED", description: "Verification period ended (30 days)" },
];

const STATE_ORDER: LifecycleState[] = [
  "SUBMIT",
  "ELIGIBILITY",
  "TRACKING",
  "ORACLE_CYCLE",
  "PAYOUT",
  "COMPLETED",
];

const SUBMISSIONS: DemoSubmission[] = [
  {
    id: "zx8RsYjf",
    label: "Yunakin Garage",
    currentState: "TRACKING",
    views: 1_487_994,
    earned: 333.93,
    botScore: 15,
    oracleReports: 6,
    daysActive: 3,
  },
  {
    id: "PpJY1Lyqdw4",
    label: "Surprise Car",
    currentState: "TRACKING",
    views: 122_001,
    earned: 86.93,
    botScore: 15,
    oracleReports: 1,
    daysActive: 1,
  },
  {
    id: "s5SRnFV9WFY",
    label: "Morning Routine",
    currentState: "TRACKING",
    views: 1_299,
    earned: 0.91,
    botScore: 8,
    oracleReports: 1,
    daysActive: 2,
  },
];

/* ── Color palette ─────────────────────────────────────────────── */

const COLORS = {
  bg: "#0a0a0a",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.06)",
  nodeBg: "#161616",
  nodeBorder: "rgba(255,255,255,0.08)",
  completedBg: "rgba(34,197,94,0.08)",
  completedBorder: "rgba(34,197,94,0.35)",
  completedText: "#4ade80",
  activeBg: "rgba(59,130,246,0.1)",
  activeBorder: "#3b82f6",
  activeGlow: "rgba(59,130,246,0.5)",
  pendingBg: "#111111",
  pendingBorder: "rgba(255,255,255,0.05)",
  pendingText: "#555555",
  green: "#22c55e",
  blue: "#3b82f6",
  white: "#e2e8f0",
  dim: "#6b7280",
  mutedText: "#888888",
  particle: "#3b82f6",
  particlePayout: "#22c55e",
  loopArrow: "#f59e0b",
};

/* ── Helper: format numbers ────────────────────────────────────── */

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtMoney(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Helper: state status relative to current ──────────────────── */

function getStateStatus(
  stateId: LifecycleState,
  currentState: LifecycleState
): "completed" | "active" | "pending" {
  const currentIdx = STATE_ORDER.indexOf(currentState);
  const stateIdx = STATE_ORDER.indexOf(stateId);
  if (stateIdx < currentIdx) return "completed";
  if (stateIdx === currentIdx) return "active";
  return "pending";
}

/* ── Desktop layout positions for state nodes ──────────────────── */
// Layout:
//   SUBMIT -> ELIGIBILITY -> TRACKING -> ORACLE_CYCLE -> COMPLETED
//                                             |
//                                           PAYOUT

const NODE_W = 130;
const NODE_H = 56;

interface NodePos {
  x: number;
  y: number;
}

// These are center positions for each node in the SVG coordinate system
const DESKTOP_POSITIONS: Record<LifecycleState, NodePos> = {
  SUBMIT:       { x: 80,  y: 80 },
  ELIGIBILITY:  { x: 250, y: 80 },
  TRACKING:     { x: 420, y: 80 },
  ORACLE_CYCLE: { x: 590, y: 80 },
  PAYOUT:       { x: 590, y: 200 },
  COMPLETED:    { x: 760, y: 80 },
};

// Edges: from -> to, for particle animation
interface Edge {
  from: LifecycleState;
  to: LifecycleState;
  type: "normal" | "loop" | "payout";
}

const EDGES: Edge[] = [
  { from: "SUBMIT", to: "ELIGIBILITY", type: "normal" },
  { from: "ELIGIBILITY", to: "TRACKING", type: "normal" },
  { from: "TRACKING", to: "ORACLE_CYCLE", type: "normal" },
  { from: "ORACLE_CYCLE", to: "COMPLETED", type: "normal" },
  { from: "ORACLE_CYCLE", to: "PAYOUT", type: "payout" },
  { from: "ORACLE_CYCLE", to: "ORACLE_CYCLE", type: "loop" },
];

/* ── SVG canvas size ───────────────────────────────────────────── */

const SVG_W = 860;
const SVG_H = 280;

/* ── Edge path computation ─────────────────────────────────────── */

function getEdgePath(edge: Edge): string {
  const from = DESKTOP_POSITIONS[edge.from];
  const to = DESKTOP_POSITIONS[edge.to];

  if (edge.type === "loop") {
    // Self-loop on ORACLE_CYCLE: arc above the node
    const cx = from.x;
    const cy = from.y;
    const r = 34;
    return `M ${cx - 20} ${cy - NODE_H / 2 - 2} C ${cx - 20} ${cy - NODE_H / 2 - r - 10}, ${cx + 20} ${cy - NODE_H / 2 - r - 10}, ${cx + 20} ${cy - NODE_H / 2 - 2}`;
  }

  if (edge.type === "payout") {
    // Straight down from ORACLE_CYCLE to PAYOUT
    return `M ${from.x} ${from.y + NODE_H / 2} L ${to.x} ${to.y - NODE_H / 2}`;
  }

  // Normal: horizontal with a gentle curve
  const startX = from.x + NODE_W / 2;
  const startY = from.y;
  const endX = to.x - NODE_W / 2;
  const endY = to.y;
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

/* ── Get point on SVG path at fraction t ───────────────────────── */

function getPointOnPath(
  pathEl: SVGPathElement | null,
  t: number
): { x: number; y: number } {
  if (!pathEl) return { x: 0, y: 0 };
  const len = pathEl.getTotalLength();
  const pt = pathEl.getPointAtLength(t * len);
  return { x: pt.x, y: pt.y };
}

/* ── Node component ────────────────────────────────────────────── */

function StateNodeBox({
  node,
  status,
  pos,
  isMobile,
}: {
  node: StateNode;
  status: "completed" | "active" | "pending";
  pos: NodePos;
  isMobile?: boolean;
}) {
  const isLoop = node.id === "ORACLE_CYCLE";

  const bgColor =
    status === "completed"
      ? COLORS.completedBg
      : status === "active"
        ? COLORS.activeBg
        : COLORS.pendingBg;

  const borderColor =
    status === "completed"
      ? COLORS.completedBorder
      : status === "active"
        ? COLORS.activeBorder
        : COLORS.pendingBorder;

  const textColor =
    status === "completed"
      ? COLORS.completedText
      : status === "active"
        ? COLORS.white
        : COLORS.pendingText;

  const descColor =
    status === "completed"
      ? "rgba(34,197,94,0.6)"
      : status === "active"
        ? "rgba(147,197,253,0.7)"
        : "rgba(255,255,255,0.15)";

  const w = isMobile ? 200 : NODE_W;
  const h = NODE_H;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow for active state */}
      {status === "active" && (
        <motion.rect
          x={pos.x - w / 2 - 6}
          y={pos.y - h / 2 - 6}
          width={w + 12}
          height={h + 12}
          rx={16}
          fill="none"
          stroke={COLORS.activeGlow}
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Node rectangle */}
      <rect
        x={pos.x - w / 2}
        y={pos.y - h / 2}
        width={w}
        height={h}
        rx={12}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={status === "active" ? 1.5 : 0.5}
      />

      {/* Label */}
      <text
        x={pos.x}
        y={pos.y - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={isLoop ? 11 : 12}
        fontWeight={700}
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        letterSpacing="0.1em"
      >
        {node.label}
        {isLoop && " \u21BB"}
      </text>

      {/* Description (only show for active/completed on desktop) */}
      {!isMobile && (status === "active" || status === "completed") && (
        <text
          x={pos.x}
          y={pos.y + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={descColor}
          fontSize={8}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {node.description.length > 30 ? node.description.slice(0, 28) + "..." : node.description}
        </text>
      )}
    </motion.g>
  );
}

/* ── Arrow marker SVG defs ─────────────────────────────────────── */

function ArrowDefs() {
  return (
    <defs>
      <marker
        id="arrow-normal"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.2)" />
      </marker>
      <marker
        id="arrow-completed"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(34,197,94,0.5)" />
      </marker>
      <marker
        id="arrow-active"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(59,130,246,0.5)" />
      </marker>
      <marker
        id="arrow-payout"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(34,197,94,0.6)" />
      </marker>
      <marker
        id="arrow-loop"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(245,158,11,0.6)" />
      </marker>
      {/* Glow filters */}
      <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#3b82f6" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood floodColor="#22c55e" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/* ── Main Component ────────────────────────────────────────────── */

export function SubmissionLifecycle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prevIdx, setPrevIdx] = useState(-1);
  const [burstActive, setBurstActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = SUBMISSIONS[selectedIdx];
  const daysRemaining = 30 - selected.daysActive;

  /* ── Responsive check ────────────────────────────────────────── */
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── IntersectionObserver ────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Initialize particles ────────────────────────────────────── */
  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    let id = 0;
    EDGES.forEach((edge, edgeIdx) => {
      const count = edge.type === "loop" ? 5 : edge.type === "payout" ? 4 : 3;
      for (let i = 0; i < count; i++) {
        particles.push({
          id: id++,
          progress: i / count,
          speed: edge.type === "payout" ? 0.008 : edge.type === "loop" ? 0.006 : 0.004,
          edgeIndex: edgeIdx,
          size: edge.type === "payout" ? 3 : 2.5,
          opacity: 0.8,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  /* ── Handle submission switch burst ──────────────────────────── */
  useEffect(() => {
    if (prevIdx !== -1 && prevIdx !== selectedIdx) {
      setBurstActive(true);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      burstTimerRef.current = setTimeout(() => setBurstActive(false), 600);
    }
    setPrevIdx(selectedIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  /* ── Canvas particle animation loop ──────────────────────────── */
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function animate() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Scale factor from SVG viewBox to canvas size
      const scaleX = rect.width / SVG_W;
      const scaleY = rect.height / SVG_H;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.progress += p.speed;
        if (p.progress > 1) p.progress -= 1;

        const edge = EDGES[p.edgeIndex];
        const pathEl = pathRefs.current[p.edgeIndex];
        if (!pathEl) continue;

        const pt = getPointOnPath(pathEl, p.progress);
        const cx = pt.x * scaleX;
        const cy = pt.y * scaleY;

        // Determine color based on edge type
        let color: string;
        if (edge.type === "payout") {
          color = COLORS.particlePayout;
        } else if (edge.type === "loop") {
          color = COLORS.loopArrow;
        } else {
          color = COLORS.particle;
        }

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.opacity * (burstActive && edge.type !== "loop" ? 1.0 : 0.8);
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size * (burstActive ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isVisible, burstActive]);

  /* ── Edge path stroke style ──────────────────────────────────── */
  function getEdgeStyle(edge: Edge) {
    const fromStatus = getStateStatus(edge.from, selected.currentState);
    const toStatus = getStateStatus(edge.to, selected.currentState);

    if (edge.type === "loop") {
      return {
        stroke: "rgba(245,158,11,0.3)",
        strokeWidth: 1.5,
        strokeDasharray: "4 3",
        markerEnd: "url(#arrow-loop)",
      };
    }

    if (edge.type === "payout") {
      return {
        stroke: "rgba(34,197,94,0.25)",
        strokeWidth: 1.5,
        strokeDasharray: "6 4",
        markerEnd: "url(#arrow-payout)",
      };
    }

    if (fromStatus === "completed" && (toStatus === "completed" || toStatus === "active")) {
      return {
        stroke: "rgba(34,197,94,0.3)",
        strokeWidth: 1.5,
        strokeDasharray: "none",
        markerEnd: "url(#arrow-completed)",
      };
    }

    if (fromStatus === "active") {
      return {
        stroke: "rgba(59,130,246,0.25)",
        strokeWidth: 1.5,
        strokeDasharray: "6 4",
        markerEnd: "url(#arrow-active)",
      };
    }

    return {
      stroke: "rgba(255,255,255,0.06)",
      strokeWidth: 1,
      strokeDasharray: "4 4",
      markerEnd: "url(#arrow-normal)",
    };
  }

  /* ── Mobile vertical positions ───────────────────────────────── */
  const MOBILE_POSITIONS: Record<LifecycleState, NodePos> = {
    SUBMIT:       { x: 120, y: 50 },
    ELIGIBILITY:  { x: 120, y: 130 },
    TRACKING:     { x: 120, y: 210 },
    ORACLE_CYCLE: { x: 120, y: 290 },
    PAYOUT:       { x: 120, y: 370 },
    COMPLETED:    { x: 120, y: 450 },
  };

  const MOBILE_SVG_W = 240;
  const MOBILE_SVG_H = 500;

  function getMobileEdgePath(edge: Edge): string {
    const from = MOBILE_POSITIONS[edge.from];
    const to = MOBILE_POSITIONS[edge.to];

    if (edge.type === "loop") {
      const cx = from.x;
      const cy = from.y;
      return `M ${cx + NODE_W / 2 + 2} ${cy - 12} C ${cx + NODE_W / 2 + 36} ${cy - 12}, ${cx + NODE_W / 2 + 36} ${cy + 12}, ${cx + NODE_W / 2 + 2} ${cy + 12}`;
    }

    const startX = from.x;
    const startY = from.y + NODE_H / 2;
    const endX = to.x;
    const endY = to.y - NODE_H / 2;
    const midY = (startY + endY) / 2;
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }

  const positions = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
  const svgW = isMobile ? MOBILE_SVG_W : SVG_W;
  const svgH = isMobile ? MOBILE_SVG_H : SVG_H;

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <section
      ref={containerRef}
      style={{
        background: "transparent",
        padding: isMobile ? "16px 12px" : "20px 24px",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 100,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.blue,
            marginBottom: 14,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          Submission Lifecycle
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: isMobile ? 24 : 36,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            margin: "0 0 8px 0",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          Content to Payout
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: isMobile ? 14 : 16,
            color: COLORS.dim,
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Follow a submission through every stage of the Content Rewards state machine.
        </motion.p>
      </div>

      {/* Main content layout */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 20 : 24,
        }}
      >
        {/* ── Left: Submission selector ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: isMobile ? "100%" : 220,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
              paddingLeft: 4,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            Demo Submissions
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "row" : "column",
              gap: 8,
              overflowX: isMobile ? "auto" : "visible",
              paddingBottom: isMobile ? 4 : 0,
            }}
          >
            {SUBMISSIONS.map((sub, idx) => {
              const isActive = idx === selectedIdx;
              return (
                <motion.button
                  key={sub.id}
                  onClick={() => setSelectedIdx(idx)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "12px 14px",
                    borderRadius: 0,
                    background: "transparent",
                    border: "none",
                    borderLeft: isActive
                      ? "2px solid rgba(59,130,246,0.8)"
                      : "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    minWidth: isMobile ? 160 : "auto",
                    transition: "border-color 0.2s ease",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderLeftColor = "rgba(255,255,255,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderLeftColor = "transparent";
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isActive ? COLORS.white : COLORS.mutedText,
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    }}
                  >
                    {sub.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: isActive ? "rgba(59,130,246,0.8)" : "rgba(255,255,255,0.25)",
                      fontFamily: "'Geist Mono', monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {sub.id}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isActive ? COLORS.green : "rgba(255,255,255,0.3)",
                      fontFamily: "'Geist Mono', monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtMoney(sub.earned)} earned
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Center: State machine diagram ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Diagram card */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "none",
              borderRadius: 12,
              padding: isMobile ? "16px 8px" : "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                pointerEvents: "none",
              }}
            />

            {/* SVG diagram */}
            <div style={{ position: "relative" }}>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              >
                <ArrowDefs />

                {/* Edge paths */}
                {EDGES.map((edge, idx) => {
                  const style = getEdgeStyle(edge);
                  const path = isMobile ? getMobileEdgePath(edge) : getEdgePath(edge);
                  return (
                    <path
                      key={`edge-${idx}`}
                      ref={(el) => {
                        pathRefs.current[idx] = el;
                      }}
                      d={path}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      strokeDasharray={
                        style.strokeDasharray === "none"
                          ? undefined
                          : style.strokeDasharray
                      }
                      markerEnd={style.markerEnd}
                    />
                  );
                })}

                {/* Labels on special edges */}
                {!isMobile && (
                  <>
                    {/* "each cycle" label on payout arrow */}
                    <text
                      x={DESKTOP_POSITIONS.ORACLE_CYCLE.x + 16}
                      y={(DESKTOP_POSITIONS.ORACLE_CYCLE.y + DESKTOP_POSITIONS.PAYOUT.y) / 2}
                      fill="rgba(34,197,94,0.5)"
                      fontSize={9}
                      fontFamily="system-ui, sans-serif"
                      fontWeight={600}
                    >
                      each cycle
                    </text>

                    {/* "repeats" label on loop */}
                    <text
                      x={DESKTOP_POSITIONS.ORACLE_CYCLE.x}
                      y={DESKTOP_POSITIONS.ORACLE_CYCLE.y - NODE_H / 2 - 38}
                      textAnchor="middle"
                      fill="rgba(245,158,11,0.5)"
                      fontSize={9}
                      fontFamily="system-ui, sans-serif"
                      fontWeight={600}
                    >
                      repeats daily
                    </text>
                  </>
                )}

                {/* State nodes */}
                <AnimatePresence>
                  {STATES.map((node) => {
                    const status = getStateStatus(node.id, selected.currentState);
                    const pos = positions[node.id];
                    return (
                      <StateNodeBox
                        key={node.id}
                        node={node}
                        status={status}
                        pos={pos}
                        isMobile={isMobile}
                      />
                    );
                  })}
                </AnimatePresence>
              </svg>

              {/* Canvas overlay for particles */}
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              />

              {/* Burst effect at current state */}
              <AnimatePresence>
                {burstActive && (
                  <motion.div
                    initial={{ opacity: 1, scale: 0.3 }}
                    animate={{ opacity: 0, scale: 2.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      left: `${(positions[selected.currentState].x / svgW) * 100}%`,
                      top: `${(positions[selected.currentState].y / svgH) * 100}%`,
                      width: 60,
                      height: 60,
                      marginLeft: -30,
                      marginTop: -30,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Info Panel ────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "transparent",
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 0,
                padding: isMobile ? "16px 0" : "20px 0",
              }}
            >
              {/* Current state badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: "rgba(59,130,246,0.1)",
                    border: "none",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: COLORS.blue,
                      boxShadow: `0 0 8px ${COLORS.blue}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: COLORS.blue,
                      letterSpacing: "0.1em",
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    }}
                  >
                    Current: {selected.currentState}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.white,
                  }}
                >
                  {selected.label}
                </span>
              </div>

              {/* Stats row */}
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.mutedText,
                  lineHeight: 1.7,
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                <span style={{ color: COLORS.white, fontWeight: 600 }}>
                  {fmtNum(selected.views)}
                </span>{" "}
                views{" "}
                <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 4px" }}>
                  {"\u00B7"}
                </span>{" "}
                <span style={{ color: COLORS.green, fontWeight: 700 }}>
                  {fmtMoney(selected.earned)}
                </span>{" "}
                earned{" "}
                <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 4px" }}>
                  {"\u00B7"}
                </span>{" "}
                Bot:{" "}
                <span
                  style={{
                    color:
                      selected.botScore < 20
                        ? COLORS.green
                        : selected.botScore < 50
                          ? "#f59e0b"
                          : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {selected.botScore}/100
                </span>
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: COLORS.dim,
                  marginTop: 4,
                }}
              >
                {selected.oracleReports} oracle report{selected.oracleReports !== 1 ? "s" : ""}{" "}
                <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 4px" }}>
                  {"\u00B7"}
                </span>{" "}
                {selected.daysActive} day{selected.daysActive !== 1 ? "s" : ""} active{" "}
                <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 4px" }}>
                  {"\u00B7"}
                </span>{" "}
                {daysRemaining} days remaining
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.dim,
                      letterSpacing: "0.03em",
                    }}
                  >
                    Day {selected.daysActive} of 30 verification period
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.blue,
                    }}
                  >
                    {Math.round((selected.daysActive / 30) * 100)}%
                  </span>
                </div>

                {/* Track */}
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.05)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(selected.daysActive / 30) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                      position: "relative",
                    }}
                  >
                    {/* Shimmer */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                        animation: "lifecycle-shimmer 2s ease-in-out infinite",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── State Legend ──────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? 10 : 16,
              justifyContent: "center",
              padding: "8px 0",
            }}
          >
            {[
              { color: COLORS.completedBorder, label: "Completed" },
              { color: COLORS.activeBorder, label: "Active" },
              { color: "rgba(255,255,255,0.15)", label: "Pending" },
              { color: COLORS.loopArrow, label: "Repeating" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: item.color,
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: COLORS.dim,
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scoped keyframes */}
      <style>{`
        @keyframes lifecycle-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}
