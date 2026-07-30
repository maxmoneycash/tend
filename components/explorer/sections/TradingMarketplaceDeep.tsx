"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

const SUB_TYPES = [
  { name: "Education", products: 924, members: 893_000, rating: 4.75, reviews: 31_749, color: "#8B5CF6" },
  { name: "Signals", products: 457, members: 391_000, rating: 4.71, reviews: 21_648, color: "#F59E0B" },
  { name: "Other Trading", products: 728, members: 368_000, rating: 4.75, reviews: 13_345, color: "#6B7280" },
  { name: "Crypto / Web3", products: 274, members: 163_000, rating: 4.73, reviews: 5_950, color: "#3B82F6" },
  { name: "Bots & Algo", products: 142, members: 90_000, rating: 4.71, reviews: 2_625, color: "#06B6D4" },
  { name: "Stocks & Options", products: 158, members: 83_000, rating: 4.75, reviews: 6_801, color: "#10B981" },
  { name: "Forex", products: 81, members: 22_000, rating: 4.73, reviews: 1_026, color: "#EC4899" },
  { name: "Prop Firms", products: 35, members: 14_000, rating: 4.56, reviews: 796, color: "#F97316" },
  { name: "Day Trading", products: 25, members: 10_000, rating: 4.63, reviews: 253, color: "#EF4444" },
  { name: "Swing Trading", products: 11, members: 4_000, rating: 4.96, reviews: 47, color: "#22C55E" },
  { name: "Copy Trading", products: 10, members: 1_000, rating: 4.79, reviews: 33, color: "#A855F7" },
];

const MAX_MEMBERS = 893_000;

const TOP_FREE = [
  { name: "Crystal Academy Free", members: "141K", rating: 4.7, verified: true },
  { name: "School of Threaded", members: "93K", rating: 4.7, verified: false },
  { name: "Beginner Trader Course", members: "92K", rating: 5.0, verified: false, reviews: 5_729 },
  { name: "EmmanuelTrades", members: "64K", rating: 4.8, verified: false },
  { name: "Gold Pips Forex", members: "54K", rating: 4.8, verified: false },
];

const QUALITY_LEADERS = [
  { name: "Beginner Trader Course", quality: 95, growth: 126, users: "92K" },
  { name: "Crystal Academy Free", quality: 90, growth: 166, users: "136K" },
  { name: "Crypto Signals by corni", quality: 89, growth: 87, users: "42K" },
  { name: "PB Trading Free", quality: 75, growth: 79, users: "60K" },
  { name: "PJ Trades Free", quality: 75, growth: 67, users: "29K" },
];

const TOP_OWNERS = [
  { name: "Sierra Smith", products: 4, members: "141K", rating: 4.9, verified: true },
  { name: "Dontez Akram", products: 2, members: "93K", rating: 4.8, verified: false },
  { name: "Apollo", products: 1, members: "92K", rating: 5.0, verified: false },
  { name: "EmmanuelTrades", products: 2, members: "65K", rating: 4.8, verified: false },
  { name: "GoldPips", products: 2, members: "54K", rating: 2.9, verified: false, outlier: true },
];

export function TradingMarketplaceDeep() {
  return (
    <FadeInSection>
      <div id="trading-marketplace-deep" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader
          number="03"
          title="Inside Whop Trading"
          subtitle="Deep analysis of 2,845 trading products, 2M members, and 84K reviews"
        />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          We pulled detailed data on every trading product with meaningful traction. 2,845 products across 11 sub-types,
          2M+ total members, and 84,273 reviews. Here&apos;s what the numbers reveal about how this marketplace actually works.
        </p>

        {/* ── 1. Sub-type breakdown with members (horizontal bars) ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-4">
            Sub-Type Breakdown by Members
          </h4>
          <div className="space-y-2.5">
            {SUB_TYPES.map((st, i) => (
              <div key={st.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.color }} />
                    <span className="text-[10px] text-white font-medium">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-zinc-600">{st.products.toLocaleString()} products</span>
                    <span className="text-[9px] font-mono text-zinc-400">{(st.members / 1000).toFixed(0)}K members</span>
                    <span className="text-[9px] font-mono text-yellow-400">{st.rating.toFixed(2)}</span>
                    <span className="text-[9px] text-zinc-600 hidden sm:inline">{st.reviews.toLocaleString()} reviews</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: st.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(st.members / MAX_MEMBERS) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-white">2,845</div>
              <div className="text-[9px] text-zinc-600">products analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-emerald-400">2.04M</div>
              <div className="text-[9px] text-zinc-600">total members</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-yellow-400">84,273</div>
              <div className="text-[9px] text-zinc-600">total reviews</div>
            </div>
          </div>
        </div>

        {/* ── 2. The Free Funnel ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">The Free Funnel</h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            ALL top 20 trading products are Free tier. The business model is clear: free community, upsell premium.
          </p>

          {/* Free vs paid comparison */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 p-3 text-center">
              <div className="text-[28px] font-bold font-mono text-emerald-400 leading-none">2,163</div>
              <div className="text-[9px] text-zinc-600 mt-1">free products</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-2">867<span className="text-[8px] text-zinc-600 ml-1">avg members</span></div>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <div className="text-[28px] font-bold font-mono text-zinc-400 leading-none">682</div>
              <div className="text-[9px] text-zinc-600 mt-1">paid products</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-2">237<span className="text-[8px] text-zinc-600 ml-1">avg members</span></div>
            </div>
          </div>

          <div className="text-[9px] text-zinc-500 mb-3 font-semibold uppercase tracking-wider">Top 5 Free Products</div>
          <div className="space-y-1.5">
            {TOP_FREE.map((p, i) => (
              <motion.div
                key={p.name}
                className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <span className="text-[9px] font-mono text-zinc-600 w-4">{i + 1}.</span>
                <span className="text-[10px] text-white flex-1 truncate">{p.name}</span>
                <span className="text-[10px] font-mono text-emerald-400">{p.members}</span>
                <span className="text-[9px] font-mono text-yellow-400">{p.rating.toFixed(1)}</span>
                {p.verified && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">VERIFIED</span>
                )}
                {p.reviews && (
                  <span className="text-[8px] text-zinc-600">{p.reviews.toLocaleString()} reviews</span>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[10px] text-zinc-600">
              Free products get <span className="text-white font-bold">3.66x</span> more members on average.
              The funnel is free community &rarr; trust &rarr; upsell premium tier.
            </p>
          </div>
        </div>

        {/* ── 3. Verification Gap + 4. Review Sentiment — side by side ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Verification Gap */}
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">The Verification Gap</h4>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-[36px] font-bold font-mono text-blue-400 leading-none">10</div>
              <div className="text-[14px] font-mono text-zinc-600">/2,845</div>
            </div>
            <div className="text-[9px] text-zinc-600 mb-3">Only <span className="text-blue-400 font-bold">0.35%</span> of trading products are verified</div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg bg-blue-500/[0.04] border border-blue-500/10 p-2 text-center">
                <div className="text-[14px] font-bold font-mono text-blue-400">14,357</div>
                <div className="text-[8px] text-zinc-600">avg members (verified)</div>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                <div className="text-[14px] font-bold font-mono text-zinc-500">668</div>
                <div className="text-[8px] text-zinc-600">avg members (unverified)</div>
              </div>
            </div>

            <div className="text-center mb-3">
              <span className="text-[20px] font-bold font-mono text-white">21x</span>
              <span className="text-[9px] text-zinc-600 ml-2">more members when verified</span>
            </div>

            <div className="rounded-lg bg-white/[0.02] px-3 py-2">
              <div className="text-[9px] text-zinc-500">
                Sierra Smith (Crystal Academy) dominates — <span className="text-white font-bold">4 of 10</span> verified products belong to one creator.
              </div>
            </div>
          </div>

          {/* Review Sentiment */}
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Review Sentiment Analysis</h4>
            <div className="space-y-3 mb-4">
              {/* 5-star bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white font-medium">5-star</span>
                  <span className="text-[9px] font-mono text-emerald-400">76,495 <span className="text-zinc-600">(90.8%)</span></span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500/60"
                    initial={{ width: 0 }}
                    whileInView={{ width: "90.8%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[8px] text-zinc-600">&quot;profit&quot; <span className="font-mono text-emerald-400">5,391x</span></span>
                  <span className="text-[8px] text-zinc-600">&quot;signals&quot; <span className="font-mono text-emerald-400">4,461x</span></span>
                </div>
              </div>
              {/* 1-star bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white font-medium">1-star</span>
                  <span className="text-[9px] font-mono text-red-400">3,453 <span className="text-zinc-600">(4.1%)</span></span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-red-500/60"
                    initial={{ width: 0 }}
                    whileInView={{ width: "4.1%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[8px] text-zinc-600">&quot;scam&quot; <span className="font-mono text-red-400">437x</span> (12.7%)</span>
                  <span className="text-[8px] text-zinc-600">&quot;refund&quot; <span className="font-mono text-red-400">378x</span></span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-red-500/[0.04] border border-red-500/10 px-3 py-2">
              <p className="text-[9px] text-zinc-500">
                <span className="text-red-400 font-bold">12.7%</span> of all 1-star reviews mention &quot;scam&quot; — the single most common complaint keyword in negative trading reviews.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. Affiliate Economy ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">The Affiliate Economy</h4>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FA4616]/10 text-[#FA4616] font-bold">98.5%</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full h-4 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FA4616]/80 to-[#FA4616]/40"
                  initial={{ width: 0 }}
                  whileInView={{ width: "98.5%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[14px] font-bold font-mono text-white">2,803</div>
              <div className="text-[8px] text-zinc-600">of 2,845 products</div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">
            Almost every trading product on Whop has affiliates enabled. This marketplace runs on referral incentives —
            creators recruit other creators to promote their products. The 42 products without affiliates are outliers.
          </p>
        </div>

        {/* ── 6. Quality Leaders + 7. Top Owners — side by side ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Quality Leaders */}
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Quality Leaders (WhopScan)</h4>
            <div className="space-y-2">
              {QUALITY_LEADERS.map((q, i) => (
                <motion.div
                  key={q.name}
                  className="rounded-lg bg-white/[0.02] px-3 py-2"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white truncate flex-1 mr-2">{q.name}</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">{q.quality}<span className="text-[8px] text-zinc-600">/100</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[8px] text-zinc-600 mt-0.5">
                    <span>Growth: <span className="font-mono text-zinc-400">{q.growth}</span></span>
                    <span>{q.users} users</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top Owners */}
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Top Trading Owners</h4>
            <div className="space-y-2">
              {TOP_OWNERS.map((o, i) => (
                <motion.div
                  key={o.name}
                  className={`rounded-lg px-3 py-2 ${o.outlier ? "bg-red-500/[0.04] border border-red-500/10" : "bg-white/[0.02]"}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[9px] font-mono text-zinc-600 w-4 shrink-0">{i + 1}.</span>
                      <span className="text-[10px] text-white truncate">{o.name}</span>
                      {o.verified && (
                        <span className="text-[7px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold shrink-0">VERIFIED</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-mono text-zinc-500">{o.products}p</span>
                      <span className="text-[10px] font-mono text-emerald-400">{o.members}</span>
                      <span className={`text-[9px] font-mono ${o.outlier ? "text-red-400" : "text-yellow-400"}`}>{o.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {o.outlier && (
                    <div className="text-[8px] text-red-400 mt-0.5">Low rating outlier — 2.9 despite 54K members</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 8. Bottom insight callout (yellow warning) ── */}
        <div className="px-4 py-3 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/10">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">&#x26A0;&#xFE0F;</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-yellow-400 font-semibold">Key takeaway:</span>{" "}
                Prop firms have the lowest rating (<span className="font-mono text-yellow-400">4.56</span>) of any trading sub-type.
                Swing trading has the highest (<span className="font-mono text-emerald-400">4.96</span>) but only 11 products.
                The biggest opportunities are in Signals (457 products, no CR campaigns) and Education (924 products, no CR campaigns).
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
