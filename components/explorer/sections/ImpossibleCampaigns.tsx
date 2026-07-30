"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { IMPOSSIBLE_CAMPAIGNS } from "../constants";
import type { StatsData } from "../types";

export function ImpossibleCampaigns({ stats }: { stats: StatsData }) {
  const s = stats;

  return (
    <FadeInSection>
      <div id="impossible" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="15" title="Impossible Campaigns We Found" subtitle="17 campaigns that are mathematically unwinnable for creators" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
          We identified 17 campaign configurations across {s.totals.campaigns.toLocaleString()} total campaigns where the math simply does not work.
          Creators who join these campaigns are guaranteed to lose time.
        </p>

        <div className="space-y-2 mb-5">
          {IMPOSSIBLE_CAMPAIGNS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="px-4 py-3 rounded-xl bg-white/[0.02] border-l-3 transition-colors"
              style={{ borderLeft: `3px solid ${c.color}60` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-white">{c.pattern}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                    style={{ backgroundColor: c.color + "15", color: c.color }}
                  >
                    {c.count} found
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">{c.detail}</p>
              <p className="text-[9px] text-zinc-600 font-mono mt-1">Example: {c.example}</p>
            </motion.div>
          ))}
        </div>

        {/* Campaign Health Check concept */}
        <div className="px-4 py-4 rounded-xl bg-[#FA4616]/[0.04] border border-[#FA4616]/[0.1]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[#FA4616]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-[11px] font-bold text-[#FA4616]">Campaign Health Check</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            On Shelby Content Rewards, these campaigns would be flagged <span className="text-[#FA4616] font-semibold">before launch</span>.
            Our system analyzes {s.totals.campaigns.toLocaleString()} historical campaigns to predict success probability.
            Impossible configurations are rejected at creation time, saving creators from wasted effort
            and brands from empty campaigns.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
