"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

/* ── Static data ──────────────────────────────────────────────────── */

const revenueLeaders = [
  { name: "MetaTrading.ai", rev: "$1.59M", revNum: 1590, cat: "Trading", momentum: 0.99 },
  { name: "MIRROR TRADING/LIFETIME", rev: "$911K", revNum: 911, cat: "Trading", momentum: 1.15 },
  { name: "VIP ACCESS", rev: "$514K", revNum: 514, cat: "Trading", momentum: 1.07 },
  { name: "SICKBOYTRADES MENTORSHIP", rev: "$503K", revNum: 503, cat: "Trading", momentum: 1.01 },
  { name: "Lifetime Mentorship", rev: "$438K", revNum: 438, cat: "Trading", momentum: 1.32 },
  { name: "TB Master Mentor Program", rev: "$378K", revNum: 378, cat: "Trading", momentum: 1.13 },
  { name: "Lanto Trades Lifetime", rev: "$359K", revNum: 359, cat: "Trading", momentum: 1.08 },
  { name: "LIFETIME ACCESS", rev: "$337K", revNum: 337, cat: "Trading", momentum: 1.11 },
  { name: "MomenumX Apprenticeship", rev: "$334K", revNum: 334, cat: "Trading", momentum: 1.07 },
  { name: "STS Indicators", rev: "$310K", revNum: 310, cat: "Trading", momentum: undefined },
];

const memberLeaders = [
  { name: "Crystal Academy Free", members: 141000, rating: 4.7, reviews: 821, verified: true, creator: "Sierra Smith" },
  { name: "School of Threaded", members: 93000, rating: 4.7, reviews: 130, verified: false, creator: "Dontez Akram" },
  { name: "Beginner Trader Course", members: 92000, rating: 5.0, reviews: 5729, verified: false, creator: "Apollo" },
  { name: "EmmanuelTrades Free", members: 64000, rating: 4.8, reviews: 724, verified: false, creator: undefined },
  { name: "Gold Pips Forex", members: 54000, rating: 4.8, reviews: 323, verified: false, creator: undefined },
  { name: "Crypto Signals by CIB", members: 42000, rating: 5.0, reviews: 4921, verified: false, creator: undefined },
  { name: "Join my NEW DISCORD", members: 38000, rating: 4.8, reviews: 79, verified: false, creator: "Stephan Borg" },
  { name: "PJ Trades Free", members: 31000, rating: 4.8, reviews: 407, verified: false, creator: undefined },
  { name: "Stock STARTER Free", members: 31000, rating: 4.8, reviews: 424, verified: false, creator: "Felix Prehn" },
  { name: "RoboQuant Free", members: 30000, rating: 4.4, reviews: 207, verified: false, creator: undefined },
];

const topCreators = [
  { name: "Sierra Smith", members: 141000, products: 4, rating: 4.9, verified: true },
  { name: "Dontez Akram", members: 93000, products: 2, rating: 4.8, verified: false },
  { name: "Apollo", members: 92000, products: 1, rating: 5.0, verified: false },
  { name: "EmmanuelTrades", members: 65000, products: 2, rating: 4.8, verified: false },
  { name: "GoldPips", members: 54000, products: 2, rating: 2.9, verified: false },
  { name: "Crypto Inside Bets", members: 42000, products: 1, rating: 5.0, verified: false },
  { name: "Stephan Borg", members: 38000, products: 2, rating: 4.9, verified: false },
  { name: "PJ Trades", members: 34000, products: 2, rating: 4.9, verified: false },
  { name: "Raul Gonzalez", members: 32000, products: 3, rating: 4.4, verified: false },
  { name: "Felix Prehn", members: 31000, products: 2, rating: 4.8, verified: false },
];

/* ── Helpers ──────────────────────────────────────────────────────── */

function formatMembers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
}

function MomentumBadge({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-700/40 text-zinc-500 font-semibold">N/A</span>;
  const growing = value >= 1.0;
  return (
    <span
      className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${
        growing ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
      }`}
    >
      {growing ? "\u25B2" : "\u25BC"} {value.toFixed(2)}
    </span>
  );
}

function StarRating({ rating, flagLow }: { rating: number; flagLow?: boolean }) {
  const isLow = flagLow && rating < 3.5;
  return (
    <span className={`text-[9px] font-mono ${isLow ? "text-red-400" : "text-yellow-400"}`}>
      {rating.toFixed(1)}{"\u2605"}
    </span>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function TopTraders() {
  const maxRev = revenueLeaders[0].revNum;
  const maxMembers = memberLeaders[0].members;
  const maxCreatorMembers = topCreators[0].members;

  return (
    <FadeInSection>
      <div id="top-traders" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader
          number="04"
          title="Trading Leaderboard"
          subtitle="Top products and creators ranked by revenue, members, and quality"
        />

        {/* ── 1. Top 10 Revenue Leaderboard ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
            Top 10 Trading Products by Revenue (WhopScan 30-day estimates)
          </h4>
          <p className="text-[11px] text-zinc-500 mb-3">
            Revenue leaders charge $500&ndash;$19,000 per product. MetaTrading.ai lists at $18,997.
            Momentum &gt;1.0 = growing, &lt;1.0 = fading.
          </p>
          <div className="space-y-1.5">
            {revenueLeaders.map((p, i) => (
              <div key={p.name} className="group">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-zinc-600 w-4 shrink-0">{i + 1}.</span>
                  <span className="text-[10px] text-white flex-1 truncate">{p.name}</span>
                  <span className="text-[9px] text-zinc-600 hidden sm:inline">{p.cat}</span>
                  <span className="text-[10px] font-mono text-emerald-400 w-16 text-right shrink-0">{p.rev}</span>
                  <MomentumBadge value={p.momentum} />
                </div>
                <div className="ml-6 mt-0.5 w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500/60"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(p.revNum / maxRev) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[14px] font-bold font-mono text-emerald-400">$5.37M</div>
              <div className="text-[8px] text-zinc-600">top 10 combined</div>
            </div>
            <div>
              <div className="text-[14px] font-bold font-mono text-white">$18,997</div>
              <div className="text-[8px] text-zinc-600">highest price (MetaTrading.ai)</div>
            </div>
            <div>
              <div className="text-[14px] font-bold font-mono text-emerald-400">9/10</div>
              <div className="text-[8px] text-zinc-600">products growing</div>
            </div>
          </div>
        </div>

        {/* ── 2. Top 10 by Members ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
            Top 10 Trading Products by Members (whop_products data)
          </h4>
          <div className="mb-3 inline-block">
            <span className="text-[8px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold uppercase tracking-wider">
              All Free Tier
            </span>
          </div>
          <div className="space-y-1.5">
            {memberLeaders.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-zinc-600 w-4 shrink-0">{i + 1}.</span>
                  <span className="text-[10px] text-white flex-1 truncate">{p.name}</span>
                  {p.verified && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold uppercase">
                      Verified
                    </span>
                  )}
                  <StarRating rating={p.rating} />
                  <span className="text-[9px] text-zinc-600">{p.reviews.toLocaleString()} rev</span>
                  <span className="text-[10px] font-mono text-white w-12 text-right shrink-0">
                    {formatMembers(p.members)}
                  </span>
                </div>
                {p.creator && (
                  <span className="ml-6 text-[8px] text-zinc-600">by {p.creator}</span>
                )}
                <div className="ml-6 mt-0.5 w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue-500/60"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(p.members / maxMembers) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[14px] font-bold font-mono text-blue-400">616K</div>
              <div className="text-[8px] text-zinc-600">top 10 total members</div>
            </div>
            <div>
              <div className="text-[14px] font-bold font-mono text-yellow-400">4.7{"\u2605"}</div>
              <div className="text-[8px] text-zinc-600">average rating</div>
            </div>
            <div>
              <div className="text-[14px] font-bold font-mono text-white">10/10</div>
              <div className="text-[8px] text-zinc-600">free tier products</div>
            </div>
          </div>
        </div>

        {/* ── 3. Revenue vs Members comparison ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            Two Business Models, Zero Overlap
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            The top revenue products are NOT the same as the top member products.
            These are two completely different business models operating on the same platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Revenue model */}
            <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">Revenue Model</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Strategy</span>
                  <span className="text-white font-medium">High-price mentorship / lifetime</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Price range</span>
                  <span className="text-white font-mono">$500 &ndash; $18,997</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Users</span>
                  <span className="text-white font-mono">Few</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">LTV</span>
                  <span className="text-emerald-400 font-mono font-semibold">Very high</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Example</span>
                  <span className="text-white">MetaTrading.ai &mdash; $1.59M rev</span>
                </div>
              </div>
            </div>
            {/* Growth model */}
            <div className="rounded-xl bg-blue-500/[0.04] border border-blue-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[11px] font-semibold text-blue-400">Growth Model</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Strategy</span>
                  <span className="text-white font-medium">Free community &rarr; upsell</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Price range</span>
                  <span className="text-white font-mono">$0 (free)</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Users</span>
                  <span className="text-white font-mono">30K &ndash; 141K</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Immediate revenue</span>
                  <span className="text-blue-400 font-mono font-semibold">$0</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-500">Example</span>
                  <span className="text-white">Crystal Academy &mdash; 141K members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Top Creators leaderboard ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
            Top 10 Trading Creators by Total Members
          </h4>
          <p className="text-[11px] text-zinc-500 mb-3">
            Aggregated across all products per creator. Quality varies wildly.
          </p>
          <div className="space-y-1.5">
            {topCreators.map((c, i) => {
              const isLowRating = c.rating < 3.5;
              return (
                <div key={c.name}>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-600 w-4 shrink-0">{i + 1}.</span>
                    <span className="text-[10px] text-white flex-1 truncate">{c.name}</span>
                    {c.verified && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold uppercase">
                        Verified
                      </span>
                    )}
                    {isLowRating && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold uppercase">
                        Low Rating
                      </span>
                    )}
                    <span className="text-[9px] text-zinc-600">{c.products} prod{c.products !== 1 ? "s" : ""}</span>
                    <StarRating rating={c.rating} flagLow />
                    <span className="text-[10px] font-mono text-white w-12 text-right shrink-0">
                      {formatMembers(c.members)}
                    </span>
                  </div>
                  <div className="ml-6 mt-0.5 w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: isLowRating ? "rgba(239,68,68,0.5)" : "rgba(168,85,247,0.5)" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(c.members / maxCreatorMembers) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[14px] font-bold font-mono text-purple-400">622K</div>
              <div className="text-[8px] text-zinc-600">total members (top 10)</div>
            </div>
            <div>
              <div className="text-[14px] font-bold font-mono text-yellow-400">5.0{"\u2605"}</div>
              <div className="text-[8px] text-zinc-600">highest (Apollo)</div>
            </div>
            <div>
              <div className="text-[14px] font-bold font-mono text-red-400">2.9{"\u2605"}</div>
              <div className="text-[8px] text-zinc-600">lowest (GoldPips)</div>
            </div>
          </div>
        </div>

        {/* ── 5. Insight callout ── */}
        <div className="px-4 py-3 rounded-xl bg-purple-500/[0.05] border border-purple-500/10">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">{"\u26A0"}</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-purple-400 font-semibold">Quality vs. Scale:</span>{" "}
                GoldPips has 54K members but only 2.9{"\u2605"} &mdash; the lowest rating of any top-10 creator.
                Meanwhile Apollo has 92K members with a perfect 5.0{"\u2605"} from 5,729 reviews.
                Quality and scale don&apos;t always correlate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
