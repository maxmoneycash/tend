"use client";

import { FadeInSection, HeroPill } from "../shared";
import { fmtDollar } from "../helpers";
import type { StatsData } from "../types";

interface Props {
  stats: StatsData;
}

export function HeroSection({ stats: s }: Props) {
  return (
    <FadeInSection>
      <div id="hero" className="scroll-mt-24 -mx-4 sm:-mx-8 md:-mx-16 lg:-mx-24 relative overflow-hidden">
        <div className="relative px-4 sm:px-8 md:px-16 lg:px-24 py-16 sm:py-20 text-center">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.04] via-transparent to-[#FA4616]/[0.04]" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-[10px] font-semibold text-[#FA4616] uppercase tracking-[0.25em]">
                Research Report
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="text-[9px] text-green-400 font-semibold uppercase tracking-wider">Live Data</span>
              </span>
            </div>

            <h1 className="text-[42px] sm:text-[56px] font-bold tracking-tight leading-none mb-2">
              <span className="text-white relative">
                Inside a $1.3B/yr Marketplace
              </span>
              <span className="text-zinc-300 block text-[20px] sm:text-[26px] font-medium mt-2">
                where every top earner is dying
              </span>
            </h1>

            <p className="text-[13px] sm:text-[14px] text-zinc-500 mt-5 max-w-lg mx-auto leading-relaxed">
              85,454 products. $108M/month in GMV. 24 categories. We mapped the entire Whop marketplace economy
              and cross-referenced it with {s.totals.campaigns.toLocaleString()} live Content Rewards campaigns totaling {fmtDollar(s.totals.budget_usd)} in budgets.
              What we found changes everything.
            </p>

            {/* Stat pills — larger and more spaced */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
              <HeroPill value="85,454" label="products" />
              <HeroPill value="$108M" label="monthly GMV" accent />
              <HeroPill value="24" label="categories" />
              <HeroPill value={s.totals.campaigns.toString()} label="CR campaigns tracked" />
            </div>

            {/* Market context callout */}
            <div className="mt-6 mx-auto max-w-md px-4 py-3 rounded-xl bg-white/[0.03] border border-zinc-800">
              <div className="flex items-start gap-3">
                <span className="text-[14px] mt-0.5">📊</span>
                <div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    <span className="text-white font-semibold">Marketplace data:</span>{" "}
                    85,454 products, $108M/month GMV, 27,083 trading products alone.
                    We track {s.totals.campaigns} live CR campaigns. Content Rewards is a small slice of a massive marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom fade to main bg */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />
      </div>
    </FadeInSection>
  );
}
