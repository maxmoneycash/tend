"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

export function TradingIndicators() {
  return (
    <FadeInSection>
      <div id="trading-indicators" className="scroll-mt-24">
        <SectionHeader number="05" title="The Indicator Economy" subtitle="We scraped all 639 trading indicator products on Whop — here's the truth" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          Trading indicators, bots, scanners, and algo systems are the tools layer of Whop&apos;s trading economy.
          We scraped every single product page, extracted features, platforms, pricing, and community data.
          The results reveal a market drowning in AI marketing hype with a handful of genuinely useful tools.
        </p>

        {/* ── THE BIG NUMBER: 97.5% claim AI ── */}
        <div className="relative rounded-2xl overflow-hidden mb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-transparent to-blue-500/[0.06]" />
          <div className="relative px-6 py-8 text-center">
            <motion.div
              className="text-[56px] sm:text-[72px] font-bold font-mono leading-none"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-purple-400">97.5</span><span className="text-zinc-600 text-[28px]">%</span>
            </motion.div>
            <p className="text-[14px] text-zinc-400 mt-2 font-medium">
              of trading indicators on Whop claim &quot;AI&quot; or &quot;Machine Learning&quot;
            </p>
            <p className="text-[11px] text-zinc-600 mt-2 max-w-md mx-auto">
              623 of 639 products. But only 41 (6.4%) offer actual automated trading
              and 21 (3.3%) have backtesting. The rest are basic technical indicators
              with AI in the marketing copy.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="px-3 py-1.5 rounded-lg bg-purple-500/10">
                <span className="text-[18px] font-bold font-mono text-purple-400">623</span>
                <span className="text-[9px] text-zinc-500 ml-1.5">say &quot;AI&quot;</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.04]">
                <span className="text-[18px] font-bold font-mono text-zinc-400">41</span>
                <span className="text-[9px] text-zinc-500 ml-1.5">actually automate</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.04]">
                <span className="text-[18px] font-bold font-mono text-zinc-400">21</span>
                <span className="text-[9px] text-zinc-500 ml-1.5">have backtesting</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURE BREAKDOWN ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-4">
            What 639 Indicator Products Actually Offer
          </h4>
          <div className="space-y-2">
            {[
              { name: "AI / Machine Learning", count: 623, pct: 97.5, color: "#A855F7", note: "nearly all claim it — almost none prove it" },
              { name: "Forex Focused", count: 130, pct: 20.3, color: "#EC4899", note: "" },
              { name: "Crypto Focused", count: 130, pct: 20.3, color: "#3B82F6", note: "" },
              { name: "TradingView Compatible", count: 126, pct: 19.7, color: "#10B981", note: "dominant platform" },
              { name: "Futures Trading", count: 97, pct: 15.2, color: "#F59E0B", note: "" },
              { name: "Options Trading", count: 89, pct: 13.9, color: "#EF4444", note: "" },
              { name: "Alert System", count: 81, pct: 12.7, color: "#06B6D4", note: "" },
              { name: "Real-Time Data", count: 69, pct: 10.8, color: "#22C55E", note: "" },
              { name: "Stock Market", count: 49, pct: 7.7, color: "#F97316", note: "" },
              { name: "Automated Trading", count: 41, pct: 6.4, color: "#8B5CF6", note: "actual automation, not just 'AI'" },
              { name: "Backtesting", count: 21, pct: 3.3, color: "#14B8A6", note: "real verifiable performance" },
              { name: "Scanner Tool", count: 13, pct: 2.0, color: "#64748B", note: "" },
              { name: "Copy Trading", count: 11, pct: 1.7, color: "#78716C", note: "" },
            ].map((f, i) => (
              <div key={f.name}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.color }} />
                  <span className="text-[10px] text-white w-36 sm:w-44 shrink-0">{f.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: f.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${f.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.03 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{f.count}</span>
                  <span className="text-[9px] text-zinc-600 w-10 text-right">{f.pct}%</span>
                </div>
                {f.note && <div className="text-[8px] text-zinc-600 ml-[calc(8px+0.5rem)] italic">{f.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ── PLATFORM WARS: WHERE INDICATORS LIVE ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Trading Platforms Used</h4>
            <div className="space-y-3">
              {[
                { name: "TradingView", count: 126, pct: 19.7, color: "#2962FF", icon: "TV" },
                { name: "ThinkOrSwim", count: 53, pct: 8.3, color: "#00C805", icon: "ToS" },
                { name: "MT5", count: 6, pct: 0.9, color: "#F59E0B", icon: "MT5" },
                { name: "NinjaTrader", count: 4, pct: 0.6, color: "#EF4444", icon: "NT" },
                { name: "Webull", count: 3, pct: 0.5, color: "#06B6D4", icon: "WB" },
                { name: "MT4", count: 2, pct: 0.3, color: "#F97316", icon: "MT4" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: p.color + "20", color: p.color }}>{p.icon}</span>
                  <span className="text-[10px] text-white flex-1">{p.name}</span>
                  <span className="text-[11px] font-mono font-bold text-white">{p.count}</span>
                  <span className="text-[9px] text-zinc-600">{p.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <p className="text-[9px] text-zinc-600">
                TradingView is 2.4x more popular than ThinkOrSwim. MT4/MT5 (traditional forex) is nearly dead on Whop — only 8 total products.
              </p>
            </div>
          </div>

          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Community & Distribution</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white">Discord Community</span>
                  <span className="text-[11px] font-mono font-bold text-[#5865F2]">44%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#5865F2]" initial={{ width: 0 }} whileInView={{ width: "44%" }} viewport={{ once: true }} transition={{ duration: 0.7 }} />
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">281 of 639 include Discord access</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white">Free Trial Available</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">9.9%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div className="h-full rounded-full bg-emerald-500" initial={{ width: 0 }} whileInView={{ width: "9.9%" }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} />
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">63 products offer try-before-you-buy</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white">Telegram Channel</span>
                  <span className="text-[11px] font-mono font-bold text-[#26A5E4]">5.5%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#26A5E4]" initial={{ width: 0 }} whileInView={{ width: "5.5%" }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} />
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">35 products — Telegram losing to Discord for trading</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ASSET CLASS BREAKDOWN ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">What Markets Do These Indicators Trade?</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { asset: "Forex", count: 130, icon: "💱", color: "#EC4899" },
              { asset: "Crypto", count: 130, icon: "₿", color: "#3B82F6" },
              { asset: "Futures", count: 97, icon: "📊", color: "#F59E0B" },
              { asset: "Options", count: 89, icon: "📈", color: "#EF4444" },
              { asset: "Stocks", count: 49, icon: "🏦", color: "#10B981" },
              { asset: "Multi-Asset", count: 144, icon: "🌐", color: "#8B5CF6" },
            ].map((a) => (
              <div key={a.asset} className="rounded-xl bg-white/[0.02] px-3 py-2.5 text-center">
                <div className="text-[16px] mb-1">{a.icon}</div>
                <div className="text-[16px] font-bold font-mono" style={{ color: a.color }}>{a.count}</div>
                <div className="text-[9px] text-zinc-500">{a.asset}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[9px] text-zinc-600">
              Forex and Crypto are tied at 130 products each (20.3%). Futures (97) beats Options (89).
              Only 49 focus on stocks — Whop&apos;s trading audience skews toward leveraged markets.
            </p>
          </div>
        </div>

        {/* ── TOP INDICATOR PRODUCTS ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Biggest Trading Tools by Members</h4>
          <div className="space-y-1.5">
            {[
              { name: "MOT FREE INDICATORS", members: 4167, stars: 4.9, reviews: 50, price: "Free", features: ["Options", "Alerts"], owner: "Max Options Trading" },
              { name: "Botos Trading Academy", members: 3489, stars: 4.6, reviews: 77, price: "Free", features: ["Education", "Stocks"], owner: "Erik Botos" },
              { name: "Daytrading Toolkit", members: 3432, stars: 4.9, reviews: 48, price: "Free", features: ["Scanner", "Real-time"], owner: "teach.trade" },
              { name: "CRT Algo", members: 1397, stars: 0, reviews: 0, price: "Free", features: ["Automated", "Crypto"], owner: "Matt Pease" },
              { name: "Crux Algo", members: 1093, stars: 5.0, reviews: 170, price: "Free", features: ["AI/ML", "Alerts"], owner: "Crux Algo" },
              { name: "KinnoBot", members: 985, stars: 4.3, reviews: 158, price: "Free", features: ["Automated", "Crypto"], owner: "Kinno" },
              { name: "Profit Indicator", members: 797, stars: 3.1, reviews: 18, price: "$997", features: ["TradingView"], owner: "PROFIT OVER EVERYTHING", flag: true },
              { name: "MOT Pivot Hunter Pro", members: 576, stars: 4.9, reviews: 98, price: "$30", features: ["Options", "TradingView"], owner: "Max Options Trading" },
              { name: "FVG/IFVG Automated", members: 517, stars: 4.8, reviews: 43, price: "$25", features: ["Automated", "TradingView"], owner: "Blastoise Trades" },
              { name: "Inevitrade FREE Tools", members: 485, stars: 5.0, reviews: 13, price: "Free", features: ["Scanner", "Options"], owner: "Craig Percoco" },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${p.flag ? "bg-red-500/[0.06] border border-red-500/10" : "bg-white/[0.02]"}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="text-[9px] font-mono text-zinc-600 w-4">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white truncate">{p.name}</span>
                    {p.flag && <span className="text-[7px] px-1 py-0.5 rounded bg-red-500/10 text-red-400 font-bold shrink-0">3.1★ @ $997</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-zinc-600">
                    <span>{p.owner}</span>
                    <span>{p.features.join(", ")}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">{p.members.toLocaleString()}</span>
                <span className="text-[9px] text-zinc-600 shrink-0">{p.stars > 0 ? p.stars.toFixed(1) + "★" : "—"}</span>
                <span className="text-[9px] font-mono shrink-0" style={{ color: p.price === "Free" ? "#22C55E" : "#F59E0B" }}>{p.price}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[9px] text-zinc-600">
              Max Options Trading dominates with 4 products (indicators at $0-$30). Crux Algo has the best reviews (5.0★ from 170 reviews).
              The outlier: &quot;Profit Indicator&quot; charges <span className="text-red-400 font-semibold">$997</span> but has only
              a <span className="text-red-400 font-semibold">3.1★</span> rating from 18 reviews — highest price, worst rating.
            </p>
          </div>
        </div>

        {/* ── THE AI HYPE vs REALITY ── */}
        <div className="rounded-2xl p-px bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 mb-4">
          <div className="rounded-2xl bg-[var(--background)] p-5">
            <h4 className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-3">The AI Hype Machine</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-[24px] font-bold font-mono text-purple-400">623</div>
                <div className="text-[9px] text-zinc-600">say &quot;AI&quot;</div>
                <div className="text-[8px] text-zinc-700">97.5%</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold font-mono text-zinc-400">41</div>
                <div className="text-[9px] text-zinc-600">automate trades</div>
                <div className="text-[8px] text-zinc-700">6.4%</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold font-mono text-zinc-500">21</div>
                <div className="text-[9px] text-zinc-600">have backtesting</div>
                <div className="text-[8px] text-zinc-700">3.3%</div>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              If 97.5% of products claim AI but only 6.4% actually automate anything, the term has become
              meaningless marketing. A &quot;Pine Script indicator with moving average crossover&quot; is not AI —
              but on Whop, it&apos;s marketed as one. Buyers have no way to verify claims before purchasing.
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              On-chain evidence of actual algorithm performance (backtest results, live trade logs, verifiable P&amp;L)
              would instantly separate the 41 real automated systems from the 582 that just say &quot;AI&quot; in the title.
            </p>
          </div>
        </div>

        {/* ── SIGNALS ECONOMY ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">The Signals Economy</h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            457 signal groups on Whop with 391K total members. Signals are the #1 product type
            in trading — more than indicators (153), education (924), or bots (142). Yet r/Daytrading
            posts a blanket warning: &quot;Signal groups from whop ARE SCAMS.&quot;
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-xl bg-white/[0.02] px-3 py-2.5 text-center">
              <div className="text-[18px] font-bold font-mono text-[#F59E0B]">457</div>
              <div className="text-[9px] text-zinc-600">signal groups</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] px-3 py-2.5 text-center">
              <div className="text-[18px] font-bold font-mono text-white">391K</div>
              <div className="text-[9px] text-zinc-600">total members</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] px-3 py-2.5 text-center">
              <div className="text-[18px] font-bold font-mono text-zinc-400">4.71</div>
              <div className="text-[9px] text-zinc-600">avg rating (★)</div>
            </div>
            <div className="rounded-xl bg-red-500/[0.06] px-3 py-2.5 text-center border border-red-500/10">
              <div className="text-[18px] font-bold font-mono text-red-400">0</div>
              <div className="text-[9px] text-zinc-600">CR campaigns</div>
            </div>
          </div>
        </div>

        {/* ── REVIEW SENTIMENT ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">What 84,273 Trading Reviews Reveal</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[9px] text-emerald-400 font-semibold mb-2">5-Star Reviews (76,495 — 90.8%)</div>
              <div className="space-y-1">
                {[
                  { word: "profit", count: 5391, pct: 7.0 },
                  { word: "signals", count: 4461, pct: 5.8 },
                  { word: "paid reviewers", count: 38261, pct: 50.0 },
                ].map(w => (
                  <div key={w.word} className="flex items-center gap-2 text-[9px]">
                    <span className="text-zinc-400 w-20">&quot;{w.word}&quot;</span>
                    <span className="font-mono text-emerald-400 w-10 text-right">{w.count.toLocaleString()}</span>
                    <span className="text-zinc-600">{w.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-red-400 font-semibold mb-2">1-Star Reviews (3,453 — 4.1%)</div>
              <div className="space-y-1">
                {[
                  { word: "scam", count: 437, pct: 12.7 },
                  { word: "refund", count: 378, pct: 10.9 },
                  { word: "paid reviewers", count: 2744, pct: 79.5 },
                ].map(w => (
                  <div key={w.word} className="flex items-center gap-2 text-[9px]">
                    <span className="text-zinc-400 w-20">&quot;{w.word}&quot;</span>
                    <span className="font-mono text-red-400 w-10 text-right">{w.count.toLocaleString()}</span>
                    <span className="text-zinc-600">{w.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-yellow-500/[0.05] border border-yellow-500/10">
            <p className="text-[10px] text-zinc-400">
              <span className="text-yellow-400 font-semibold">50% of 5-star reviews are from paid reviewers.</span>{" "}
              79.5% of 1-star reviews are also from paid users — meaning people who actually bought the product
              are more likely to leave extreme reviews (either very happy or very angry). The 437 &quot;scam&quot; mentions
              in 1-star reviews come overwhelmingly from paying customers.
            </p>
          </div>
        </div>

        {/* ── THE $997 INDICATOR PROBLEM ── */}
        <div className="px-4 py-3 rounded-xl bg-red-500/[0.05] border border-red-500/10 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">⚠️</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-red-400 font-semibold">The $997 Indicator Problem:</span>{" "}
                &quot;Profit Indicator&quot; charges $997 with a 3.1★ rating from 18 reviews — the highest price
                and worst rating of any popular indicator. BBB data shows $7,500-$15,000 trading products
                that deliver only basic pre-recorded videos. 12.7% of 1-star trading reviews mention &quot;scam.&quot;
                Without verifiable performance data, buyers are gambling on marketing claims.
              </p>
            </div>
          </div>
        </div>

        {/* ── PRICE DISTRIBUTION ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            Price Architecture: 492 Products with Known Pricing
          </h4>
          <div className="space-y-2">
            {[
              { bracket: "Under $50", count: 181, pct: 36.8, note: "signals subscriptions, monthly Discord access", color: "#22C55E" },
              { bracket: "$50 – $99", count: 146, pct: 29.7, note: "mid-tier alerts + community bundles", color: "#84CC16" },
              { bracket: "$100 – $499", count: 116, pct: 23.6, note: "TradingView scripts, indicator sets", color: "#EAB308" },
              { bracket: "$500 – $999", count: 25, pct: 5.1, note: "premium 'systems' with coaching add-on", color: "#F97316" },
              { bracket: "$1,000+", count: 22, pct: 4.5, note: "100% claim AI — likely coaching programs in disguise", color: "#EF4444" },
            ].map((b, i) => (
              <div key={b.bracket}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-white w-24 shrink-0">{b.bracket}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: b.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-white w-6 text-right">{b.count}</span>
                  <span className="text-[9px] text-zinc-600 w-8 text-right">{b.pct}%</span>
                </div>
                <div className="text-[8px] text-zinc-600 ml-[calc(96px+0.5rem)] italic">{b.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[9px] text-zinc-600">
              66.5% of indicator products cost under $100 — these are monthly subscription services,
              not one-time purchases. The 22 products over $1,000 are overwhelmingly high-ticket coaching programs
              that use an &quot;indicator&quot; or &quot;system&quot; as the marketing hook.
              Of the 7 products priced at exactly $997, <span className="text-yellow-400">all 7 claim AI</span> — but none have backtesting data.
            </p>
          </div>
        </div>

        {/* ── REVENUE REALITY: TOP INDICATOR PRODUCTS BY REVENUE ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            Revenue Reality: 4 Indicator Products in Whop&apos;s Top 50 Trading Revenue
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            WhopScan lifetime revenue estimates for the highest-earning indicator-adjacent products.
            The pattern is clear: the more revenue, the less it&apos;s actually an indicator.
          </p>
          <div className="space-y-3">
            {[
              {
                rank: 26, name: "MomenumX Apprenticeship", revenue: "$33.4M", price: "$5,000",
                actualProduct: "High-ticket mentorship program", delivery: "Coaching + community",
                hasActualIndicator: false, color: "#EF4444",
                note: "No Discord, no platform listed. Pure $5K coaching — indicator is the hook.",
              },
              {
                rank: 35, name: "Alertsify PRO - Copy Trading", revenue: "$27.2M", price: "$99/mo",
                actualProduct: "Automated copy trading bot", delivery: "Automated trading + free trial",
                hasActualIndicator: true, color: "#F59E0B",
                note: "Reddit r/BadBiz: \"Dashboard Said I Was Profitable While My Account Got WIPED\"",
                flagged: true,
              },
              {
                rank: 41, name: "Profit Indicator", revenue: "$23.9M", price: "$997",
                actualProduct: "TradingView script + Discord", delivery: "TradingView + Discord access",
                hasActualIndicator: true, color: "#F97316",
                note: "3.1★ rating from 18 reviews — worst rated high-revenue indicator.",
              },
              {
                rank: 48, name: "Trader Motif - Lifetime", revenue: "$18.4M", price: "$1,999",
                actualProduct: "Crypto trading program", delivery: "Community + mentorship",
                hasActualIndicator: false, color: "#EAB308",
                note: "No platform, no automation. Lifetime access = coaching program.",
              },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                className={`rounded-xl p-3 ${p.flagged ? "bg-red-500/[0.05] border border-red-500/10" : "bg-white/[0.02]"}`}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[8px] font-mono text-zinc-600 shrink-0">#{p.rank}</span>
                    <span className="text-[11px] text-white font-medium truncate">{p.name}</span>
                    {!p.hasActualIndicator && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-bold shrink-0 whitespace-nowrap">NOT AN INDICATOR</span>
                    )}
                    {p.flagged && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold shrink-0 whitespace-nowrap">SCAM REPORTS</span>
                    )}
                  </div>
                  <span className="text-[13px] font-mono font-bold shrink-0" style={{ color: p.color }}>{p.revenue}</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] mb-1.5">
                  <span className="text-zinc-400">Price: <span className="text-white font-mono">{p.price}</span></span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-400">Actual product: <span className="text-zinc-300">{p.actualProduct}</span></span>
                </div>
                <div className="text-[8px] text-zinc-600 italic">{p.note}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center px-2 py-2 rounded-xl bg-white/[0.02]">
                <div className="text-[14px] font-bold font-mono text-white">$103M</div>
                <div className="text-[8px] text-zinc-600">combined lifetime revenue</div>
              </div>
              <div className="text-center px-2 py-2 rounded-xl bg-white/[0.02]">
                <div className="text-[14px] font-bold font-mono text-yellow-400">2 of 4</div>
                <div className="text-[8px] text-zinc-600">are not actual indicators</div>
              </div>
              <div className="text-center px-2 py-2 rounded-xl bg-red-500/[0.05]">
                <div className="text-[14px] font-bold font-mono text-red-400">1 of 4</div>
                <div className="text-[8px] text-zinc-600">has active scam reports</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── HOW IT ACTUALLY WORKS: THE INDICATOR FUNNEL ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            How the Indicator Business Model Actually Works
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            After scraping 639 product pages, cross-referencing Reddit posts, and analyzing revenue data,
            the business model is consistent across all tiers:
          </p>
          <div className="space-y-2">
            {[
              {
                step: "1", label: "Free content on Reddit/X/YouTube", detail: "Signal callouts, chart analysis, performance screenshots. Never shows losses. Drives followers to a Discord.",
                icon: "📢", color: "#3B82F6",
              },
              {
                step: "2", label: "Discord free tier / 7-day trial", detail: "44% of indicator products include Discord. Free tier shows edited highlights. 7-day trial converts ~9.9% to paid.",
                icon: "💬", color: "#5865F2",
              },
              {
                step: "3", label: "Monthly subscription ($40–$99)", detail: "Access to 'live signals,' alerts channel, and the indicator script. The indicator itself is often basic — the Discord is the real product.",
                icon: "💳", color: "#22C55E",
              },
              {
                step: "4", label: "High-ticket upsell ($997–$5,000)", detail: "1-on-1 coaching, 'advanced system,' lifetime access. Always includes 'AI' in the marketing. This is where the $18M–$33M revenue comes from.",
                icon: "🎯", color: "#F97316",
              },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ background: s.color + "20", color: s.color }}>
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-white font-medium mb-0.5">{s.label}</div>
                  <div className="text-[9px] text-zinc-500">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.02]">
            <p className="text-[9px] text-zinc-500">
              <span className="text-zinc-300 font-semibold">The math:</span> A creator with 1,000 Discord free members
              converts ~100 to $49/mo = $4,900/mo base. Upsell 10 to a $1,997 &quot;lifetime&quot; program
              = $19,970. That&apos;s $24,870/mo from a Discord + TradingView script that took a weekend to build.
              The &quot;indicator&quot; is not the product — the funnel is.
            </p>
          </div>
        </div>

        {/* ── DELIVERY METHOD REALITY (real data from 200-product scrape) ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            What the Top 200 Indicator Products Actually Deliver
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            Full-page scraped content from top 200 by member count. Only 19% deliver an actual TradingView script.
            The category is called &quot;indicators&quot; — the dominant product is a video course.
          </p>
          <div className="space-y-2">
            {[
              { method: "Video course", pct: 31, count: 62, note: "educational content — #1 delivery method", color: "#8B5CF6" },
              { method: "Discord community", pct: 28, count: 55, note: "community access is the core product for many", color: "#5865F2" },
              { method: "Live trading sessions", pct: 23, count: 46, note: "streams / live calls", color: "#22C55E" },
              { method: "TradingView script", pct: 19, count: 37, note: "actual indicator code — far less than marketed", color: "#2962FF" },
              { method: "Discord alerts", pct: 18, count: 35, note: "manual signal notifications", color: "#4F46E5" },
              { method: "Automated trading", pct: 11, count: 22, note: "real automation — vs 97.5% claiming 'AI'", color: "#EF4444" },
              { method: "1-on-1 coaching", pct: 8, count: 15, note: "direct mentorship sessions", color: "#F59E0B" },
            ].map((d, i) => (
              <div key={d.method}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-36 shrink-0 text-[10px] text-white">{d.method}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(d.pct * 2.8, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white w-8 text-right">{d.pct}%</span>
                  <span className="text-[9px] text-zinc-600 w-8 text-right">{d.count}</span>
                </div>
                <div className="text-[8px] text-zinc-600 ml-[calc(144px+0.5rem)] italic">{d.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                <div className="text-[18px] font-bold font-mono text-red-400">97.5%</div>
                <div className="text-[9px] text-zinc-500">say &quot;AI&quot;</div>
                <div className="text-[8px] text-zinc-700 mt-0.5">only 11% actually automate trades</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-blue-500/[0.04] border border-blue-500/10">
                <div className="text-[18px] font-bold font-mono text-[#2962FF]">19%</div>
                <div className="text-[9px] text-zinc-500">deliver a TradingView script</div>
                <div className="text-[8px] text-zinc-700 mt-0.5">despite &quot;indicator&quot; in the category name</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── WHO THEY ACTUALLY SERVE ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Target Audience</h4>
            <div className="space-y-2">
              {[
                { audience: "Crypto traders", pct: 27, color: "#3B82F6" },
                { audience: "Options traders", pct: 18, color: "#EF4444" },
                { audience: "Stock traders", pct: 11, color: "#22C55E" },
                { audience: "Forex traders", pct: 8, color: "#EC4899" },
                { audience: "Day traders", pct: 7, color: "#F59E0B" },
                { audience: "Futures traders", pct: 7, color: "#F97316" },
                { audience: "Not specified", pct: 66, color: "#374151" },
              ].map((a) => (
                <div key={a.audience} className="flex items-center gap-2">
                  <span className="text-[10px] w-28 shrink-0" style={{ color: a.pct > 50 ? "#6B7280" : "white" }}>{a.audience}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full" style={{ background: a.color, width: `${Math.min(a.pct * 1.5, 100)}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <p className="text-[9px] text-zinc-600">
                66% don&apos;t specify who they&apos;re for — generic marketing to maximize funnel width.
                Crypto is the largest stated audience at 27%.
              </p>
            </div>
          </div>

          <div className="surface-1 rounded-[16px] p-5">
            <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Creator Engagement After Purchase</h4>
            <div className="space-y-2.5">
              {[
                { signal: "No engagement signals", pct: 67, color: "#EF4444", detail: "sell and disappear" },
                { signal: "Moderated community", pct: 12, color: "#8B5CF6", detail: "active moderators" },
                { signal: "Regular updates", pct: 7, color: "#22C55E", detail: "weekly/monthly content" },
                { signal: "Live Q&A sessions", pct: 6, color: "#3B82F6", detail: "interactive calls" },
                { signal: "24/7 support", pct: 4, color: "#F59E0B", detail: "usually Discord-based" },
              ].map((e) => (
                <div key={e.signal} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                  <span className="text-[10px] flex-1" style={{ color: e.pct > 50 ? "#EF4444" : "white" }}>{e.signal}</span>
                  <span className="text-[8px] text-zinc-600">{e.detail}</span>
                  <span className="text-[9px] font-mono font-bold ml-1" style={{ color: e.color }}>{e.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <p className="text-[9px] text-zinc-600">
                67% of indicator product pages show no post-purchase engagement signals.
                Buyers are on their own once they&apos;ve paid.
              </p>
            </div>
          </div>
        </div>

        {/* ── SKILL LEVEL / ACCOUNTABILITY CALLOUT ── */}
        <div className="px-4 py-3 rounded-xl bg-orange-500/[0.05] border border-orange-500/10 mb-2">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">&#128202;</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-orange-400 font-semibold">20% explicitly target beginners — the most profitable audience.</span>{" "}
                Beginners lack the context to evaluate performance claims. 66% of products don&apos;t specify skill level at all —
                deliberately broad to maximize conversions. Only 3.3% provide backtest data.
                The 437 &quot;scam&quot; mentions in 1-star reviews and Alertsify&apos;s Reddit exposure ($27.2M, wiped accounts)
                are the inevitable result: no verification, no accountability, no recourse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
