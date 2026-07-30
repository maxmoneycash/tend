"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { REQUIREMENTS_CLIFF } from "../constants";

export function RequirementsCliff() {
  return (
    <FadeInSection>
      <div id="requirements-cliff" className="scroll-mt-24">
        <SectionHeader number="07" title="The Requirements Cliff" subtitle="Our most dramatic finding" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
          We measured how many submissions each creator produces as you stack more requirements.
          Something unexpected happens at exactly 3 requirements.
        </p>

        {/* Big dramatic cliff callout FIRST */}
        <div className="mb-6 text-center">
          <div className="text-[64px] sm:text-[80px] font-black text-red-400 leading-none tracking-tight font-mono">
            79.5%
          </div>
          <div className="text-[13px] text-red-400/80 font-medium mt-1">
            submission drop at 3 requirements
          </div>
        </div>

        {/* Bar chart — tall proportional bars */}
        <div className="mb-6">
          <div className="flex items-end gap-2 sm:gap-4 px-4" style={{ height: "220px" }}>
            {REQUIREMENTS_CLIFF.map((r, i) => {
              const maxH = 5.13;
              const h = (r.conversion / maxH) * 100;
              const isCliff = i >= 3;
              const isGreen = i <= 1;
              const isYellow = i === 2;

              return (
                <div key={r.reqs} className="flex-1 flex flex-col items-center gap-1.5 relative">
                  {/* Cliff edge indicator */}
                  {i === 3 && (
                    <div className="absolute -left-2 sm:-left-3 top-0 bottom-8 w-px border-l-2 border-dashed border-red-500/40 z-10" />
                  )}
                  <span className={`text-[11px] sm:text-[12px] font-mono font-bold ${isCliff ? "text-red-400" : isGreen ? "text-green-400" : "text-yellow-400"}`}>
                    {r.conversion.toFixed(2)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${Math.max(h, 4)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className={`w-full rounded-t-xl ${
                      isCliff
                        ? "bg-gradient-to-b from-red-500/70 to-red-500/20"
                        : isGreen
                          ? "bg-gradient-to-b from-green-500/60 to-green-500/20"
                          : "bg-gradient-to-b from-yellow-400/50 to-yellow-400/15"
                    }`}
                  />
                  <div className="text-center">
                    <span className={`text-[11px] font-mono font-bold ${isCliff ? "text-red-400" : "text-zinc-400"}`}>
                      {r.reqs}
                    </span>
                    <div className="text-[9px] text-zinc-700">{r.count} campaigns</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-[10px] text-zinc-700 mt-2 uppercase tracking-wider">
            number of requirements
          </div>
        </div>

        {/* Cliff callout */}
        <div className="px-5 py-4 rounded-2xl bg-red-500/[0.06] border border-red-500/[0.1]">
          <p className="text-[12px] text-zinc-400 leading-relaxed">
            The magic number is <span className="text-white font-semibold">2</span>. Two clear requirements actually <span className="text-green-400 font-semibold">improve</span> submissions vs. zero (5.13 vs. 4.39 per creator). But add a third, and conversion falls off a cliff.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
