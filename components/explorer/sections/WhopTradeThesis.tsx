"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

// ── Sub-components ────────────────────────────────────────────────────────────

function FlowArrow({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex justify-center py-1">
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <line x1="8" y1="0" x2="8" y2="18" stroke="#3F3F46" strokeWidth="1.5" />
          <path d="M4 14 L8 20 L12 14" stroke="#3F3F46" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex items-center px-1">
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
        <line x1="0" y1="8" x2="18" y2="8" stroke="#3F3F46" strokeWidth="1.5" />
        <path d="M14 4 L20 8 L14 12" stroke="#3F3F46" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface ArchBoxProps {
  label: string;
  sublabel?: string;
  color: string;
  tag?: string;
  tagColor?: string;
  delay?: number;
}

function ArchBox({ label, sublabel, color, tag, tagColor = "#6B7280", delay = 0 }: ArchBoxProps) {
  return (
    <motion.div
      className="rounded-xl px-3 py-2.5 border text-center min-w-0"
      style={{ borderColor: color + "30", background: color + "08" }}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      {tag && (
        <div className="text-[7px] font-bold uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded inline-block" style={{ background: tagColor + "20", color: tagColor }}>
          {tag}
        </div>
      )}
      <div className="text-[10px] font-semibold" style={{ color }}>{label}</div>
      {sublabel && <div className="text-[8px] text-zinc-600 mt-0.5">{sublabel}</div>}
    </motion.div>
  );
}

export function WhopTradeThesis() {
  return (
    <FadeInSection>
      <div id="whop-trade-thesis" className="scroll-mt-24">
        <SectionHeader
          number="26"
          title="The Thesis: Whop × Aptos"
          subtitle="How on-chain infrastructure turns 639 unverifiable indicator products into a verified trading marketplace"
        />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          Every problem in the Whop trading economy has the same root cause: no accountability layer.
          97.5% of indicators claim AI with no proof. 457 signal groups operate with zero performance history.
          $103M flows to the top 4 products — 2 of which aren&apos;t actual indicators at all.
          The fix is a single on-chain attribution chain from indicator → signal → trade → verified P&amp;L.
        </p>

        {/* ── ARCHITECTURE FLOW DIAGRAM ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-4">
            System Architecture: Whop Trade on Aptos
          </h4>

          {/* Row 1: Data sources */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            <ArchBox label="Pyth Oracle" sublabel="price feeds + backtest data" color="#8B5CF6" tag="Data Layer" tagColor="#8B5CF6" delay={0} />
            <ArchBox label="Whop Marketplace" sublabel="639 indicators, 457 signal groups" color="#FA4616" tag="Existing" tagColor="#FA4616" delay={0.05} />
            <ArchBox label="Decibel Perps" sublabel="BTC/ETH/APT orderbook" color="#06B6D4" tag="Existing" tagColor="#06B6D4" delay={0.1} />
          </div>

          {/* Arrows down */}
          <div className="grid grid-cols-3 gap-2">
            <FlowArrow vertical />
            <FlowArrow vertical />
            <FlowArrow vertical />
          </div>

          {/* Row 2: Core new infrastructure */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            <ArchBox
              label="Indicator Launchpad"
              sublabel="PineScript → Move, Monte Carlo backtest, bonding curve"
              color="#8B5CF6" tag="Build" tagColor="#22C55E" delay={0.15}
            />
            <ArchBox
              label="Signal Registry"
              sublabel="on-chain timestamps, attributed entry/exit, signal history"
              color="#FA4616" tag="Build" tagColor="#22C55E" delay={0.2}
            />
            <ArchBox
              label="Whop Trade UI"
              sublabel="order book frontend, Decibel execution layer"
              color="#06B6D4" tag="Build" tagColor="#22C55E" delay={0.25}
            />
          </div>

          {/* Arrows converging */}
          <div className="flex justify-center py-1">
            <svg width="280" height="28" viewBox="0 0 280 28" fill="none">
              <line x1="47" y1="0" x2="140" y2="22" stroke="#3F3F46" strokeWidth="1.5" />
              <line x1="140" y1="0" x2="140" y2="22" stroke="#3F3F46" strokeWidth="1.5" />
              <line x1="233" y1="0" x2="140" y2="22" stroke="#3F3F46" strokeWidth="1.5" />
              <path d="M136 18 L140 26 L144 18" stroke="#3F3F46" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Row 3: Attribution engine */}
          <div className="mb-1">
            <ArchBox
              label="Trading Attribution Engine"
              sublabel="indicator → signal → trade → P&L — fully on-chain, Shelby blob proofs"
              color="#22C55E" tag="Core Innovation" tagColor="#22C55E" delay={0.3}
            />
          </div>

          <FlowArrow vertical />

          {/* Row 4: Outputs */}
          <div className="grid grid-cols-3 gap-2">
            <ArchBox label="Verified Leaderboard" sublabel="real Sharpe ratios, not marketing copy" color="#F59E0B" tag="Output" tagColor="#F59E0B" delay={0.35} />
            <ArchBox label="Content Rewards" sublabel="signal groups with track records → CR campaigns" color="#EF4444" tag="Output" tagColor="#EF4444" delay={0.4} />
            <ArchBox label="Revenue Share" sublabel="indicator fees + trade fees + attribution premium" color="#10B981" tag="Output" tagColor="#10B981" delay={0.45} />
          </div>
        </div>

        {/* ── THE CURRENT GAP → OPPORTUNITY MAP ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            Current Gap → On-chain Fix
          </h4>
          <div className="space-y-2">
            {[
              {
                gap: "97.5% claim AI — 0% can prove it",
                fix: "Indicator Launchpad: Pyth-powered Monte Carlo backtest → robustness score on-chain",
                gapColor: "#EF4444", fixColor: "#22C55E",
                data: "639 products, 21 have backtest data (3.3%)",
              },
              {
                gap: "457 signal groups, 0 CR campaigns, 0 performance records",
                fix: "Signal Registry: on-chain timestamps prove entry/exit before outcome",
                gapColor: "#F59E0B", fixColor: "#22C55E",
                data: "391K members, $0 in content rewards spend",
              },
              {
                gap: "Copy trading ($27.2M Alertsify) with 'account got wiped' scam reports",
                fix: "Whop Trade: copy-trade through Decibel — trades visible on-chain, P&L verifiable",
                gapColor: "#EF4444", fixColor: "#22C55E",
                data: "Reddit r/BadBiz: dashboard showed profit while account was wiped",
              },
              {
                gap: "Top revenue products are coaching disguised as indicators ($5K price point)",
                fix: "Verified performance → real indicators command premium pricing organically",
                gapColor: "#F97316", fixColor: "#22C55E",
                data: "MomenumX $33.4M, Trader Motif $18.4M — no platform, no automation",
              },
              {
                gap: "67% of creators show zero post-purchase engagement signals",
                fix: "Keeper bots: indicators auto-update signals, creators never go dark",
                gapColor: "#6B7280", fixColor: "#22C55E",
                data: "Only 7% post regular updates, only 4% have 24/7 support",
              },
            ].map((row, i) => (
              <motion.div
                key={i}
                className="rounded-xl bg-white/[0.02] p-3"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-[9px] font-bold shrink-0 w-8" style={{ color: row.gapColor }}>GAP</span>
                  <span className="text-[10px] font-medium text-white">{row.gap}</span>
                </div>
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-[9px] font-bold shrink-0 w-8" style={{ color: row.fixColor }}>FIX</span>
                  <span className="text-[10px] text-zinc-400">{row.fix}</span>
                </div>
                <div className="text-[8px] text-zinc-600 italic ml-10">{row.data}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── MARKET FOCUS: WHERE TO AIM FIRST ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            Where Whop Should Focus: Market Prioritization
          </h4>
          <div className="space-y-3">
            {[
              {
                rank: 1,
                audience: "Crypto Traders",
                why: "27% of indicator audience. Already on Aptos/DeFi mental model. Alertsify scandal makes them want accountability.",
                opportunity: "57 CR campaigns — 26.5% spend rate (worst). Attribution fixes this entirely.",
                size: "57 campaigns, $162K budget, 5,426 creators",
                color: "#3B82F6",
                priority: "highest",
              },
              {
                rank: 2,
                audience: "Signal Group Members",
                why: "457 groups, 391K members, ZERO CR campaigns. Biggest gap on the platform.",
                opportunity: "On-chain signal timestamps + track record → unlock $0 → $200K+ in CR campaigns",
                size: "391K members, $0 content rewards",
                color: "#F59E0B",
                priority: "highest",
              },
              {
                rank: 3,
                audience: "Options / Futures Traders",
                why: "Options 18%, Futures 13% of top indicator products. Decibel perps are a natural fit.",
                opportunity: "Whop Trade as the UI for on-chain perps — options/futures traders know order books.",
                size: "89 options + 97 futures indicator products",
                color: "#EF4444",
                priority: "high",
              },
              {
                rank: 4,
                audience: "Indicator Creators ($997+ tier)",
                why: "22 products over $1K, all claim AI. None have backtest data. Buyers are angry.",
                opportunity: "Launchpad graduation = the new $997 product. Legitimate premium with proof.",
                size: "$100M+ revenue at risk from scandal",
                color: "#8B5CF6",
                priority: "medium",
              },
            ].map((m, i) => (
              <motion.div
                key={m.rank}
                className="rounded-xl p-3 border"
                style={{ borderColor: m.color + "20", background: m.color + "05" }}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: m.color + "20", color: m.color }}>
                    {m.rank}
                  </div>
                  <span className="text-[12px] font-bold text-white">{m.audience}</span>
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold ml-auto" style={{ background: m.priority === "highest" ? "#22C55E20" : m.priority === "high" ? "#F59E0B20" : "#6B728020", color: m.priority === "highest" ? "#22C55E" : m.priority === "high" ? "#F59E0B" : "#9CA3AF" }}>
                    {m.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 mb-1">{m.why}</div>
                <div className="text-[10px] font-medium mb-1" style={{ color: m.color }}>{m.opportunity}</div>
                <div className="text-[8px] text-zinc-600 italic">{m.size}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── REVENUE MODEL ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            Whop Revenue Stack: How Each Layer Pays
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { stream: "Indicator Subscriptions", model: "% of $40–$5K/mo per product", color: "#8B5CF6", note: "Already captured — $100M+ market" },
              { stream: "Trade Execution Fees", model: "% of perp volume via Decibel", color: "#06B6D4", note: "New: Whop Trade routes through Decibel" },
              { stream: "Attribution Premium", model: "verified perf → higher prices", color: "#22C55E", note: "ORB Premium: 3yr verified data, charges more" },
              { stream: "CR Amplification", model: "signal groups → CR campaigns", color: "#EF4444", note: "0 → $200K+ in CR budgets unlocked" },
            ].map((r) => (
              <div key={r.stream} className="rounded-xl bg-white/[0.02] p-3 text-center">
                <div className="text-[8px] font-bold uppercase tracking-wider mb-1" style={{ color: r.color }}>{r.stream}</div>
                <div className="text-[10px] text-white font-medium mb-1">{r.model}</div>
                <div className="text-[8px] text-zinc-600 italic">{r.note}</div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 rounded-lg bg-white/[0.02] text-center">
            <p className="text-[9px] text-zinc-500">
              <span className="text-white font-semibold">The compounding flywheel:</span>{" "}
              Verified indicators → more signal group CR campaigns → more creators → more signal subscribers →
              more Whop Trade volume → more fee revenue → more creator incentive to verify indicators.
            </p>
          </div>
        </div>

        {/* ── WHAT NEEDS TO BE BUILT ── */}
        <div className="surface-1 rounded-[16px] p-5 mb-4">
          <h4 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Build Sequence</h4>
          <div className="space-y-2">
            {[
              {
                phase: "Phase 1", label: "Indicator Launchpad (exists on branch claude/pyth-chainlink-speed-comparison)",
                items: ["PineScript → Move transpiler", "Pyth Monte Carlo backtest engine (4 indicators verified)", "Bonding curve funding + graduation thresholds", "On-chain robustness score (Sharpe + profitable% + coverage)"],
                status: "built", color: "#22C55E",
              },
              {
                phase: "Phase 2", label: "Whop Trade: Decibel Order Book UI",
                items: ["Order book frontend wired to Decibel perps", "Indicator → signal → trade attribution tracking", "Copy-trade: follow any graduated indicator auto-execute", "P&L dashboard: verified on-chain, Shelby blob proofs"],
                status: "design", color: "#3B82F6",
              },
              {
                phase: "Phase 3", label: "Signal Registry + CR Integration",
                items: ["On-chain signal timestamps (entry/exit before market moves)", "Signal group Whop products → registry opt-in", "Track record → unlock Content Rewards campaign creation", "CR auto-budget based on verified 90-day signal accuracy"],
                status: "roadmap", color: "#F59E0B",
              },
              {
                phase: "Phase 4", label: "Attribution → Verified Leaderboard",
                items: ["Real Sharpe ratios from live Whop Trade data", "Creator leaderboard: verified P&L, not marketing copy", "Dispute resolution: Shelby evidence packs for signal disputes", "Premium placement for graduated (verified) indicators"],
                status: "roadmap", color: "#8B5CF6",
              },
            ].map((p, i) => (
              <motion.div
                key={p.phase}
                className="rounded-xl p-3 border"
                style={{ borderColor: p.color + "20", background: p.color + "04" }}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: p.color + "20", color: p.color }}>{p.phase}</span>
                  <span className="text-[10px] text-white font-medium flex-1">{p.label}</span>
                  <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{
                    background: p.status === "built" ? "#22C55E20" : p.status === "design" ? "#3B82F620" : "#F59E0B20",
                    color: p.status === "built" ? "#22C55E" : p.status === "design" ? "#3B82F6" : "#F59E0B",
                  }}>
                    {p.status === "built" ? "✓ Built" : p.status === "design" ? "In Design" : "Roadmap"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  {p.items.map((item) => (
                    <div key={item} className="flex items-start gap-1.5 text-[9px] text-zinc-500">
                      <span className="shrink-0 mt-0.5" style={{ color: p.color }}>›</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── PUNCHLINE CALLOUT ── */}
        <div className="rounded-2xl p-px bg-gradient-to-r from-[#FA4616]/30 via-[#8B5CF6]/20 to-[#06B6D4]/30 mb-2">
          <div className="rounded-2xl bg-[var(--background)] px-5 py-5">
            <div className="text-center mb-4">
              <div className="text-[13px] font-bold text-white mb-1">The One-Line Pitch to Whop</div>
              <p className="text-[12px] text-zinc-400 leading-relaxed max-w-lg mx-auto">
                &quot;Every indicator on your platform claims to be profitable. None can prove it.
                We built the infrastructure to change that — and it turns your 457 dead signal groups
                into a verified trading marketplace that pays creators, generates trade fees,
                and runs Content Rewards campaigns automatically.&quot;
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center px-2 py-2 rounded-xl bg-white/[0.03]">
                <div className="text-[18px] font-bold font-mono text-[#FA4616]">639</div>
                <div className="text-[8px] text-zinc-600">unverified indicators → launchpad candidates</div>
              </div>
              <div className="text-center px-2 py-2 rounded-xl bg-white/[0.03]">
                <div className="text-[18px] font-bold font-mono text-[#8B5CF6]">391K</div>
                <div className="text-[8px] text-zinc-600">signal group members → Whop Trade users</div>
              </div>
              <div className="text-center px-2 py-2 rounded-xl bg-white/[0.03]">
                <div className="text-[18px] font-bold font-mono text-[#06B6D4]">$0</div>
                <div className="text-[8px] text-zinc-600">CR campaigns for signals today → unlock with attribution</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
