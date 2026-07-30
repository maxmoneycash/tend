"use client";

import { FadeInSection, SectionHeader, ComparisonRow } from "../shared";

export function ManualVsAuto() {
  return (
    <FadeInSection>
      <div id="manual-vs-auto" className="scroll-mt-24">
        <SectionHeader number="22" title="Manual vs Automated: The Numbers" subtitle="Side-by-side comparison using real data from our analysis" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LEFT: Content Rewards Today — red tinted, deprecated feel */}
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_10px,rgba(239,68,68,0.02)_10px,rgba(239,68,68,0.02)_20px)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[12px] font-semibold text-red-400">Content Rewards Today</span>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-red-500/15 text-red-400 uppercase tracking-wider">Manual</span>
              </div>
              <div className="space-y-3">
                <ComparisonRow label="Approval rate" value="39.9%" bad />
                <ComparisonRow label="Disputes mentioning bans" value="63%" bad />
                <ComparisonRow label="Campaigns with $0 spent" value="33.4%" bad />
                <ComparisonRow label="Time to first payout" value="Hours to days" bad />
                <ComparisonRow label="Evidence on rejection" value="None" bad />
                <ComparisonRow label="Creator trust" value="Declining (3x disputes)" bad />
              </div>
            </div>
          </div>

          {/* RIGHT: With Shelby Evidence — green tinted, new badge */}
          <div className="rounded-2xl border border-green-500/25 bg-green-500/[0.04] p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-green-500/20 text-green-400 uppercase tracking-wider border border-green-500/20">
                New
              </span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[12px] font-semibold text-green-400">With Shelby Evidence</span>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-green-500/15 text-green-400 uppercase tracking-wider">Automated</span>
              </div>
              <div className="space-y-3">
                <ComparisonRow label="Approval rate" value="Auto if metrics pass" />
                <ComparisonRow label="Disputes" value="Resolved with on-chain proof" />
                <ComparisonRow label="Campaigns with $0" value="Impossible (auto-eval)" />
                <ComparisonRow label="Time to first payout" value="Minutes (oracle-triggered)" />
                <ComparisonRow label="Evidence on every decision" value="Merkle-chained pack" />
                <ComparisonRow label="Creator trust" value="Verifiable (transparent)" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <span className="text-white font-semibold">The core shift:</span> Manual evaluation creates adversarial dynamics &mdash;
            creators vs. brands, with the platform caught in the middle. Automated evidence removes the adversary.
            When every decision is backed by verifiable data, disputes become resolvable instead of escalating.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
