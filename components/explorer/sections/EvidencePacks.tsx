"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { EVIDENCE_GRID } from "../constants";

export function EvidencePacks() {
  return (
    <FadeInSection>
      <div id="evidence-packs" className="scroll-mt-24 bg-zinc-900/50 -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="21" title="How Evidence Packs Fix This" subtitle="Shelby evidence chains mapped to each problem we found" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          Every dispute category we identified has a corresponding evidence type in the Shelby system.
          Each evidence pack is cryptographically signed, Merkle-chained, and stored on-chain &mdash;
          making disputes resolvable with data instead of arguments.
        </p>

        {/* Problem -> Evidence -> Solution pipeline */}
        <div className="space-y-3">
          {/* Header row */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 px-3 py-1.5 items-center">
            <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Problem</span>
            <span />
            <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">Evidence</span>
            <span />
            <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">Solution</span>
          </div>

          {EVIDENCE_GRID.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 sm:gap-3 px-4 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] items-center"
            >
              {/* Problem */}
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                <div>
                  <span className="sm:hidden text-[8px] text-zinc-700 uppercase tracking-wider">Problem: </span>
                  <span className={`text-[11px] font-semibold ${row.problemColor}`}>{row.problem}</span>
                </div>
              </div>
              {/* Arrow */}
              <span className="hidden sm:block text-zinc-600 text-[14px]">&#8594;</span>
              {/* Evidence */}
              <div className="flex items-start gap-2 sm:pl-0 pl-4">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                <div>
                  <span className="sm:hidden text-[8px] text-zinc-700 uppercase tracking-wider">Evidence: </span>
                  <span className="text-[11px] text-zinc-400">{row.evidence}</span>
                </div>
              </div>
              {/* Arrow */}
              <span className="hidden sm:block text-zinc-600 text-[14px]">&#8594;</span>
              {/* Solution */}
              <div className="flex items-start gap-2 sm:pl-0 pl-4">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
                <div>
                  <span className="sm:hidden text-[8px] text-zinc-700 uppercase tracking-wider">Result: </span>
                  <span className={`text-[11px] font-medium ${row.solutionColor}`}>{row.solution}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to evidence page */}
        <div className="mt-5 px-4 py-3 rounded-xl bg-[#FA4616]/[0.04] border border-[#FA4616]/[0.1]">
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
            See how this works in practice. Our evidence explorer shows real Merkle trees, oracle reports,
            bot detection scores, and on-chain payout records.
          </p>
          <Link
            href="/rewards/evidence"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FA4616]/10 text-[#FA4616] text-[10px] font-semibold hover:bg-[#FA4616]/20 transition-colors"
          >
            Explore Evidence Chains
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </FadeInSection>
  );
}
