"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";

export function WhitepaperReality() {
  return (
    <FadeInSection>
      <div id="whitepaper" className="scroll-mt-24">
        <SectionHeader number="23" title="Whitepaper vs Reality: 25 Hypotheses Tested" subtitle="We tested 25 claims from our whitepaper against 429 real campaigns" />

        {/* Verdict summary line */}
        <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
          <span className="text-green-400 font-semibold">8 confirmed</span>,{" "}
          <span className="text-yellow-400 font-semibold">9 partially confirmed</span>,{" "}
          <span className="text-red-400 font-semibold">6 challenged</span>,{" "}
          <span className="text-zinc-400 font-semibold">2 need more data</span>
        </p>

        {/* Verdict bar — thick with rounded segments */}
        <div className="mb-8">
          <div className="w-full h-5 rounded-full overflow-hidden flex gap-0.5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(8 / 25) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-full bg-green-500/60 rounded-l-full"
              title="8 Confirmed"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(9 / 25) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full bg-yellow-500/60"
              title="9 Partially Confirmed"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(6 / 25) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full bg-red-500/60"
              title="6 Challenged"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(2 / 25) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-full bg-zinc-600/60 rounded-r-full"
              title="2 Needs More Data"
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500/60" />
              <span className="text-[9px] text-zinc-500">Confirmed (8)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500/60" />
              <span className="text-[9px] text-zinc-500">Partial (9)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/60" />
              <span className="text-[9px] text-zinc-500">Challenged (6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600/60" />
              <span className="text-[9px] text-zinc-500">Needs Data (2)</span>
            </div>
          </div>
        </div>

        {/* 6 Critical Findings — 2-column grid with varying heights */}
        <div className="text-[11px] text-zinc-600 uppercase tracking-wider mb-3 font-semibold">
          6 Critical Findings
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Finding 01 */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                01
              </span>
              <span className="text-[11px] text-white font-semibold">Implicit Requirements Trigger the Cliff</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 pl-7">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-500/10 text-green-400 uppercase tracking-wider">
                Confirmed
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed pl-7">
              Every Shelby campaign starts at 2-3 requirements before brands add anything &mdash; instant cliff zone.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Impact:</span>
              <span className="text-[10px] text-red-400 font-mono font-bold">-79.5% submissions</span>
            </div>
          </div>

          {/* Finding 02 */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                02
              </span>
              <span className="text-[11px] text-white font-semibold">50/50 CPM Blend Kills Participation</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 pl-7">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 uppercase tracking-wider">
                Challenged
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed pl-7">
              Quality-weighted CPM reduces earnings for legitimate creators.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Impact:</span>
              <span className="text-[10px] text-red-400 font-mono font-bold">-86.7% conversion on quality requirements</span>
            </div>
          </div>

          {/* Finding 03 */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                03
              </span>
              <span className="text-[11px] text-white font-semibold">$654K in Dead Escrow</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 pl-7">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-500/10 text-green-400 uppercase tracking-wider">
                Confirmed
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed pl-7">
              No sunset mechanism for stale campaigns.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Impact:</span>
              <span className="text-[10px] text-red-400 font-mono font-bold">58.7% of market budget wasted</span>
            </div>
          </div>

          {/* Finding 04 */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                04
              </span>
              <span className="text-[11px] text-white font-semibold">Evidence Chain Has a Bug</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 pl-7">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 uppercase tracking-wider">
                Challenged
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed pl-7">
              previousHash is always null in production.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Impact:</span>
              <span className="text-[10px] text-red-400 font-mono font-bold">Zero evidence chains verified</span>
            </div>
          </div>

          {/* Finding 05 */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                05
              </span>
              <span className="text-[11px] text-white font-semibold">Convex Curves Worsen Inequality</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 pl-7">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 uppercase tracking-wider">
                Challenged
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed pl-7">
              Gini 0.64, convex makes it worse.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Impact:</span>
              <span className="text-[10px] text-red-400 font-mono font-bold">Median creator earns $7</span>
            </div>
          </div>

          {/* Finding 06 */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                06
              </span>
              <span className="text-[11px] text-white font-semibold">Trust Milestones Too Slow</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 pl-7">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 uppercase tracking-wider">
                Challenged
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed pl-7">
              70 campaigns needed to advance one level.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Impact:</span>
              <span className="text-[10px] text-red-400 font-mono font-bold">Creator retention at risk</span>
            </div>
          </div>
        </div>

        {/* Bottom link */}
        <div className="mt-4 px-4 py-3 rounded-xl bg-[#FA4616]/[0.04] border border-[#FA4616]/[0.1]">
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
            We tested every major mechanism from our whitepaper &mdash; CPM model, trust scores, evidence chains, oracle design,
            dispute resolution, bot detection, fee structure &mdash; against real campaign data. The full analysis includes
            all 25 hypotheses with data evidence, verdicts, and design implications.
          </p>
          <Link
            href="/docs/whitepaper-vs-reality"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FA4616]/10 text-[#FA4616] text-[10px] font-semibold hover:bg-[#FA4616]/20 transition-colors"
          >
            Read the full analysis
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </FadeInSection>
  );
}
