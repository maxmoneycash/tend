"use client";

import { FadeInSection, SectionHeader } from "../shared";

export function ManualProblem() {
  return (
    <FadeInSection>
      <div id="manual-problem" className="scroll-mt-24">
        <SectionHeader number="20" title="The Manual Evaluation Problem" subtitle="Why manual review is the bottleneck killing content rewards" />

        {/* Time kills campaigns */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Time Kills Campaigns</span>
          </div>

          <div className="space-y-2">
            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-zinc-400">48-hour auto-approve window</span>
                <span className="text-[10px] text-red-400 font-mono font-bold">BROKEN</span>
              </div>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Brands either rush-approve (accepting low quality) or ignore submissions entirely (causing creator frustration).
                There is no middle ground in a time-pressure system.
              </p>
            </div>

            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-zinc-400">33.4% of campaigns have $0 spent</span>
                <span className="text-[10px] text-red-400 font-mono font-bold">140 CAMPAIGNS</span>
              </div>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Brands create campaigns but never review submissions. Creators submit clips into a void.
                $371K in budget allocated to campaigns where no one is reviewing.
              </p>
            </div>

            <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-zinc-400">Approval rate drops with complexity</span>
                <span className="text-[10px] text-yellow-400 font-mono font-bold">61.5% to 38.5%</span>
              </div>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Simple campaigns (0 requirements): 61.5% approval. Complex campaigns (3+ requirements): 38.5%.
                Stricter requirements mean more subjective manual rejections.
              </p>
            </div>
          </div>
        </div>

        {/* The Rejection Black Box */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider">The Rejection Black Box</span>
          </div>

          {/* Current flow */}
          <div className="px-4 py-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] mb-2">
            <div className="text-[9px] text-red-400 font-semibold uppercase tracking-wider mb-2">Today</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-300 font-mono">Creator submits clip</span>
                <span className="text-zinc-700">{"-->"}</span>
                <span className="text-[10px] text-zinc-500 font-mono">48 hours pass</span>
                <span className="text-zinc-700">{"-->"}</span>
                <span className="text-[10px] text-red-400 font-mono font-bold">Rejected</span>
              </div>
              <div className="flex items-center gap-4 pl-4">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <span className="text-[9px] text-zinc-600">No reason given</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <span className="text-[9px] text-zinc-600">No evidence provided</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <span className="text-[9px] text-zinc-600">No appeal process</span>
                </div>
              </div>
            </div>
          </div>

          {/* What it should look like */}
          <div className="px-4 py-3 rounded-xl bg-green-500/[0.04] border border-green-500/[0.08]">
            <div className="text-[9px] text-green-400 font-semibold uppercase tracking-wider mb-2">With Shelby Evidence</div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-zinc-300 font-mono">Creator submits</span>
                <span className="text-zinc-700">{"-->"}</span>
                <span className="text-[10px] text-green-400 font-mono">Oracle verifies 508K views</span>
                <span className="text-zinc-700">{"-->"}</span>
                <span className="text-[10px] text-green-400 font-mono">Bot score: 0.12</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-4">
                <span className="text-zinc-700">{"-->"}</span>
                <span className="text-[10px] text-green-400 font-mono">Auto-approve if metrics pass</span>
                <span className="text-zinc-700">{"-->"}</span>
                <span className="text-[10px] text-green-400 font-mono font-bold">Payout on-chain</span>
              </div>
              <div className="flex items-center gap-4 pl-4 mt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  <span className="text-[9px] text-zinc-500">Full evidence pack on Shelby</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  <span className="text-[9px] text-zinc-500">Merkle-chained proof</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dispute signal stats */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">What Disputes Tell Us</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[18px] font-bold text-red-400 font-mono">63%</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">of genuine disputes mention &quot;banned&quot;</div>
              <div className="text-[9px] text-zinc-700 mt-0.5">Bans without proof are the #1 trigger</div>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[18px] font-bold text-red-400 font-mono">81.5%</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">mention payout issues</div>
              <div className="text-[9px] text-zinc-700 mt-0.5">Payment disputes with no evidence trail</div>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[18px] font-bold text-yellow-400 font-mono">44.4%</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">mention payout rules</div>
              <div className="text-[9px] text-zinc-700 mt-0.5">Unclear how payouts are calculated</div>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[18px] font-bold text-yellow-400 font-mono">33.3%</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">mention approval process</div>
              <div className="text-[9px] text-zinc-700 mt-0.5">Opaque review system with no transparency</div>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
