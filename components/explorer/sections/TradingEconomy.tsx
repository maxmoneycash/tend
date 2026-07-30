"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

export function TradingEconomy() {
  return (
    <FadeInSection>
      <div id="trading-economy" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="02" title="The Trading Economy" subtitle="Trading is the financial engine of Whop" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          The marketplace processes $108M/month in GMV across 85,454 products. Trading alone is 27,083 products —
          31.7% of the entire marketplace and ~53% of all GMV. We broke this down by sub-vertical to reveal wildly different
          economics, dispute rates, and a critical finding: every single top-revenue product is fading.
        </p>

        {/* Full Whop marketplace — all 24 categories */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-4">Full Whop Marketplace — 85,454 Products</h4>
          {[
            { name: "Trading", products: 27083, rev: "~$57.6M est.", health: 58, color: "#10B981" },
            { name: "Business", products: 13164, rev: "$—", health: 0, color: "#8B5CF6" },
            { name: "AI", products: 12502, rev: "$—", health: 0, color: "#3B82F6" },
            { name: "Sports Betting", products: 8045, rev: "$—", health: 0, color: "#F59E0B" },
            { name: "Fitness", products: 5481, rev: "$—", health: 0, color: "#22C55E" },
            { name: "Social Media", products: 4525, rev: "$—", health: 0, color: "#EC4899" },
            { name: "E-Commerce", products: 2432, rev: "$5.0M", health: 58, color: "#F97316" },
            { name: "Reselling", products: 2209, rev: "$—", health: 0, color: "#A855F7" },
            { name: "Real Estate", products: 1601, rev: "$—", health: 0, color: "#06B6D4" },
            { name: "Other (14 more)", products: 8412, rev: "$—", health: 0, color: "#6B7280" },
          ].map((cat, i) => (
            <div key={cat.name} className="mb-2">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-[10px] text-white font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-zinc-600">{cat.products.toLocaleString()}</span>
                  {cat.rev !== "$—" && <span className="text-[9px] font-mono text-zinc-500">{cat.rev}/mo</span>}
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: cat.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(cat.products / 27083) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.04 }}
                />
              </div>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-white">85,454</div>
              <div className="text-[9px] text-zinc-600">total products</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-emerald-400">$108M</div>
              <div className="text-[9px] text-zinc-600">monthly GMV</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-zinc-400">24</div>
              <div className="text-[9px] text-zinc-600">categories</div>
            </div>
          </div>
        </div>

        {/* Inside the 27,083 Trading products — what are they actually selling? */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Inside Trading: 27,083 Products Broken Down</h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            &quot;Trading&quot; on Whop isn&apos;t one thing — it&apos;s signals groups, crypto communities, forex mentorships,
            algo bots, prop firm challenges, and education courses. Here&apos;s what the 2,845 products we have detailed data on break into.
          </p>
          <div className="space-y-2">
            {[
              { name: "Signals Groups", count: 429, pct: 15.1, color: "#F59E0B", desc: "Buy/sell alerts, trade calls, entry/exit signals" },
              { name: "Crypto / Web3", count: 318, pct: 11.2, color: "#3B82F6", desc: "Bitcoin, altcoins, DeFi, airdrops, memecoin plays" },
              { name: "Education & Courses", count: 267, pct: 9.4, color: "#8B5CF6", desc: "Trading academies, mentorships, beginner courses" },
              { name: "Stocks & Options", count: 234, pct: 8.2, color: "#10B981", desc: "Day trading SPY, options flow, equity picks" },
              { name: "Forex", count: 209, pct: 7.3, color: "#EC4899", desc: "Currency pairs, pips, MT4/MT5 setups" },
              { name: "Bots & Algo Trading", count: 187, pct: 6.6, color: "#06B6D4", desc: "Automated strategies, indicators, copy bots" },
              { name: "Prop Firms / Funded", count: 107, pct: 3.8, color: "#F97316", desc: "FTMO, funded accounts, challenge passes" },
              { name: "Day Trading", count: 83, pct: 2.9, color: "#EF4444", desc: "Intraday scalping, morning routines, live streams" },
              { name: "Swing Trading", count: 80, pct: 2.8, color: "#22C55E", desc: "Multi-day holds, technical analysis, chart setups" },
              { name: "Copy Trading", count: 27, pct: 0.9, color: "#A855F7", desc: "Mirror trades, auto-follow top traders" },
              { name: "Other Trading", count: 904, pct: 31.8, color: "#6B7280", desc: "General communities, hybrid products, uncategorized" },
            ].map((sub, i) => (
              <div key={sub.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sub.color }} />
                <span className="text-[10px] text-white w-32 sm:w-40 shrink-0">{sub.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: sub.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(sub.count / 429) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-400 w-10 text-right">{sub.count}</span>
                <span className="text-[9px] text-zinc-600 w-10 text-right">{sub.pct}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[14px] font-bold font-mono text-[#F59E0B]">429</div>
                <div className="text-[8px] text-zinc-600">signals groups — #1 product type</div>
              </div>
              <div>
                <div className="text-[14px] font-bold font-mono text-[#3B82F6]">318</div>
                <div className="text-[8px] text-zinc-600">crypto communities</div>
              </div>
              <div>
                <div className="text-[14px] font-bold font-mono text-[#EC4899]">209</div>
                <div className="text-[8px] text-zinc-600">forex products — 0 CR campaigns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top revenue products — ALL FADING */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Top Revenue Products (Marketplace Estimates)</h4>
          <p className="text-[11px] text-zinc-500 mb-3">
            Every single top-10 revenue product is marked &quot;Leader, FADING&quot; by marketplace momentum tracking.
            The biggest earners are all declining — a sign the market is shifting.
          </p>
          <div className="space-y-1.5">
            {[
              { name: "Codycoverspreads VIP", rev: 1995174, cat: "Sports Betting" },
              { name: "MetaTrading.ai", rev: 1590999, cat: "Trading" },
              { name: "OSA Gold Program", rev: 1590708, cat: "—" },
              { name: "Amazon Inner Circle", rev: 1416900, cat: "—" },
              { name: "Gold Tier", rev: 1088300, cat: "—" },
              { name: "RRS Mastermind", rev: 951215, cat: "Real Estate" },
              { name: "MIRROR TRADING/LIFETIME", rev: 911555, cat: "Trading" },
              { name: "AI Arbitrage Blueprint", rev: 785560, cat: "—" },
              { name: "Springboard To Wealth", rev: 755625, cat: "—" },
              { name: "Inovate", rev: 539350, cat: "—" },
            ].map((p, i) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-600 w-4">{i + 1}.</span>
                <span className="text-[10px] text-white flex-1 truncate">{p.name}</span>
                <span className="text-[9px] text-zinc-600">{p.cat}</span>
                <span className="text-[10px] font-mono text-emerald-400 w-16 text-right">${(p.rev / 1000).toFixed(0)}K</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">FADING</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[10px] text-zinc-600">
              Top 10 combined: $10.6M estimated revenue. All marked as fading by the platform&apos;s momentum algorithm.
              Trading health score: 58/100 (moderate). Avg churn: 34%. The old guard is losing ground.
            </p>
          </div>
        </div>

        {/* Market Health + Opportunities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Trading Health Score</h4>
            <div className="text-[36px] font-bold font-mono text-yellow-400 leading-none">58<span className="text-[14px] text-zinc-600">/100</span></div>
            <div className="text-[9px] text-zinc-600 mt-1 mb-3">Marketplace data rates trading as &quot;moderate&quot; health</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px]"><span className="text-zinc-600">Products</span><span className="text-white font-mono">27,083</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-zinc-600">Monthly revenue</span><span className="text-white font-mono">$57.6M</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-zinc-600">New products (30d)</span><span className="text-white font-mono">3,288</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-zinc-600">Avg rating</span><span className="text-red-400 font-mono">1.89★</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-zinc-600">Top 3 concentration</span><span className="text-white font-mono">18.1%</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-zinc-600">Price range</span><span className="text-white font-mono">$0 – $25K</span></div>
            </div>
          </div>
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Undervalued Gems</h4>
            <p className="text-[9px] text-zinc-500 mb-2">High quality, low visibility — opportunity for CR campaigns</p>
            <div className="space-y-2">
              {[
                { name: "MASTERMIND CLASS PT1", quality: 89.3, rev: "$19.4K/mo", users: 288 },
                { name: "MapleStax Lifetime", quality: 88.8, rev: "$44.2K/mo", users: 61 },
                { name: "Top Floor Mentorship", quality: 87.2, rev: "$42.9K/mo", users: 98 },
                { name: "#1 Live Trading WW", quality: 87.0, rev: "$8.4K/mo", users: 0 },
              ].map((g) => (
                <div key={g.name} className="rounded-lg bg-white/[0.02] px-2.5 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white truncate flex-1">{g.name}</span>
                    <span className="text-[9px] font-mono text-emerald-400">{g.quality}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[8px] text-zinc-600 mt-0.5">
                    <span>{g.rev}</span>
                    <span>{g.users} users</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CR coverage gap */}
        <div className="px-4 py-3 rounded-xl bg-blue-500/[0.05] border border-blue-500/10 mb-2">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">📊</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-blue-400 font-semibold">Content Rewards coverage gap:</span>{" "}
                209 forex products on Whop with 0 CR campaigns. 234 stock trading products with just 1 CR campaign.
                429 signals groups — the #1 trading product type — yet CR campaigns barely target them.
                Meanwhile, &quot;General Investing&quot; keywords match 90 CR campaigns ($214K budget) because
                most campaigns use broad terms like &quot;earn&quot; and &quot;profit&quot; rather than targeting specific trading verticals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
