"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { DECISION_TREE } from "../constants";

export function SuccessPredictors() {
  return (
    <FadeInSection>
      <div id="decision-tree" className="scroll-mt-24 bg-white/[0.01] -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="18" title="Success Predictors" subtitle="Decision tree feature importance (>25% spend = success)" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
          We built a decision tree to predict which campaigns will spend more than 25% of their budget.
          These are the top 5 features by information gain.
        </p>

        <div className="space-y-4">
          {DECISION_TREE.map((f, i) => {
            const isPositive = f.above > f.below;
            const indent = i * 12;
            return (
              <motion.div
                key={f.feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
                style={{ marginLeft: `${indent}px` }}
              >
                {/* Connecting line */}
                {i > 0 && (
                  <div className="absolute -left-3 top-0 bottom-1/2 border-l-2 border-b-2 border-zinc-800 w-3 rounded-bl-lg" />
                )}

                <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#FA4616]/10 text-[#FA4616] flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[12px] text-white font-semibold">{f.feature}</span>
                    <span className="text-[9px] text-zinc-600 font-mono ml-auto">gain: {f.gain.toFixed(4)}</span>
                  </div>

                  {/* YES / NO branches */}
                  <div className="flex items-stretch gap-3">
                    <div className={`flex-1 px-3 py-2 rounded-lg ${isPositive ? "bg-green-500/[0.06] border border-green-500/10" : "bg-red-500/[0.06] border border-red-500/10"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-bold uppercase ${isPositive ? "text-green-400" : "text-red-400"}`}>YES</span>
                        <span className="text-[9px] text-zinc-600">Above threshold</span>
                      </div>
                      <div className={`text-[16px] font-bold font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {f.above}%
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-px h-full bg-zinc-800" />
                    </div>

                    <div className={`flex-1 px-3 py-2 rounded-lg ${!isPositive ? "bg-green-500/[0.06] border border-green-500/10" : "bg-red-500/[0.06] border border-red-500/10"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-bold uppercase ${!isPositive ? "text-green-400" : "text-red-400"}`}>NO</span>
                        <span className="text-[9px] text-zinc-600">Below threshold</span>
                      </div>
                      <div className={`text-[16px] font-bold font-mono ${!isPositive ? "text-green-400" : "text-red-400"}`}>
                        {f.below}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </FadeInSection>
  );
}
