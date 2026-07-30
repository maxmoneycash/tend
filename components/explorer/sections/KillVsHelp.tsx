"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { REQUIREMENTS_THAT_KILL, REQUIREMENTS_THAT_HELP } from "../constants";

export function KillVsHelp() {
  return (
    <FadeInSection>
      <div id="kill-vs-help" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="08" title="What Kills Campaigns" subtitle="Requirement impact on spend rate" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          Not all requirements are equal. Some destroy campaign spend rates, while a few actually help.
          These deltas are measured against the 25.2% baseline spend rate.
        </p>

        {/* Diverging bar chart — center aligned */}
        <div className="space-y-2 mb-6">
          {/* Center line label */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[9px] text-red-400 uppercase tracking-wider font-semibold">Kills</span>
            <div className="w-px h-3 bg-zinc-700" />
            <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Baseline 25.2%</span>
            <div className="w-px h-3 bg-zinc-700" />
            <span className="text-[9px] text-green-400 uppercase tracking-wider font-semibold">Helps</span>
          </div>

          {/* Kill rows — bars go LEFT from center */}
          {REQUIREMENTS_THAT_KILL.map((r) => {
            const maxDelta = 21.1;
            const w = (Math.abs(r.delta) / maxDelta) * 50;
            return (
              <div key={r.name} className="flex items-center gap-0">
                {/* Left half: label + red bar */}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono text-right">{r.name.replace(/_/g, " ")}</span>
                  <div className="relative" style={{ width: `${w}%`, minWidth: "20px" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-6 rounded-l-lg bg-gradient-to-l from-red-500/60 to-red-500/20 flex items-center justify-start pl-2"
                    >
                      <span className="text-[9px] text-red-300 font-mono font-bold whitespace-nowrap">{r.delta.toFixed(1)}pp</span>
                    </motion.div>
                  </div>
                </div>
                {/* Center divider */}
                <div className="w-px h-6 bg-zinc-700 shrink-0 mx-0.5" />
                {/* Right half: empty */}
                <div className="flex-1" />
              </div>
            );
          })}

          {/* Help rows — bars go RIGHT from center */}
          {REQUIREMENTS_THAT_HELP.map((r) => {
            const maxDelta = 21.1;
            const w = (r.delta / maxDelta) * 50;
            return (
              <div key={r.name} className="flex items-center gap-0">
                {/* Left half: label */}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono text-right">{r.name.replace(/_/g, " ")}</span>
                </div>
                {/* Center divider */}
                <div className="w-px h-6 bg-zinc-700 shrink-0 mx-0.5" />
                {/* Right half: green bar */}
                <div className="flex-1">
                  <div className="relative" style={{ width: `${w}%`, minWidth: "20px" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-6 rounded-r-lg bg-gradient-to-r from-green-500/20 to-green-500/60 flex items-center justify-end pr-2"
                    >
                      <span className="text-[9px] text-green-300 font-mono font-bold whitespace-nowrap">+{r.delta.toFixed(1)}pp</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 rounded-xl bg-green-500/[0.05] border border-green-500/[0.08]">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <span className="text-green-400 font-semibold">auto_reject</span> campaigns have a 46.3% spend rate (nearly 2x baseline). Explicit disqualification language actually signals quality control, attracting more serious creators.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
