"use client";

import { useState, useCallback } from "react";
import { motion, animate, useMotionValue, type PanInfo } from "motion/react";

/* ── Data ─────────────────────────────────────────────────────── */

interface BrandShowcase {
  name: string;
  logo: string;
  description: string;
  verified: boolean;
  totalViews: string;
  spent: string;
  cpm: string;
  cpm2?: string;
  cpmLabel?: string;
  cpm2Label?: string;
}

const BRANDS: BrandShowcase[] = [
  {
    name: "Jacob & Co",
    logo: "https://framerusercontent.com/images/KvLYdVXqIuc33NZpBi65ODZ1gtk.jpg?width=600&height=373",
    description: "Luxury brand scaling reach through creators.",
    verified: true,
    totalViews: "2.5M",
    spent: "$7,370",
    cpm: "$3.09",
  },
  {
    name: "Crayo.ai",
    logo: "https://framerusercontent.com/images/CTpkzYq4hR70pw88nzpDTdRZtAY.webp?width=150&height=146",
    description: "Scaling reach without Meta or Google ads is possible.",
    verified: true,
    totalViews: "121M",
    spent: "$8,500",
    cpm: "$17",
    cpm2: "$0.25",
    cpmLabel: "on paid traffic",
    cpm2Label: "on organic traffic",
  },
  {
    name: "Whop",
    logo: "https://framerusercontent.com/images/KDttIf02RDEagXzVVwWfzAA4sI.png?width=512&height=512",
    description: "Still outperforming Meta/Google CPMs significantly",
    verified: true,
    totalViews: "119M",
    spent: "$263,000",
    cpm: "$2.00",
  },
  {
    name: "NFL",
    logo: "https://framerusercontent.com/images/DWRSzVgWDvxVN9NIbCjqxdS0CY.png?width=225&height=225",
    description: "Global brand driving massive reach at scale.",
    verified: true,
    totalViews: "24M",
    spent: "$19,000",
    cpm: "$1.71",
  },
  {
    name: "F1",
    logo: "https://framerusercontent.com/images/RSd2Jed8EU8U8jQN5Y18tXleNOw.png?width=512&height=512",
    description: "Organic reach at scale — across industries.",
    verified: true,
    totalViews: "57.4M",
    spent: "$40.1K",
    cpm: "$0.70",
  },
];

/* ── Icons ────────────────────────────────────────────────────── */

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#EAB308" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/* ── Constants ────────────────────────────────────────────────── */

const CARD_W = 380;
const CARD_H = 520;
const GAP = 28;
const SPRING = { type: "spring" as const, stiffness: 400, damping: 38 };

/* ── Carousel ─────────────────────────────────────────────────── */

export function BrandCarousel() {
  const [active, setActive] = useState(0);
  const total = BRANDS.length;
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
      if (info.offset.x < -50 || info.velocity.x < -400) next();
      else if (info.offset.x > 50 || info.velocity.x > 400) prev();
      animate(dragX, 0, SPRING);
    },
    [next, prev, dragX],
  );

  return (
    <div className="mt-10 select-none">
      {/* Viewport */}
      <div
        className="relative overflow-hidden"
        style={{ height: CARD_H + 40 }}
      >
        {/* Nav */}
        <button onClick={prev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <ChevronLeft />
        </button>
        <button onClick={next}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <ChevronRight />
        </button>

        {/* Cards */}
        <motion.div
          className="flex items-center justify-center h-full"
          style={{ x: dragX }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
        >
          {BRANDS.map((brand, i) => {
            let offset = i - active;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const xTarget = offset * (CARD_W + GAP);
            const isCenter = offset === 0;
            const absOff = Math.abs(offset);

            return (
              <motion.div
                key={brand.name}
                animate={{
                  x: xTarget,
                  scale: isCenter ? 1 : 0.85,
                  opacity: absOff > 2 ? 0 : isCenter ? 1 : absOff === 1 ? 0.55 : 0.2,
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
                <BrandCardInner brand={brand} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {BRANDS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300"
            style={{
              width: i === active ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === active ? "#FA4616" : "rgba(255,255,255,0.12)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Card inner ───────────────────────────────────────────────── */

const DOT_PATTERN = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
} as const;

function BrandCardInner({ brand }: { brand: BrandShowcase }) {
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
        className="relative flex flex-col items-center overflow-hidden rounded-[14px] w-full h-full"
        style={{
          background: "linear-gradient(191deg, rgb(18,18,18) 10%, rgb(0,0,0) 60%)",
          border: "1px solid #383838",
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
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

        {/* Logo */}
        <div className="relative z-10 mt-8 mb-3">
          <div
            className="w-[68px] h-[68px] rounded-[15px] overflow-hidden"
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Name */}
        <div className="relative z-10 flex items-center gap-1.5 mb-1">
          <span className="text-white font-semibold text-[19px] tracking-[-0.02em]">{brand.name}</span>
          {brand.verified && <VerifiedBadge />}
        </div>

        {/* Description */}
        <p className="relative z-10 text-[13px] text-[#7d7d7d] text-center px-7 mb-5 leading-relaxed tracking-[-0.01em]">
          {brand.description}
        </p>

        {/* Stat pills */}
        <div className="relative z-10 flex flex-col gap-2 w-full px-7 mb-4">
          {[
            { label: "Total Views", value: brand.totalViews },
            { label: "Spent", value: brand.spent },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-full px-5 py-2.5"
              style={{ border: "1px solid rgba(176,73,0,0.5)", background: "rgba(176,73,0,0.06)" }}
            >
              <span className="text-[13px] text-[#999] font-medium">{s.label}</span>
              <span className="text-[22px] text-white font-bold tracking-[-0.03em] ml-3">{s.value}</span>
            </div>
          ))}
        </div>

        {/* CPM */}
        <div className="relative z-10 flex items-center gap-2 w-full px-7 mt-auto mb-7">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-[12px] shrink-0"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <span className="text-[#22c55e]"><ArrowUpRight /></span>
          </div>
          {brand.cpm2 ? (
            <div
              className="flex-1 flex items-center justify-center gap-3 rounded-[12px] py-2.5"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <div className="text-center">
                <div className="text-[#22c55e] font-bold text-[16px] tracking-[-0.02em]">{brand.cpm} CPM</div>
                {brand.cpmLabel && <div className="text-[8px] text-[#22c55e]/40 mt-0.5">{brand.cpmLabel}</div>}
              </div>
              <div className="text-center">
                <div className="text-[#22c55e] font-bold text-[16px] tracking-[-0.02em]">{brand.cpm2} CPM</div>
                {brand.cpm2Label && <div className="text-[8px] text-[#22c55e]/40 mt-0.5">{brand.cpm2Label}</div>}
              </div>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center justify-center rounded-[12px] py-3"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <span className="text-[#22c55e] font-bold text-[19px] tracking-[-0.02em]">{brand.cpm} CPM</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
