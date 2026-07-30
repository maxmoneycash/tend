"use client";

import { FadeInSection, SectionHeader, InsightCard } from "../shared";

export function Economics() {
  return (
    <FadeInSection>
      <div id="economics" className="scroll-mt-24">
        <SectionHeader number="11" title="The Economics" subtitle="Key numbers from $1.12M in campaign budgets" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Gini — spans 2 columns */}
          <div className="sm:col-span-2 px-5 py-4 rounded-2xl bg-yellow-500/[0.04] border border-yellow-500/[0.12] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500/60 via-yellow-500/40 to-yellow-500/20" />
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[32px] font-black text-yellow-400 font-mono">0.64</span>
              <div>
                <div className="text-[13px] font-bold text-white">Gini Coefficient</div>
                <div className="text-[11px] text-zinc-500">Extreme budget inequality</div>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Top 10% of campaigns control 52% of total budget. Bottom 50% control just 10.8%.
            </p>
          </div>

          {/* Micro campaigns — red accent bar on top */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-500/30" />
            <div className="text-[12px] font-bold text-white mb-1 mt-1">Micro campaigns (&lt;$500)</div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">90% are dead on arrival. Only 0% of sub-$500 campaigns fully spend their budget. You need at least $1K to play.</p>
          </div>

          <InsightCard
            headline="Sweet spot: $0.50-$1.00 CPM"
            body="Campaigns in this range have the best creator attraction. $1 median CPM across all platforms. Higher CPM has diminishing returns."
            accent="#10B981"
          />
          <InsightCard
            headline="$5-$10 CPM = dead zone"
            body="High CPM campaigns attract fewer creators. Budget size correlates with success (r=0.18), but CPM barely does (r=0.06)."
            accent="#EF4444"
          />
          <InsightCard
            headline="No creator ceiling found"
            body="More creators = more spend (r=0.478 log-scale). Campaigns with 500+ creators average 63% spend rate. There is no saturation point."
            accent="#3B82F6"
          />
          <InsightCard
            headline="Music: most competitive"
            body="Music campaigns have the lowest CPM ($1/1K median) but the most engaged creator base. 69 music campaigns, $107K total budget."
            accent="#8B5CF6"
          />
        </div>
      </div>
    </FadeInSection>
  );
}
