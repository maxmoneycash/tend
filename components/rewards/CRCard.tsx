"use client";

import { useRef, useCallback, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/* ── Shared constants ─────────────────────────────────────────── */

const DOT_PATTERN = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
} as const;

/* ── Mouse-follow glow hook (spring-based for smooth tracking) ── */

function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const opacity = useMotionValue(0);
  const smoothOpacity = useSpring(opacity, { damping: 25, stiffness: 120 });

  const onMove = useCallback(
    (e: MouseEvent) => {
      opacity.set(1);
    },
    [opacity],
  );

  const onLeave = useCallback(() => {
    opacity.set(0);
  }, [opacity]);

  return { ref, smoothOpacity, onMove, onLeave } as const;
}

/* ── CRCard — standard card with gradient border + glow ─────── */

export function CRCard({
  children,
  padding = "p-5",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  padding?: string;
  delay?: number;
  className?: string;
}) {
  const { ref, smoothOpacity, onMove, onLeave } = useMouseGlow();
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      onMove(e);
      if (glowRef.current && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const gx = e.clientX - rect.left;
        const gy = e.clientY - rect.top;
        glowRef.current.style.background = `radial-gradient(180px circle at ${gx}px ${gy}px, rgba(250,70,22,0.15), transparent 70%)`;
      }
    },
    [onMove, ref],
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.165, 0.84, 0.44, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={onLeave}
      className={`rounded-[18px] relative ${className}`}
      style={{
        padding: "3px",
        background:
          "linear-gradient(38deg, rgba(255,255,255,0.03) 67%, rgb(176,73,0) 89%, rgb(232,147,0) 104%)",
        border: "1px solid #212121",
      }}
    >
      <motion.div
        ref={glowRef}
        className="absolute inset-0 rounded-[18px] pointer-events-none z-20"
        style={{ opacity: smoothOpacity }}
      />
      <div
        className={`rounded-[15px] bg-[#151515] relative overflow-hidden ${padding}`}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={DOT_PATTERN}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

/* ── CRCardHero — hero card with stronger gradient + glow ───── */

export function CRCardHero({
  children,
  padding = "p-6",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  padding?: string;
  delay?: number;
  className?: string;
}) {
  const { ref, smoothOpacity, onMove, onLeave } = useMouseGlow();
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      onMove(e);
      if (glowRef.current && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const gx = e.clientX - rect.left;
        const gy = e.clientY - rect.top;
        glowRef.current.style.background = `radial-gradient(200px circle at ${gx}px ${gy}px, rgba(250,70,22,0.18), transparent 70%)`;
      }
    },
    [onMove, ref],
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.165, 0.84, 0.44, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={onLeave}
      className={`rounded-[18px] relative ${className}`}
      style={{
        padding: "3px",
        background:
          "linear-gradient(38deg, #2a2a2a 50%, rgb(176,73,0) 78%, rgb(232,147,0) 100%)",
        border: "1px solid #212121",
      }}
    >
      <motion.div
        ref={glowRef}
        className="absolute inset-0 rounded-[18px] pointer-events-none z-20"
        style={{ opacity: smoothOpacity }}
      />
      <div
        className={`rounded-[15px] bg-[#151515] relative overflow-hidden ${padding}`}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={DOT_PATTERN}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

/* ── CRCardSubtle — simple card without gradient border ─────── */

export function CRCardSubtle({
  children,
  padding = "px-4 py-3",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  padding?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.165, 0.84, 0.44, 1] }}
      className={`rounded-[18px] bg-[#151515] border border-[#212121] ${padding} ${className}`}
    >
      {children}
    </motion.div>
  );
}
