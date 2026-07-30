"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

export function TradingCR() {
  return (
    <FadeInSection>
      <div id="trading-cr" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="14" title="Trading CR Campaigns" subtitle="Content Rewards breakdown by trading sub-category" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
          The Whop marketplace has 27,083 trading products across signals, crypto, forex, stocks, and more (see Section 02 above).
          But Content Rewards campaigns tell a different story — only 189 campaigns target trading, and they cluster
          around &quot;General Investing&quot; keywords rather than specific verticals.
        </p>

        {/* Marketplace vs CR gap — side by side */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Whop Products vs CR Campaigns — The Mismatch</h4>
          <div className="space-y-1.5">
            {[
              { type: "Signals Groups", whop: 429, cr: 0, color: "#F59E0B" },
              { type: "Crypto / Web3", whop: 318, cr: 57, color: "#3B82F6" },
              { type: "Education", whop: 267, cr: 0, color: "#8B5CF6" },
              { type: "Stocks & Options", whop: 234, cr: 1, color: "#10B981" },
              { type: "Forex", whop: 209, cr: 0, color: "#EC4899" },
              { type: "Bots / Algo", whop: 187, cr: 0, color: "#06B6D4" },
              { type: "Prop Firms", whop: 107, cr: 0, color: "#F97316" },
              { type: "Sports Betting", whop: "8,045*", cr: 28, color: "#EAB308" },
            ].map((row) => (
              <div key={row.type} className="flex items-center gap-2 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                <span className="text-zinc-400 w-28 sm:w-32 shrink-0">{row.type}</span>
                <span className="text-white font-mono w-12 text-right">{typeof row.whop === "number" ? row.whop.toLocaleString() : row.whop}</span>
                <span className="text-[8px] text-zinc-600 w-14">products</span>
                <span className={`font-mono w-8 text-right ${row.cr === 0 ? "text-red-400" : "text-emerald-400"}`}>{row.cr}</span>
                <span className="text-[8px] text-zinc-600">CR campaigns</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/[0.04]">
            <p className="text-[9px] text-zinc-600">
              * Sports Betting is its own Whop category (not inside Trading). Signals, Education, Forex, Bots, and Prop Firms
              have zero CR campaigns despite representing 1,199 Whop products.
            </p>
          </div>
        </div>

        {/* CR campaigns by sub-category — the real breakdown */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-4">CR Campaign Budget by Trading Sub-Category</h4>
          <div className="space-y-3">
            {[
              { name: "General Investing", campaigns: 90, budget: 213938, spendRate: 46.7, creators: 7371, cpm: 1.54, color: "#8B5CF6", top: "JWaller Clipping ($29K), Fishtank Live ($20K)" },
              { name: "Crypto / Web3", campaigns: 57, budget: 161788, spendRate: 26.5, creators: 5426, cpm: 2.34, color: "#3B82F6", top: "Adaptive AI ($25K), Celsius x March Madness ($16K)" },
              { name: "Sports Betting", campaigns: 28, budget: 112703, spendRate: 34.9, creators: 2004, cpm: 4.90, color: "#F59E0B", top: "Rainbet ($15K), Gambana ($14K), BetPanda ($10K)" },
              { name: "Prediction Markets", campaigns: 6, budget: 66000, spendRate: 50.1, creators: 1354, cpm: 1.13, color: "#06B6D4", top: "Polymarket Clipping ($25K), Polymarket UGC ($25K)" },
              { name: "Casino / Gambling", campaigns: 7, budget: 13500, spendRate: 62.5, creators: 144, cpm: 1.10, color: "#EF4444", top: "Metawin Logo ($10K), Duelbits, Argentina Casino" },
              { name: "Stock Trading", campaigns: 1, budget: 2500, spendRate: 8.1, creators: 352, cpm: 1.50, color: "#10B981", top: "Digital Circus Clips ($2.5K)" },
            ].map((sub, i) => (
              <div key={sub.name} className="rounded-xl bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: sub.color }} />
                    <span className="text-[11px] text-white font-medium">{sub.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-500">{sub.campaigns} campaigns</span>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-white">${(sub.budget / 1000).toFixed(0)}K</span>
                </div>
                {/* Budget bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: sub.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(sub.budget / 213938) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                  />
                </div>
                <div className="flex items-center gap-4 text-[9px]">
                  <span className={`font-mono ${sub.spendRate >= 50 ? "text-emerald-400" : sub.spendRate >= 35 ? "text-yellow-400" : "text-red-400"}`}>
                    {sub.spendRate}% spent
                  </span>
                  <span className="text-zinc-600">{sub.creators.toLocaleString()} creators</span>
                  <span className="text-zinc-600">${sub.cpm.toFixed(2)}/1K CPM</span>
                </div>
                <div className="text-[9px] text-zinc-600 mt-1.5 italic">{sub.top}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Highest CPM</div>
                <div className="text-[13px] font-mono text-[#F59E0B] font-bold">$4.90/1K</div>
                <div className="text-[9px] text-zinc-600">Sports Betting — 2x higher than any other sub-category</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Best Spend Rate</div>
                <div className="text-[13px] font-mono text-emerald-400 font-bold">62.5%</div>
                <div className="text-[9px] text-zinc-600">Casino/Gambling — highest ROI but smallest market</div>
              </div>
            </div>
          </div>
        </div>

        {/* Polymarket dominance */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Polymarket: $66K from 6 Campaigns</h4>
          <p className="text-[11px] text-zinc-500 mb-3">
            Polymarket alone accounts for $66K in CR budget across just 6 campaigns — more than Casino and Stock Trading combined.
            50.1% spend rate with 1,354 creators. A single brand driving an entire sub-category.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center px-2 py-2.5 rounded-xl bg-white/[0.03]">
              <div className="text-[18px] font-bold font-mono text-[#06B6D4]">$66K</div>
              <div className="text-[9px] text-zinc-600">total budget</div>
            </div>
            <div className="text-center px-2 py-2.5 rounded-xl bg-white/[0.03]">
              <div className="text-[18px] font-bold font-mono text-white">1,354</div>
              <div className="text-[9px] text-zinc-600">creators</div>
            </div>
            <div className="text-center px-2 py-2.5 rounded-xl bg-white/[0.03]">
              <div className="text-[18px] font-bold font-mono text-emerald-400">50.1%</div>
              <div className="text-[9px] text-zinc-600">spend rate</div>
            </div>
          </div>
        </div>

        {/* Dispute breakdown by sub-category */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Disputes by Trading Sub-Category</h4>
          <p className="text-[11px] text-zinc-500 mb-3">
            Of 291 Reddit dispute posts, crypto generates the most complaints with the highest engagement scores.
          </p>
          <div className="space-y-2">
            {[
              { name: "Crypto / Web3", disputes: 147, pct: 50.5, avgScore: 876, color: "#3B82F6" },
              { name: "Sports Betting", disputes: 48, pct: 16.5, avgScore: 549, color: "#F59E0B" },
              { name: "Stock Trading", disputes: 26, pct: 8.9, avgScore: 670, color: "#10B981" },
              { name: "Casino / Gambling", disputes: 7, pct: 2.4, avgScore: 256, color: "#EF4444" },
              { name: "Forex", disputes: 1, pct: 0.3, avgScore: 153, color: "#EC4899" },
              { name: "Prediction Markets", disputes: 1, pct: 0.3, avgScore: 1, color: "#06B6D4" },
            ].map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[10px] text-white w-28 shrink-0">{d.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full" style={{ background: d.color, width: `${(d.disputes / 147) * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-zinc-400 w-16 text-right">{d.disputes} ({d.pct}%)</span>
                <span className="text-[9px] text-zinc-600 w-20 text-right">avg score {d.avgScore}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[10px] text-zinc-600">
              Crypto disputes have the highest avg Reddit score (876) — meaning they get the most community engagement
              and visibility. Sports betting disputes are 2nd most frequent but with lower engagement (549).
            </p>
          </div>
        </div>

        {/* Review 1-star rates by Whop category */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">1-Star Review Rate by Whop Category</h4>
          <div className="space-y-2">
            {[
              { name: "Social Media", rate: 14.0, total: 3254, color: "#EC4899" },
              { name: "Clipping", rate: 9.3, total: 5118, color: "#FA4616" },
              { name: "Sports Betting", rate: 6.7, total: 51778, color: "#F59E0B" },
              { name: "AI", rate: 6.4, total: 3761, color: "#3B82F6" },
              { name: "Trading", rate: 4.1, total: 84273, color: "#10B981" },
              { name: "Personal Finance", rate: 3.9, total: 3108, color: "#8B5CF6" },
              { name: "Business", rate: 2.6, total: 4429, color: "#6B7280" },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-[10px] text-white w-28 shrink-0">{cat.name}</span>
                <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full bg-red-500/80" style={{ width: `${(cat.rate / 14) * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-red-400 w-10 text-right">{cat.rate}%</span>
                <span className="text-[9px] text-zinc-600 w-20 text-right">{cat.total.toLocaleString()} total</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[10px] text-zinc-600">
              Social Media and Clipping categories have the worst review satisfaction.
              Trading (4.1%) is actually below average despite having 84K reviews — volume, not quality, drives complaints.
              Sports Betting (6.7%) is the most polarized finance sub-category.
            </p>
          </div>
        </div>

        {/* Key insight callout */}
        <div className="px-4 py-3 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/10 mb-2">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">&#9888;&#65039;</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-yellow-400 font-semibold">Crypto has the worst economics:</span>{" "}
                57 campaigns with $162K budget but only 26.5% spend rate — the lowest of any sub-category.
                Meanwhile casino/gambling has the best spend rate (62.5%) and sports betting pays the highest CPM ($4.90/1K).
                Creators should target sports betting campaigns for the best earnings potential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
