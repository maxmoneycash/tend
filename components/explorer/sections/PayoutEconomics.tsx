"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { fmtDollar } from "../helpers";
import type { PayoutVelocityData, DisputeSummary } from "../types";

interface Props {
  payoutVelocity: PayoutVelocityData | null;
  disputeSummary: DisputeSummary | null;
}

export function PayoutEconomics({ payoutVelocity }: Props) {
  return (
    <FadeInSection>
      <div id="payout-economics" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="12" title="Where the Money Actually Goes" subtitle="Creator payout economics across 31,539 creators and $460K in payouts" />

        {/* Monthly Payout Velocity — top subsection */}
        <div className="mb-8 px-5 py-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/[0.12] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-emerald-500/60" />
          <div className="text-[11px] text-emerald-400/70 uppercase tracking-wider mb-3 font-semibold">
            Monthly Payout Velocity
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-[32px] font-black text-emerald-400 font-mono leading-none">
                {payoutVelocity ? fmtDollar(payoutVelocity.monthlyVelocity) : "$652K"}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">estimated per month</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-zinc-300 font-mono leading-none">
                {payoutVelocity ? fmtDollar(payoutVelocity.dailyVelocity) : "$21.7K"}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">per day</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-zinc-300 font-mono leading-none">
                {payoutVelocity ? fmtDollar(payoutVelocity.annualVelocity) : "$7.9M"}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">annualized market</div>
            </div>
          </div>
          {/* Platform breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {(payoutVelocity
              ? Object.entries(payoutVelocity.platformBreakdown).sort(
                  ([, a], [, b]) => b.estimatedMonthly - a.estimatedMonthly
                )
              : [
                  ["tiktok", { spendShare: 38.6, estimatedMonthly: 251572 }],
                  ["instagram", { spendShare: 36.5, estimatedMonthly: 237745 }],
                  ["youtube", { spendShare: 18.9, estimatedMonthly: 123277 }],
                  ["x", { spendShare: 6.1, estimatedMonthly: 39709 }],
                ] as Array<[string, { spendShare: number; estimatedMonthly: number }]>
            ).map(([platform, data]) => (
              <div key={platform} className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="text-[10px] text-zinc-500 capitalize">{platform === "x" ? "X/Twitter" : platform}</div>
                <div className="text-[14px] font-bold text-white font-mono">{fmtDollar(data.estimatedMonthly)}</div>
                <div className="text-[9px] text-zinc-600">{data.spendShare.toFixed(1)}% share</div>
              </div>
            ))}
          </div>
          {/* Trend indicator */}
          {payoutVelocity?.trendDirection && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                payoutVelocity.trendDirection === "accelerating"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : payoutVelocity.trendDirection === "decelerating"
                    ? "bg-red-500/15 text-red-400"
                    : "bg-zinc-500/15 text-zinc-400"
              }`}>
                {payoutVelocity.trendDirection}
              </span>
              {payoutVelocity.trend && (
                <span className="text-[10px] text-zinc-500">
                  {payoutVelocity.trend.pctChange > 0 ? "+" : ""}
                  {payoutVelocity.trend.pctChange}% week-over-week
                </span>
              )}
            </div>
          )}
          <p className="text-[10px] text-zinc-600 italic">
            {payoutVelocity?.note || "Estimated from campaign spend rates. Exact monthly figure will be available after 30 days of daily tracking."}
            {" "}Total content rewards market: estimated $7.8M &ndash; $9.2M per year.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${
              payoutVelocity?.confidence === "high" ? "bg-emerald-400" :
              payoutVelocity?.confidence === "medium" ? "bg-yellow-400" :
              "bg-zinc-500"
            }`} />
            <span className="text-[9px] text-zinc-600">
              Confidence: {payoutVelocity?.confidence ?? "medium"}
              {payoutVelocity?.snapshotDays ? ` (${payoutVelocity.snapshotDays} days tracked)` : ""}
            </span>
          </div>
        </div>

        {/* Hero stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-[28px] font-black text-white font-mono">$460K</div>
            <div className="text-[11px] text-zinc-500">paid out across</div>
            <div className="text-[20px] font-bold text-zinc-300 font-mono">31,539</div>
            <div className="text-[11px] text-zinc-500">creators</div>
          </div>
          <div className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Average</div>
            <div className="text-[28px] font-black text-zinc-300 font-mono">$14.61</div>
            <div className="text-[10px] text-zinc-600">per creator</div>
          </div>
          <div className="px-5 py-4 rounded-2xl bg-red-500/[0.06] border border-red-500/[0.12] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/40" />
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Median</div>
            <div className="text-[36px] font-black text-red-400 font-mono">$4.27</div>
            <div className="text-[10px] text-red-400/70">Half of all creators earn less</div>
          </div>
        </div>

        {/* Visual 1: Earnings Distribution Pyramid */}
        <div className="mb-8">
          <div className="text-[11px] text-zinc-600 uppercase tracking-wider mb-3 font-semibold">
            Earnings Distribution Pyramid
          </div>
          <div className="space-y-2">
            {[
              { label: "99th percentile", value: 817.57, note: "The top 1%", color: "#10B981" },
              { label: "90th percentile", value: 63.94, note: null, color: "#22C55E" },
              { label: "75th percentile", value: 19.16, note: null, color: "#84CC16" },
              { label: "MEDIAN (50th)", value: 4.27, note: "Half of all creators earn less than this", color: "#F59E0B" },
              { label: "25th percentile", value: 0.39, note: null, color: "#F97316" },
              { label: "10th percentile", value: 0.0, note: "Bottom 10% earned nothing", color: "#EF4444" },
            ].map((tier) => (
              <div key={tier.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] ${tier.label.startsWith("MEDIAN") ? "font-bold text-yellow-400" : "text-zinc-400"}`}>
                    {tier.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono font-bold text-white">
                      ${tier.value.toFixed(2)}
                    </span>
                    {tier.note && (
                      <span className="text-[9px] text-zinc-500 italic">{tier.note}</span>
                    )}
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max((tier.value / 817.57) * 100, 1)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: tier.color, opacity: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual 2: The Inequality Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="px-5 py-5 rounded-2xl bg-red-500/[0.05] border border-red-500/[0.10] text-center">
            <div className="text-[42px] font-black text-red-400 font-mono leading-none">79.7%</div>
            <div className="text-[12px] text-zinc-400 mt-2">of all payouts go to the <span className="text-white font-bold">top 10%</span> of creators</div>
          </div>
          <div className="px-5 py-5 rounded-2xl bg-red-500/[0.05] border border-red-500/[0.10] text-center">
            <div className="text-[42px] font-black text-red-400 font-mono leading-none">1.3%</div>
            <div className="text-[12px] text-zinc-400 mt-2">of all payouts go to the <span className="text-white font-bold">bottom 50%</span> of creators</div>
          </div>
          <div className="px-5 py-5 rounded-2xl bg-yellow-500/[0.05] border border-yellow-500/[0.10] text-center">
            <div className="text-[42px] font-black text-yellow-400 font-mono leading-none">53.8%</div>
            <div className="text-[12px] text-zinc-400 mt-2">of creators earn <span className="text-white font-bold">less than $5</span> total</div>
          </div>
          <div className="px-5 py-5 rounded-2xl bg-yellow-500/[0.05] border border-yellow-500/[0.10] text-center">
            <div className="text-[42px] font-black text-yellow-400 font-mono leading-none">31.4%</div>
            <div className="text-[12px] text-zinc-400 mt-2">of creators earned <span className="text-white font-bold">less than $1</span></div>
          </div>
        </div>

        {/* Visual 3: Per-Submission Economics */}
        <div className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-8">
          <div className="text-[11px] text-zinc-600 uppercase tracking-wider mb-3 font-semibold">
            Per-Submission Economics
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div className="text-[28px] font-black text-white font-mono">$6.75</div>
              <div className="text-[10px] text-zinc-500">avg payout per submission</div>
            </div>
            <div className="text-[20px] text-zinc-700">/</div>
            <div>
              <div className="text-[20px] font-bold text-zinc-300 font-mono">68,268</div>
              <div className="text-[10px] text-zinc-500">total submissions</div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3 italic">
            A creator submitting one clip earns about the same as a cup of coffee.
          </p>
        </div>

        {/* Visual 4: Campaign Spend Distribution */}
        <div className="mb-8">
          <div className="text-[11px] text-zinc-600 uppercase tracking-wider mb-3 font-semibold">
            Campaign Spend Distribution
          </div>
          <div className="space-y-2">
            {[
              { range: "$0 spent", count: 140, pct: 33.4, note: "Never paid anyone", color: "#EF4444" },
              { range: "<$10", count: 20, pct: 4.8, note: "Barely started", color: "#F97316" },
              { range: "$10 – $100", count: 51, pct: 12.2, note: null, color: "#F59E0B" },
              { range: "$100 – $1K", count: 128, pct: 30.5, note: "Most campaigns land here", color: "#84CC16" },
              { range: "$1K – $10K", count: 73, pct: 17.4, note: "Meaningful payouts", color: "#22C55E" },
              { range: ">$10K", count: 7, pct: 1.7, note: "The big spenders", color: "#10B981" },
            ].map((tier) => (
              <div key={tier.range} className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-400 w-24 shrink-0 text-right">{tier.range}</span>
                <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(tier.pct / 33.4) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ backgroundColor: tier.color, opacity: 0.5 }}
                  >
                    {tier.pct > 8 && (
                      <span className="text-[8px] font-mono text-white font-bold">{tier.count}</span>
                    )}
                  </motion.div>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono w-10 text-right">{tier.pct}%</span>
                {tier.note && (
                  <span className="text-[9px] text-zinc-600 italic hidden sm:inline">{tier.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            The median creator on Content Rewards earns <span className="text-white font-bold">$4.27</span>. The top 10% capture nearly <span className="text-white font-bold">80%</span> of all payouts. More than half of all creators &mdash; <span className="text-white font-bold">53.8%</span> &mdash; earn less than $5 total. This isn&apos;t a marketplace failure &mdash; it&apos;s a structural inequality that the current manual evaluation system amplifies. When brands manually approve submissions, they naturally favor a small group of proven creators while new creators get rejected or ignored.
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Shelby&apos;s automated oracle evaluation eliminates this bias. Every submission is evaluated on the same objective criteria &mdash; view count, engagement ratio, bot score &mdash; regardless of whether the creator is new or established.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
