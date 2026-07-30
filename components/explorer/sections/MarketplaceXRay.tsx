"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

export function MarketplaceXRay() {
  return (
    <FadeInSection>
      <div id="marketplace-xray" className="scroll-mt-24">
        <SectionHeader number="01" title="The Marketplace X-Ray" subtitle="Six layers deep into the Whop economy — what we found changes everything" />

        {/* Intro */}
        <p className="text-[12px] text-zinc-500 leading-relaxed mb-8">
          We cross-referenced marketplace analytics with Content Rewards campaign data.
          Six independent analyses. 44 new insights. One conclusion nobody expected.
        </p>

        {/* ── ACT 1: THE SCALE ── */}
        <div className="relative mb-10">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent" />
          <div className="pl-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="absolute left-2.5 w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Layer 1</span>
            </div>
            <div className="text-[32px] sm:text-[44px] font-bold font-mono text-white leading-none tracking-tight">
              $108<span className="text-emerald-400">M</span><span className="text-[16px] text-zinc-600">/month GMV</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 mb-4 max-w-md">
              Whop isn&apos;t a niche marketplace. It&apos;s a $1.3B/year GMV platform with 85,454 products across 24 categories.
              Content Rewards campaigns represent 0.12% of it.
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: "85,454", l: "products" },
                { v: "24", l: "categories" },
                { v: "$1.56M", l: "total CR budget" },
                { v: "0.12%", l: "CR coverage" },
              ].map(pill => (
                <span key={pill.l} className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-[11px] font-mono text-white font-bold">{pill.v}</span>
                  <span className="text-[9px] text-zinc-600 ml-1.5">{pill.l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── ACT 2: THE CONCENTRATION ── */}
        <div className="relative mb-10">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-500/40 via-yellow-500/10 to-transparent" />
          <div className="pl-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="absolute left-2.5 w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-[0.2em]">Layer 2</span>
            </div>
            <div className="text-[32px] sm:text-[44px] font-bold font-mono text-white leading-none tracking-tight">
              99.96<span className="text-yellow-400">%</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 mb-4 max-w-md">
              Of Trading&apos;s revenue comes from just 3 products. Sports Betting: 100% from one product.
              The marketplace isn&apos;t 85,000 businesses — it&apos;s a handful of monopolies.
            </p>
            {/* Concentration bars */}
            <div className="space-y-2 max-w-sm">
              {[
                { cat: "Trading", pct: 99.96, top: "MetaTrading, Mirror, Lifetime" },
                { cat: "Sports Betting", pct: 100, top: "Codycoverspreads VIP (alone)" },
                { cat: "Real Estate", pct: 100, top: "RRS Mastermind (alone)" },
              ].map(c => (
                <div key={c.cat}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-white">{c.cat}</span>
                    <span className="text-[9px] font-mono text-yellow-400">{c.pct}% from top 3</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div className="h-full rounded-full bg-yellow-500/60" initial={{ width: 0 }} whileInView={{ width: `${c.pct}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
                  </div>
                  <div className="text-[8px] text-zinc-600 mt-0.5 italic">{c.top}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ACT 3: THE DECAY ── */}
        <div className="relative mb-10">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/40 via-red-500/10 to-transparent" />
          <div className="pl-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="absolute left-2.5 w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-[0.2em]">Layer 3</span>
            </div>
            <div className="text-[32px] sm:text-[44px] font-bold font-mono text-white leading-none tracking-tight">
              100<span className="text-red-400">%</span><span className="text-[16px] text-zinc-600"> fading</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 mb-4 max-w-md">
              Every single top-revenue product is marked &quot;FADING&quot; by the platform&apos;s momentum algorithm.
              $10.6M in tracked revenue across the top 10, all declining. The old guard is dying.
            </p>
            {/* Fading cascade */}
            <div className="relative overflow-hidden rounded-xl bg-red-500/[0.03] border border-red-500/10 p-4">
              <div className="space-y-1">
                {[
                  { name: "Codycoverspreads VIP", rev: "$2.0M", m: 0.01 },
                  { name: "MetaTrading.ai", rev: "$1.6M", m: 0.01 },
                  { name: "OSA Gold Program", rev: "$1.6M", m: 0.05 },
                  { name: "Amazon Inner Circle", rev: "$1.4M", m: 0.06 },
                  { name: "Gold Tier", rev: "$1.1M", m: 0.06 },
                  { name: "RRS Mastermind", rev: "$951K", m: 0.05 },
                  { name: "MIRROR TRADING", rev: "$912K", m: 0.06 },
                ].map((p, i) => (
                  <motion.div
                    key={p.name}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    <span className="text-[10px] text-zinc-400 flex-1 truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-red-400">{p.rev}</span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-red-500/10 text-red-500 font-bold">FADING</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 text-[9px] text-red-400/60">
                Momentum percentiles: 0.01 – 0.08 (bottom 8% of platform)
              </div>
            </div>
          </div>
        </div>

        {/* ── ACT 4: THE DESPERATION ── */}
        <div className="relative mb-10">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent" />
          <div className="pl-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="absolute left-2.5 w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40" />
              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-[0.2em]">Layer 4</span>
            </div>
            <div className="text-[32px] sm:text-[44px] font-bold font-mono text-white leading-none tracking-tight">
              5<span className="text-orange-400">x</span><span className="text-[16px] text-zinc-600"> more likely</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 mb-4 max-w-md">
              Fading products are 5x more likely to run Content Rewards campaigns (10% vs 1.9%).
              They pay 102% higher CPM ($1.71 vs $0.84). It&apos;s desperation marketing — and the data
              shows it doesn&apos;t reverse the decline.
            </p>
            {/* Death spiral comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-red-500/[0.04] border border-red-500/10 p-3 text-center">
                <div className="text-[22px] font-bold font-mono text-red-400">$1.71</div>
                <div className="text-[9px] text-zinc-600 mt-0.5">avg CPM — fading products</div>
                <div className="text-[9px] text-red-400/60 mt-1">paying premium to fight decline</div>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
                <div className="text-[22px] font-bold font-mono text-zinc-400">$0.84</div>
                <div className="text-[9px] text-zinc-600 mt-0.5">avg CPM — healthy products</div>
                <div className="text-[9px] text-zinc-600 mt-1">standard market rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACT 5: THE BLIND SPOT ── */}
        <div className="relative mb-10">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-blue-500/10 to-transparent" />
          <div className="pl-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="absolute left-2.5 w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/40" />
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em]">Layer 5</span>
            </div>
            <div className="text-[32px] sm:text-[44px] font-bold font-mono text-white leading-none tracking-tight">
              193<span className="text-blue-400"> breakouts</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 mb-4 max-w-md">
              While CR campaigns chase fading products, 193 products are predicted to break out — and none have
              Content Rewards campaigns. The biggest revenue categories (Trading $57.6M/mo, Business $33.8M/mo,
              AI $12.8M/mo) have zero CR presence.
            </p>
            {/* Opportunity map */}
            <div className="rounded-xl bg-blue-500/[0.03] border border-blue-500/10 p-4">
              <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-3">Untapped categories — zero CR campaigns</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { cat: "Trading", rev: "$57.6M/mo", prod: "27,083" },
                  { cat: "Business", rev: "$33.8M/mo", prod: "13,164" },
                  { cat: "Real Estate", rev: "$15.1M/mo", prod: "1,601" },
                  { cat: "AI", rev: "$12.8M/mo", prod: "12,502" },
                  { cat: "Sports Betting", rev: "$11.5M/mo", prod: "8,045" },
                  { cat: "E-Commerce", rev: "$5.0M/mo", prod: "2,432" },
                ].map(c => (
                  <div key={c.cat} className="px-2.5 py-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[10px] text-white font-medium">{c.cat}</div>
                    <div className="text-[11px] font-mono text-blue-400 font-bold">{c.rev}</div>
                    <div className="text-[8px] text-zinc-600">{c.prod} products</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ACT 6: THE FORMULA ── */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#FA4616]/40 via-[#FA4616]/10 to-transparent" />
          <div className="pl-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="absolute left-2.5 w-3 h-3 rounded-full bg-[#FA4616]/20 border border-[#FA4616]/40" />
              <span className="text-[9px] font-bold text-[#FA4616] uppercase tracking-[0.2em]">Layer 6</span>
            </div>
            <div className="text-[32px] sm:text-[44px] font-bold font-mono text-white leading-none tracking-tight">
              0.45<span className="text-[#FA4616]">%</span><span className="text-[16px] text-zinc-600"> of product price</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 mb-4 max-w-md">
              The optimal CPM formula: set your Content Rewards payout at 0.45% of your product&apos;s price.
              Quality attracts creators (r=+0.48). Ride the breakouts, don&apos;t save the dying.
            </p>
            {/* CPM recommendations table */}
            <div className="rounded-xl bg-[#FA4616]/[0.03] border border-[#FA4616]/10 p-4">
              <div className="text-[9px] font-bold text-[#FA4616] uppercase tracking-wider mb-3">Recommended CPM by category</div>
              <div className="space-y-1.5">
                {[
                  { cat: "Real Estate", price: "$2,857", cpm: "$12.86", views: "222K" },
                  { cat: "Trading", price: "$996", cpm: "$4.48", views: "222K" },
                  { cat: "Agencies", price: "$931", cpm: "$4.19", views: "222K" },
                  { cat: "AI", price: "$898", cpm: "$4.04", views: "222K" },
                  { cat: "E-Commerce", price: "$847", cpm: "$3.81", views: "222K" },
                  { cat: "Business", price: "$540", cpm: "$2.43", views: "222K" },
                ].map(r => (
                  <div key={r.cat} className="flex items-center text-[10px]">
                    <span className="text-zinc-400 w-24">{r.cat}</span>
                    <span className="text-zinc-600 w-16 font-mono">{r.price}</span>
                    <span className="text-[#FA4616] w-16 font-mono font-bold">{r.cpm}</span>
                    <span className="text-zinc-600 text-[9px]">breakeven: {r.views} views</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/[0.04] text-[9px] text-zinc-600">
                Formula: CPM = product_price × 0.0045. Breakeven = product_price ÷ CPM × 1000.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="rounded-2xl p-px bg-gradient-to-r from-red-500/30 via-[#FA4616]/20 to-blue-500/30">
          <div className="rounded-2xl bg-[var(--background)] p-5">
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              <span className="text-white font-bold">The bottom line:</span>{" "}
              Whop&apos;s marketplace economy is a $108M/month GMV machine where the biggest winners are all dying,
              Content Rewards is being used as a life support system for fading products, and the actual growth opportunities —
              193 breakout products, $136M/month in untapped category revenue — sit completely ignored. The data says stop saving
              the dying and start riding the wave.
            </p>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
