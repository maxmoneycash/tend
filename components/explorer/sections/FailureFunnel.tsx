"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { FUNNEL_STAGES } from "../constants";

export function FailureFunnel() {
  return (
    <FadeInSection>
      <div id="failure-funnel" className="scroll-mt-24">
        <SectionHeader number="09" title="Campaign Failure Funnel" subtitle="Where campaigns die" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          Only 4.3% of campaigns spend more than 90% of their budget.
          The biggest absolute dropoff happens between &quot;has spend&quot; and &quot;spent &gt;25%&quot; &mdash;
          119 campaigns fall off that cliff.
        </p>

        <div className="flex flex-col items-center space-y-0">
          {FUNNEL_STAGES.map((stage, i) => {
            const width = Math.max(stage.pct, 12);
            const isFirst = i === 0;
            const showDropoff = i > 0 && stage.dropoff > 0;

            return (
              <div key={stage.label} className="w-full flex flex-col items-center">
                {/* Dropoff connector */}
                {showDropoff && (
                  <div className="flex items-center gap-2 py-1">
                    <div className={`w-px h-4 ${stage.isRed ? "bg-red-500/60" : "bg-zinc-800"}`} />
                    <span className={`text-[10px] font-mono font-bold ${stage.isRed ? "text-red-400" : "text-zinc-600"}`}>
                      -{stage.dropoff.toFixed(1)}%
                      {stage.isRed && (
                        <span className="text-red-400 ml-1 relative">
                          BIGGEST DROPOFF
                          <span className="absolute inset-0 blur-md bg-red-500/30 -z-10 animate-pulse" />
                        </span>
                      )}
                    </span>
                    <div className={`w-px h-4 ${stage.isRed ? "bg-red-500/60" : "bg-zinc-800"}`} />
                  </div>
                )}

                {/* Funnel bar — centered, descending width */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: `${width}%`, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className={`h-10 sm:h-11 rounded-xl flex items-center justify-between px-4 ${
                    stage.isRed
                      ? "bg-gradient-to-r from-red-500/30 to-red-500/10 border border-red-500/20"
                      : isFirst
                        ? "bg-gradient-to-r from-[#FA4616]/25 to-[#FA4616]/10 border border-[#FA4616]/20"
                        : "bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/[0.05]"
                  }`}
                >
                  <span className={`text-[11px] font-bold whitespace-nowrap ${stage.isRed ? "text-red-400" : "text-zinc-300"}`}>
                    {stage.count}
                  </span>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">
                    {stage.label} <span className="text-zinc-700 font-mono">({stage.pct}%)</span>
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeInSection>
  );
}
