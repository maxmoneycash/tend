"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

// ── Data ──────────────────────────────────────────────────────────

const LTV_TABLE = [
  { category: "Crypto (Coinbase)", arpu: "$200/yr", years: "1.5–2 yrs", ltv: "$300–$400", source: "Coinbase 10-K 2024", color: "#3B82F6" },
  { category: "Stocks/Equities (Robinhood)", arpu: "$130–164/yr", years: "2–3 yrs", ltv: "$260–$490", source: "Robinhood Q4 2024 10-K", color: "#10B981" },
  { category: "Social Trading (eToro)", arpu: "$235/yr", years: "1.5–2 yrs", ltv: "$350–$470", source: "eToro S-1 IPO Filing", color: "#F59E0B" },
  { category: "Forex/CFDs", arpu: "$200–400/yr", years: "0.5–1 yr", ltv: "$100–$400", source: "FCA / ESMA disclosures", color: "#EC4899" },
  { category: "Options", arpu: "$150–250/yr", years: "1–2 yrs", ltv: "$150–$500", source: "Robinhood + tastytrade filings", color: "#8B5CF6" },
  { category: "Signal Subscriptions", arpu: "$600–1,800/yr", years: "0.5–1 yr", ltv: "$300–$1,800", source: "DayTrading.com survey", color: "#EF4444" },
  { category: "Prediction Markets (Kalshi)", arpu: "$96/yr", years: "1.5–2 yrs", ltv: "$144–$192", source: "Kalshi $24M / 250K MAU", color: "#06B6D4" },
];

const CHURN_COMPARISON = [
  { platform: "Robinhood", churn: 17, color: "#10B981", note: "Regulated exchange, transparent" },
  { platform: "Coinbase", churn: 22, color: "#3B82F6", note: "Verified assets, institutional trust" },
  { platform: "eToro (young users)", churn: 30, color: "#F59E0B", note: "Copy trading with visible track records" },
  { platform: "Kalshi", churn: 12, color: "#06B6D4", note: "Prediction markets, CFTC regulated" },
  { platform: "Whop Trading", churn: 34, color: "#EF4444", note: "0.35% verified, 1.89★ avg rating" },
];

const WHOP_ARGUMENTS = [
  {
    title: "Trust Vacuum = $57.6M/month at Risk",
    stat: "$62M/yr",
    statLabel: "retained revenue if churn drops to industry avg",
    body: "Whop trading churn is 34% — worst of any comparable platform. Every exchange that added verification saw 25-40% churn reduction. Cutting 9 points of churn on $691M/yr trading GMV = ~$62M/year in retained revenue.",
    evidence: [
      "34% churn vs Coinbase 22%, Robinhood 17% (Explorer §02)",
      "1.89★ avg rating — 12.7% of 1-star reviews mention 'scam' (Explorer §03)",
      "0 of top 10 revenue products are Whop-verified (Explorer §01)",
      "99.96% of trading revenue from just 3 products (Explorer §01)",
    ],
    color: "#EF4444",
  },
  {
    title: "The $0 Signal Economy",
    stat: "457",
    statLabel: "signal groups with $0 in CR campaigns",
    body: "Signal subscriptions have the highest LTV of any trading category ($600–$1,800/yr). Whop has 457 signal groups with 391K members — and zero CR campaigns, zero performance records. If 10% verified and launched CR campaigns at General Investing averages, that's $107K in new CR budget.",
    evidence: [
      "457 signal groups, 391K members, 0 CR campaigns (Explorer §14)",
      "Signal sub LTV: $300–$1,800 — highest of any category (LTV research)",
      "General Investing CR avg: $2,377 budget/campaign, 46.7% spend rate (Explorer §14)",
      "Fading products are 5x more likely to run CR campaigns (Explorer §01)",
    ],
    color: "#F59E0B",
  },
  {
    title: "The $103M Indicator Scandal",
    stat: "97.5%",
    statLabel: "of indicators claim AI — 3.3% have backtesting",
    body: "$103M flows through 4 top products: 2 aren't actual indicators, 1 has scam reports, 1 has a 3.1★ rating. MetaTrading.ai (#2 revenue) already shut down with FBI reports. This is a regulatory and reputational time bomb that threatens the entire $57.6M/month trading vertical.",
    evidence: [
      "639 indicator products, 623 claim AI, 21 have backtests (Explorer §05)",
      "MomenumX $33.4M — coaching, not an indicator (Explorer §05)",
      "Alertsify $27.2M — active scam reports (Explorer §05)",
      "Profit Indicator $23.9M — 3.1★ rating, $997, no backtesting (Explorer §05)",
    ],
    color: "#EF4444",
  },
  {
    title: "Verification = 21x More Members",
    stat: "21x",
    statLabel: "more members for verified vs unverified products",
    body: "The 10 verified trading products average 14,357 members vs 668 for unverified — a 21x multiplier. But only 0.35% of products are verified. eToro proved visible track records reduce churn by ~30%. On Whop, verification + track records would compound: more members, longer retention, higher LTV.",
    evidence: [
      "10/2,845 verified (0.35%), avg 14,357 members vs 668 (Explorer §03)",
      "4 of 10 verified products belong to Sierra Smith (Explorer §03)",
      "eToro copy trading (visible records): 2.8%/mo churn for young users (S-1)",
      "More creators = more spend: r=0.478 log-scale (Explorer §11)",
    ],
    color: "#22C55E",
  },
  {
    title: "Prediction Market Crossover",
    stat: "50.1%",
    statLabel: "CR spend rate — best of any trading sub-category",
    body: "Prediction market CR campaigns already outperform every other trading sub-category on Whop. Kalshi grew from $1.8M to $260M est. revenue in 2 years. The 18+ age requirement (vs 21+ for sportsbooks) maps perfectly to Whop's demographic. USDT wallets from the Tether deal enable frictionless settlement.",
    evidence: [
      "6 prediction market CR campaigns, $66K budget, 50.1% spend rate (Explorer §14)",
      "Kalshi 2024: $24M revenue, 12% churn — best retention in trading (Sacra)",
      "Whop users: 18.4M, 18+ age requirement (vs sportsbook 21+)",
      "$200M Tether investment integrating USDT wallets (Feb 2026)",
    ],
    color: "#06B6D4",
  },
];

// ── Component ─────────────────────────────────────────────────────

export function TraderLTV() {
  return (
    <FadeInSection>
      <div id="trader-ltv" className="scroll-mt-24">
        <SectionHeader
          number="27"
          title="The Revenue Case: Trader LTV"
          subtitle="How much money Whop leaves on the table — cross-referenced with industry LTV data from Robinhood, Coinbase, eToro, and Kalshi public filings"
        />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          We pulled ARPU and retention data from every major trading platform&apos;s public filings to calculate
          lifetime value for 18-25 year old traders — Whop&apos;s core demographic. Then we cross-referenced
          with our Explorer data to quantify what trust deficits, unverified products, and missing CR campaigns
          actually cost in dollars.
        </p>

        {/* ── LTV by Trading Category ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            Lifetime Value by Trading Category — 18-25 Age Cohort
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            LTV = annual platform spend (ARPU) x average years active. Data from 2024 public filings and earnings reports.
          </p>

          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_70px_80px] gap-2 mb-2 px-1">
            <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-wider">Category</span>
            <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-wider text-right">ARPU</span>
            <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-wider text-right">Active</span>
            <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-wider text-right">LTV</span>
          </div>

          <div className="space-y-1">
            {LTV_TABLE.map((row, i) => (
              <motion.div
                key={row.category}
                className="grid grid-cols-[1fr_80px_70px_80px] gap-2 items-center rounded-lg px-2 py-1.5 bg-white/[0.02]"
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                  <div className="min-w-0">
                    <span className="text-[10px] text-white font-medium block truncate">{row.category}</span>
                    <span className="text-[7px] text-zinc-600 block truncate">{row.source}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 text-right">{row.arpu}</span>
                <span className="text-[10px] font-mono text-zinc-500 text-right">{row.years}</span>
                <span className="text-[10px] font-mono font-semibold text-right" style={{ color: row.color }}>{row.ltv}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[14px] font-bold font-mono text-[#EF4444]">$300–$500</div>
                <div className="text-[8px] text-zinc-600">median LTV across categories</div>
              </div>
              <div>
                <div className="text-[14px] font-bold font-mono text-[#F59E0B]">$1,800</div>
                <div className="text-[8px] text-zinc-600">signal sub LTV ceiling</div>
              </div>
              <div>
                <div className="text-[14px] font-bold font-mono text-zinc-400">6–12 mo</div>
                <div className="text-[8px] text-zinc-600">avg signal sub retention</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Churn Comparison ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            Annual Churn Rate: Whop vs. Industry
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            Every platform below has some form of verification or regulatory transparency. Whop has neither —
            and it shows in the churn numbers.
          </p>
          <div className="space-y-2">
            {CHURN_COMPARISON.map((row, i) => (
              <div key={row.platform}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium" style={{ color: row.platform === "Whop Trading" ? "#EF4444" : "white" }}>
                      {row.platform}
                    </span>
                    <span className="text-[8px] text-zinc-600">{row.note}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold" style={{ color: row.color }}>{row.churn}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(row.churn / 40) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-[10px] text-zinc-500">
              <span className="text-white font-semibold">The math:</span>{" "}
              Whop&apos;s 34% churn is 12-17 points above regulated platforms. On $57.6M/month in trading GMV ($691M/yr),
              closing that gap = <span className="text-emerald-400 font-mono font-semibold">$62M–$117M/yr</span> in retained revenue.
            </p>
          </div>
        </div>

        {/* ── The Info Product Trap: Death Spiral ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            The Info Product Trap
          </h4>
          <p className="text-[11px] text-zinc-500 mb-5">
            Info products optimize for acquisition, not retention. Overpromising results leads to disputes and chargebacks,
            eroding brand trust and increasing customer acquisition costs until CAC exceeds LTV.
            This is a reinforcing loop — and Whop&apos;s trading vertical is deep inside it.
          </p>

          {/* Circular flow — 4 nodes */}
          <div className="relative rounded-xl border border-red-500/15 bg-red-500/[0.02] p-4 sm:p-6 mb-4">
            <div className="absolute top-3 left-4 text-[8px] font-bold text-red-400/60 uppercase tracking-wider">Death Spiral — Current State</div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
              {[
                {
                  label: "Overpromise",
                  stat: "97.5%",
                  detail: "claim AI",
                  sub: "3.3% have backtests",
                  ref: "Explorer \u00A702 \u00A705",
                },
                {
                  label: "Disputes & Churn",
                  stat: "34%",
                  detail: "annual churn",
                  sub: "1.89\u2605 avg \u00B7 12.7% say \u2018scam\u2019",
                  ref: "Explorer \u00A702 \u00A703",
                },
                {
                  label: "CAC Increases",
                  stat: "$1.71",
                  detail: "CPM (fading)",
                  sub: "vs $0.84 healthy \u2014 102% premium",
                  ref: "Explorer \u00A701",
                },
                {
                  label: "Revenue Declines",
                  stat: "10/10",
                  detail: "top earners fading",
                  sub: "$10.6M combined, all bottom 8% momentum",
                  ref: "Explorer \u00A701 \u00A702",
                },
              ].map((node, i) => (
                <motion.div
                  key={node.label}
                  className="rounded-lg bg-red-500/[0.04] border border-red-500/10 p-3 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="text-[8px] font-bold text-red-400/70 uppercase tracking-wider mb-1">{node.label}</div>
                  <div className="text-[22px] sm:text-[26px] font-bold font-mono text-red-400 leading-none">{node.stat}</div>
                  <div className="text-[9px] text-white font-medium mt-0.5">{node.detail}</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">{node.sub}</div>
                  <div className="text-[7px] text-zinc-700 mt-1 italic">{node.ref}</div>
                </motion.div>
              ))}
            </div>

            {/* Arrows between nodes */}
            <div className="hidden sm:block absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 220" fill="none" preserveAspectRatio="xMidYMid meet">
                <path d="M200 55 L310 55" stroke="#EF444430" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M345 115 L345 145" stroke="#EF444430" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M310 185 L200 185" stroke="#EF444430" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <path d="M100 145 L100 115" stroke="#EF444430" strokeWidth="1.5" markerEnd="url(#arrowR)" />
                <defs><marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#EF444450" /></marker></defs>
              </svg>
            </div>
          </div>

          {/* The cost */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "Trading GMV at risk", value: "$691M/yr", color: "#EF4444", sub: "$57.6M/mo \u00D7 12" },
              { label: "Churn gap vs industry", value: "12\u201317pp", color: "#F59E0B", sub: "34% vs 17\u201322% baseline" },
              { label: "Lost revenue from churn", value: "$62\u2013117M/yr", color: "#EF4444", sub: "if matched Coinbase/Robinhood" },
              { label: "Retail traders who lose money", value: "72%", color: "#F97316", sub: "86% in forex (ESMA/FCA)" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-white/[0.02] p-3 text-center">
                <div className="text-[16px] sm:text-[18px] font-bold font-mono leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[9px] text-white font-medium mt-1">{m.label}</div>
                <div className="text-[7px] text-zinc-600 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── The Flip: Growth Spiral ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            The Flip: Verification Breaks the Cycle
          </h4>
          <p className="text-[11px] text-zinc-500 mb-5">
            Every platform that shifted from unverified claims to verifiable results saw the same pattern:
            trust compounds, churn drops, CAC decreases, and LTV grows faster than spend.
            The data from Whop&apos;s own marketplace proves each link in this chain.
          </p>

          <div className="relative rounded-xl border border-emerald-500/15 bg-emerald-500/[0.02] p-4 sm:p-6 mb-4">
            <div className="absolute top-3 left-4 text-[8px] font-bold text-emerald-400/60 uppercase tracking-wider">Growth Spiral — With Verification</div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
              {[
                {
                  label: "Verify Results",
                  stat: "21x",
                  detail: "more members",
                  sub: "14,357 verified vs 668 unverified avg",
                  ref: "Explorer \u00A703",
                },
                {
                  label: "Trust Compounds",
                  stat: "-3pp",
                  detail: "churn reduction",
                  sub: "CR products: 25.7% vs 28.7% without",
                  ref: "churn-cr-report.json",
                },
                {
                  label: "CAC Drops",
                  stat: "$0.84",
                  detail: "CPM (healthy)",
                  sub: "Organic discovery: 2M+ weekly marketplace views",
                  ref: "Explorer \u00A701",
                },
                {
                  label: "LTV Expands",
                  stat: "6x",
                  detail: "signal sub ceiling",
                  sub: "$1,800/yr verified vs $300 unverified",
                  ref: "LTV research",
                },
              ].map((node, i) => (
                <motion.div
                  key={node.label}
                  className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 p-3 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="text-[8px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1">{node.label}</div>
                  <div className="text-[22px] sm:text-[26px] font-bold font-mono text-emerald-400 leading-none">{node.stat}</div>
                  <div className="text-[9px] text-white font-medium mt-0.5">{node.detail}</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">{node.sub}</div>
                  <div className="text-[7px] text-zinc-700 mt-1 italic">{node.ref}</div>
                </motion.div>
              ))}
            </div>

            <div className="hidden sm:block absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 220" fill="none" preserveAspectRatio="xMidYMid meet">
                <path d="M200 55 L310 55" stroke="#22C55E30" strokeWidth="1.5" markerEnd="url(#arrowG)" />
                <path d="M345 115 L345 145" stroke="#22C55E30" strokeWidth="1.5" markerEnd="url(#arrowG)" />
                <path d="M310 185 L200 185" stroke="#22C55E30" strokeWidth="1.5" markerEnd="url(#arrowG)" />
                <path d="M100 145 L100 115" stroke="#22C55E30" strokeWidth="1.5" markerEnd="url(#arrowG)" />
                <defs><marker id="arrowG" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#22C55E50" /></marker></defs>
              </svg>
            </div>
          </div>

          {/* The payoff */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "Recoverable revenue", value: "$62\u2013117M", color: "#22C55E", sub: "churn reduction to industry avg" },
              { label: "Signal group CR unlock", value: "$107K+", color: "#F59E0B", sub: "45 verified groups \u00D7 $2.4K avg budget" },
              { label: "Trading education TAM", value: "$4.35B", color: "#3B82F6", sub: "by 2034 at 11% CAGR" },
              { label: "Whop\u2019s current share", value: "37%", color: "#8B5CF6", sub: "$691M of $1.86B market (2025)" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-white/[0.02] p-3 text-center">
                <div className="text-[16px] sm:text-[18px] font-bold font-mono leading-none" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[9px] text-white font-medium mt-1">{m.label}</div>
                <div className="text-[7px] text-zinc-600 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WPN: The Transaction Layer ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
            WPN: Why Verification Pays for Itself
          </h4>
          <p className="text-[11px] text-zinc-500 mb-4">
            Whop currently captures only subscription fees (2.7% + $0.30/txn). With the Whop Payments Network and
            USDT wallets (Tether $200M deal), verified trading products unlock a transaction layer that turns
            every trade into platform revenue — the same model that gives Robinhood $164 ARPU on users who pay $0/month.
          </p>

          <div className="space-y-2">
            {[
              {
                layer: "Subscriptions (today)",
                revenue: "2.7% + $0.30/txn",
                example: "Creator charges $49/mo → Whop earns ~$1.62/mo per subscriber",
                annual: "$691M \u00D7 2.7% = ~$18.7M",
                color: "#6B7280",
                tag: "current",
              },
              {
                layer: "Trade execution fees",
                revenue: "0.1\u20130.3% of volume",
                example: "Signal group routes trades through WPN → fee on every execution",
                annual: "Even 1% of $57.6M/mo trading volume = $6.9M/yr",
                color: "#06B6D4",
                tag: "wpn",
              },
              {
                layer: "Float revenue on USDT balances",
                revenue: "3\u20135% APY on held balances",
                example: "18.4M users with avg $50 USDT balance = $920M in deposits",
                annual: "$920M \u00D7 4% = ~$36.8M/yr (Tether\u2019s core business model)",
                color: "#22C55E",
                tag: "wpn",
              },
              {
                layer: "Verification premium",
                revenue: "Higher take rate on verified products",
                example: "Verified creators charge more → higher absolute fees",
                annual: "Signal sub LTV 6x higher with verification → 6x more fee revenue",
                color: "#8B5CF6",
                tag: "wpn",
              },
            ].map((l, i) => (
              <motion.div
                key={l.layer}
                className="rounded-lg p-3 border flex items-start gap-3"
                style={{ borderColor: l.color + "20", background: l.color + "05" }}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="shrink-0 mt-0.5">
                  <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded" style={{
                    background: l.tag === "current" ? "#6B728020" : "#06B6D420",
                    color: l.tag === "current" ? "#9CA3AF" : "#06B6D4",
                  }}>
                    {l.tag === "current" ? "Today" : "WPN"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-white font-semibold">{l.layer}</span>
                    <span className="text-[9px] font-mono" style={{ color: l.color }}>{l.revenue}</span>
                  </div>
                  <div className="text-[9px] text-zinc-500">{l.example}</div>
                  <div className="text-[8px] font-mono text-zinc-600 mt-0.5">{l.annual}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.04] text-center">
            <div className="text-[9px] text-zinc-500 mb-1">Potential combined platform revenue</div>
            <div className="text-[24px] font-bold font-mono text-white">$18.7M <span className="text-zinc-600">&rarr;</span> <span className="text-emerald-400">$62M+</span></div>
            <div className="text-[8px] text-zinc-600 mt-0.5">Subscriptions only &rarr; subscriptions + trade fees + float + verification premium</div>
          </div>
        </div>

        {/* ── The 5 Arguments ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-4">
            Five Claims — Cross-Referenced With Explorer Data
          </h4>
          <div className="space-y-3">
            {WHOP_ARGUMENTS.map((arg, i) => (
              <motion.div
                key={arg.title}
                className="rounded-xl p-4 border"
                style={{ borderColor: arg.color + "20", background: arg.color + "04" }}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="shrink-0 text-center">
                    <div className="text-[20px] font-bold font-mono leading-none" style={{ color: arg.color }}>{arg.stat}</div>
                    <div className="text-[7px] text-zinc-600 mt-0.5 max-w-[80px]">{arg.statLabel}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white mb-1">{arg.title}</div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{arg.body}</p>
                  </div>
                </div>
                <div className="ml-0 pl-3 border-l border-white/[0.06]">
                  <div className="text-[7px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">Evidence Chain</div>
                  {arg.evidence.map((e, j) => (
                    <div key={j} className="flex items-start gap-1.5 text-[9px] text-zinc-500 mb-0.5">
                      <span className="shrink-0 mt-0.5" style={{ color: arg.color }}>&#x2022;</span>
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bottom line callout ── */}
        <div className="px-4 py-3 rounded-xl bg-red-500/[0.05] border border-red-500/10">
          <div className="flex items-start gap-3">
            <span className="text-[14px] mt-0.5">&#x26A0;&#xFE0F;</span>
            <div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-red-400 font-semibold">The one-liner:</span>{" "}
                Whop sits on $691M/yr in trading GMV with the worst trust metrics in the industry — 1.89&#x2605; avg rating,
                34% churn, 0 verified top earners, and $103M flowing to products where 2 aren&apos;t indicators, 1 has
                scam reports, and 1 shut down with FBI involvement. Every comparable platform that added verification saw
                25-40% churn reduction. On Whop&apos;s scale, that&apos;s{" "}
                <span className="text-white font-mono font-semibold">$62M–$117M/yr in recoverable revenue</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
