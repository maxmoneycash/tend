"use client";

import { useState, useCallback } from "react";
import { motion, animate, useMotionValue, type PanInfo } from "motion/react";

/* ── Types ────────────────────────────────────────────────────── */

interface ClipData {
  address: string;
  contentUrl: string;
  viewsCurrent: number;
  earnedCreator: number;
  feeAccumulated: number;
  botScore: number;
  status: number;
  isCompleted: boolean;
}

/* ── Helpers ──────────────────────────────────────────────────── */

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/"))
        return u.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch {}
  return null;
}

function formatUsd(octas: number): string {
  return "$" + (octas / 1e6).toFixed(2);
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

/* ── Icons ────────────────────────────────────────────────────── */

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
    </svg>
  );
}

/* ── Constants ────────────────────────────────────────────────── */

const CARD_W = 340;
const CARD_H = 480;
const GAP = 24;
const SPRING = { type: "spring" as const, stiffness: 400, damping: 38 };

/* ── Carousel ─────────────────────────────────────────────────── */

export function ClipsCarousel({
  submissions,
  cpmRate = 0,
}: {
  submissions: ClipData[];
  cpmRate?: number;
}) {
  const [active, setActive] = useState(0);
  const total = submissions.length;
  const dragX = useMotionValue(0);

  const goTo = useCallback(
    (i: number) => {
      setActive(i);
      animate(dragX, 0, SPRING);
    },
    [dragX],
  );

  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold || info.velocity.x < -400) {
        next();
      } else if (info.offset.x > threshold || info.velocity.x > 400) {
        prev();
      }
      animate(dragX, 0, SPRING);
    },
    [next, prev, dragX],
  );

  if (total === 0) return null;

  return (
    <div className="select-none">
      {/* Viewport */}
      <div
        className="relative overflow-hidden"
        style={{ height: CARD_H + 40 }}
      >
        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all duration-200">
              <ChevronLeft />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all duration-200">
              <ChevronRight />
            </button>
          </>
        )}

        {/* Cards */}
        <motion.div
          className="flex items-center justify-center h-full"
          style={{ x: dragX }}
          drag={total > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
        >
          {submissions.map((clip, i) => {
            // Calculate offset from active card
            let offset = i - active;
            // Wrap around for circular navigation
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const xTarget = offset * (CARD_W + GAP);
            const isCenter = offset === 0;
            const absOff = Math.abs(offset);

            return (
              <motion.div
                key={clip.address}
                animate={{
                  x: xTarget,
                  scale: isCenter ? 1 : 0.85,
                  opacity: absOff > 2 ? 0 : isCenter ? 1 : absOff === 1 ? 0.5 : 0.2,
                  rotateY: offset * -6,
                  zIndex: 10 - absOff,
                }}
                transition={SPRING}
                className="absolute"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  perspective: 1200,
                  transformStyle: "preserve-3d",
                }}
              >
                <ClipCardInner clip={clip} cpmRate={cpmRate} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {submissions.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? "#FA4616" : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Card inner (no motion transforms — parent handles those) ── */

const DOT_PATTERN = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
} as const;

function ClipCardInner({ clip, cpmRate }: { clip: ClipData; cpmRate: number }) {
  const vid = extractVideoId(clip.contentUrl);
  const statusLabel = clip.status === 0 ? "Tracking" : clip.status === 1 ? "Flagged" : "Completed";
  const statusColor = clip.status === 0 ? "#4ade80" : clip.status === 1 ? "#f87171" : "#60a5fa";
  const botRisk = clip.botScore <= 20 ? "Low" : clip.botScore <= 50 ? "Medium" : "High";
  const botColor = clip.botScore <= 20 ? "#4ade80" : clip.botScore <= 50 ? "#facc15" : "#f87171";

  return (
    /* Outer gradient-border wrapper — matches contentrewards.com Framer cards */
    <div
      className="rounded-[18px] w-full h-full"
      style={{
        padding: 4,
        background:
          "linear-gradient(38deg, rgba(255,255,255,0.03) 67%, rgb(176,73,0) 89%, rgb(232,147,0) 104%)",
        border: "1px solid #212121",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Inner dark panel */}
      <div
        className="relative flex flex-col overflow-hidden rounded-[14px] w-full h-full"
        style={{
          background: "linear-gradient(191deg, rgb(18,18,18) 10%, rgb(0,0,0) 60%)",
          border: "1px solid #383838",
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 z-0"
          style={{
            ...DOT_PATTERN,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
          }}
        />

        {/* Orange edge gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              "linear-gradient(121deg, rgba(249,115,22,0.8) -91%, transparent 15%, transparent 78%, rgba(249,115,22,0.8) 170%)",
          }}
        />

        {/* Thumbnail */}
        <div className="relative w-full h-[140px] overflow-hidden shrink-0 z-[2]">
          {vid ? (
            <img src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(180,100,20,0.25) 0%, rgba(18,18,18,0.7) 55%, rgb(18,18,18) 100%)" }}
          />
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
            <span style={{ color: statusColor }}>{statusLabel}</span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
              {vid || clip.address.slice(0, 12) + "..."}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex flex-col flex-1 px-5 pt-3 pb-5">
          <div className="flex flex-col gap-2 mb-3">
            {[
              { label: "Views", value: formatViews(clip.viewsCurrent) },
              { label: "Earned", value: formatUsd(clip.earnedCreator) },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-full px-4 py-2"
                style={{ border: "1px solid rgba(176,73,0,0.45)", background: "rgba(176,73,0,0.06)" }}
              >
                <span className="text-[11px] text-[#999] font-medium">{s.label}</span>
                <span className="text-[18px] text-white font-bold tracking-[-0.03em] ml-2">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-[9px] text-[#777]">Bot</span>
              <span className="text-[11px] font-bold" style={{ color: botColor }}>{botRisk}</span>
            </div>
            <div
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-[9px] text-[#777]">Fee</span>
              <span className="text-[11px] font-bold text-[#999]">{formatUsd(clip.feeAccumulated)}</span>
            </div>
          </div>

          {cpmRate > 0 && (
            <div className="flex items-center gap-2 mt-auto">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-[11px] shrink-0"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                <span className="text-[#22c55e]"><ArrowUpRight /></span>
              </div>
              <div
                className="flex-1 flex items-center justify-center rounded-[11px] py-2.5"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                <span className="text-[#22c55e] font-bold text-[16px] tracking-[-0.02em]">
                  {formatUsd(cpmRate)} CPM
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
