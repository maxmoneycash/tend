"use client";

import { motion } from "motion/react";
import { FadeInSection, SectionHeader } from "../shared";
import { PLATFORM_DATA } from "../constants";

export function PlatformWars() {
  return (
    <FadeInSection>
      <div id="platforms" className="scroll-mt-24 bg-zinc-900/50 -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="13" title="Platform Wars" subtitle="TikTok dominates, but YouTube delivers" />

        {/* Side-by-side vertical bars */}
        <div className="flex items-end gap-4 sm:gap-6 justify-center mb-6" style={{ height: "200px" }}>
          {PLATFORM_DATA.map((p) => {
            const maxPct = 85;
            const h = (p.pct / maxPct) * 100;
            return (
              <div key={p.name} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                <span className="text-[10px] font-mono text-zinc-400">{p.pct}%</span>
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="w-full rounded-t-xl relative overflow-hidden"
                  style={{ backgroundColor: p.color + "30" }}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ backgroundColor: p.color + "50" }} />
                </motion.div>
                <span className="text-[11px] font-bold" style={{ color: p.color }}>{p.name}</span>
              </div>
            );
          })}
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {PLATFORM_DATA.map((p) => (
            <div key={p.name} className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-[10px] text-zinc-500 mb-1">CPM</div>
              <div className="text-[13px] font-mono font-bold" style={{ color: p.color }}>${p.cpm.toFixed(2)}</div>
              <div className="text-[9px] text-zinc-600 mt-1">{p.submissions} avg subs</div>
            </div>
          ))}
        </div>

        <div className="px-3 py-2.5 rounded-lg bg-white/[0.02]">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <span className="text-white font-semibold">Key insight:</span> YouTube has the fewest campaigns (47%) but the
            most submissions per campaign (248 avg). Instagram&apos;s CPM premium over TikTok is only 6.6%.
            X/Twitter has the highest CPM ($2.76) but the fewest campaigns.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
