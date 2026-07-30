"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { CLARITY_BUCKETS } from "../constants";

export function ClarityScore() {
  return (
    <FadeInSection>
      <div id="clarity" className="scroll-mt-24">
        <SectionHeader number="16" title="Requirement Clarity Score" subtitle="How description quality affects creator behavior" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
          We scored every campaign description on structure, formatting, and clarity.
          The results are dramatic: a well-structured description gets <span className="text-white font-semibold">13x more submissions</span> per creator than a wall of text.
        </p>

        {/* Campaign cards */}
        <div className="space-y-3 mb-6">
          {CLARITY_BUCKETS.map((bucket) => (
            <div
              key={bucket.grade}
              className={`px-4 py-3 rounded-xl border ${bucket.borderColor} ${bucket.bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[12px] font-semibold ${bucket.gradeColor}`}>{bucket.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${bucket.tagColor}`}>
                    Clarity: {bucket.grade}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-[16px] font-bold font-mono ${bucket.gradeColor}`}>
                    {bucket.conversion.toFixed(2)}
                  </div>
                  <div className="text-[8px] text-zinc-600">subs/creator</div>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-black/20">
                <p className="text-[9px] text-zinc-500 font-mono leading-relaxed whitespace-pre-line">
                  {bucket.example}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion comparison bar */}
        <div className="mb-5">
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2 font-semibold">
            Submissions per creator by description quality
          </div>
          <div className="space-y-2">
            {CLARITY_BUCKETS.map((bucket) => {
              const maxConv = 8.29;
              const w = (bucket.conversion / maxConv) * 100;
              return (
                <div key={bucket.grade}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-zinc-400">{bucket.label}</span>
                    <span className={`text-[10px] font-mono font-bold ${bucket.gradeColor}`}>
                      {bucket.conversion.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(w, 4)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: bucket.grade === "F" ? "#EF4444" : bucket.grade === "C" ? "#71717A" : "#22C55E",
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-3 rounded-xl bg-green-500/[0.04] border border-green-500/[0.08]">
          <div className="text-[13px] font-bold text-green-400 mb-1">
            13x more submissions with structured descriptions
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Campaigns with structured bullet points (Clarity A) average 8.29 submissions per creator.
            Wall-of-text descriptions (Clarity F) average just 0.62. Paradoxically, no description at all (5.17)
            outperforms poorly-written descriptions &mdash; suggesting that a bad description is worse than none.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
