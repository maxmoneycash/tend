"use client";

import { FadeInSection, SectionHeader, HeroPill } from "../shared";
import { fmtDollar, fmtCompact } from "../helpers";
import type { StatsData } from "../types";

interface Props {
  stats: StatsData;
}

export function CROverview({ stats: s }: Props) {
  return (
    <FadeInSection>
      <div id="cr-overview" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="06" title="Content Rewards at a Glance" subtitle="Campaign-level metrics across all live CR campaigns" />

        <div className="text-center mb-6">
          <div className="text-[48px] sm:text-[64px] font-black text-red-400 font-mono leading-none tracking-tight">
            {fmtDollar(s.totals.remaining_usd)}
          </div>
          <div className="text-[14px] text-zinc-400 mt-2">in campaign budgets sitting unspent</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
          <HeroPill value={s.totals.campaigns.toString()} label="live campaigns" />
          <HeroPill value={fmtDollar(s.totals.budget_usd)} label="total budget" accent />
          <HeroPill value={fmtDollar(s.totals.spent_usd)} label="spent so far" />
          <HeroPill value={fmtCompact(s.totals.creators)} label="creators" />
          <HeroPill value={"$" + s.economics.median_creator_earnings.toFixed(0)} label="median earnings" />
        </div>

        <p className="text-[12px] text-zinc-500 leading-relaxed text-center max-w-lg mx-auto">
          We analyzed {s.totals.campaigns.toLocaleString()} currently live content rewards campaigns.
          Content Rewards claims $13M+ in lifetime payouts — we can independently verify {fmtDollar(s.totals.spent_usd)} across active campaigns.
          {s.totals.pct_unspent.toFixed(0)}% of total budget remains unspent.
        </p>
      </div>
    </FadeInSection>
  );
}
