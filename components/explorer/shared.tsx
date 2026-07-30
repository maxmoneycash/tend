"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Navbar } from "@/components/layout/Navbar";

// ─── Shared sub-components ────────────────────────────────────────

export function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] font-mono text-[#FA4616]/60 font-bold">{number}</span>
        <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">{title}</h2>
      </div>
      <p className="text-[11px] text-zinc-600">{subtitle}</p>
    </div>
  );
}

export function HeroPill({
  value,
  label,
  accent,
  negative,
}: {
  value: string;
  label: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
      <span
        className={`text-[14px] sm:text-[16px] font-bold font-mono ${
          accent
            ? "text-[#FA4616]"
            : negative
              ? "text-red-400"
              : "text-white"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}

export function DNARow({
  icon,
  label,
  value,
  detail,
  negative,
}: {
  icon: boolean;
  label: string;
  value: string;
  detail: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`text-[12px] ${icon ? "text-green-400" : "text-red-400"}`}>
          {icon ? "\u2713" : "\u2717"}
        </span>
        <span className="text-zinc-500 w-20 shrink-0">{label}</span>
      </div>
      <span className={`font-mono font-medium text-[11px] ${negative ? "text-red-400" : "text-white"}`}>{value}</span>
      <span className="text-zinc-600 text-right ml-2 text-[10px]">{detail}</span>
    </div>
  );
}

export function InsightCard({
  headline,
  body,
  accent,
}: {
  headline: string;
  body: string;
  accent: string;
}) {
  return (
    <div
      className="px-4 py-3 rounded-xl bg-white/[0.02] border-l-2 transition-colors"
      style={{ borderColor: accent + "40" }}
    >
      <div className="text-[11px] font-bold text-white mb-1">{headline}</div>
      <p className="text-[10px] text-zinc-500 leading-relaxed">{body}</p>
    </div>
  );
}

export function TakeawayRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 mt-0.5">
        {icon}
      </span>
      <p className="text-[11px] text-zinc-400 leading-relaxed">{text}</p>
    </div>
  );
}

export function ComparisonRow({
  label,
  value,
  bad,
}: {
  label: string;
  value: string;
  bad?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className={`text-[10px] font-mono font-semibold ${bad ? "text-red-400" : "text-green-400"}`}>
        {value}
      </span>
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Hero skeleton */}
        <div className="rounded-[20px] bg-zinc-900/50 p-12 space-y-4">
          <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse mx-auto" />
          <div className="h-14 w-48 bg-white/[0.06] rounded animate-pulse mx-auto" />
          <div className="h-5 w-64 bg-white/[0.04] rounded animate-pulse mx-auto" />
          <div className="flex justify-center gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-36 bg-white/[0.04] rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        {/* Section skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-[20px] bg-white/[0.02] p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-5 w-48 bg-white/[0.06] rounded animate-pulse" />
            </div>
            <div className="h-3 w-56 bg-white/[0.04] rounded animate-pulse" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-white/[0.02] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
