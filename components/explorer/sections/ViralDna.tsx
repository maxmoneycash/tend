"use client";

import { FadeInSection, SectionHeader, DNARow } from "../shared";

export function ViralDna() {
  return (
    <FadeInSection>
      <div id="viral-dna" className="scroll-mt-24 bg-zinc-900/50 -mx-4 px-4 py-8 sm:-mx-8 sm:px-8 rounded-3xl">
        <SectionHeader number="10" title="What Makes Campaigns Go Viral" subtitle="Viral vs. dead campaign DNA" />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* VS Badge */}
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 items-center justify-center">
            <span className="text-[11px] font-black text-zinc-400">VS</span>
          </div>

          {/* Viral Campaign DNA — green left border */}
          <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-5 border-l-4 border-l-green-500/60">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[13px] font-bold text-green-400">Viral Campaign DNA</span>
            </div>
            <div className="space-y-2.5 text-[11px]">
              <DNARow icon={true} label="Budget" value="$704 median" detail="Small is better" />
              <DNARow icon={true} label="Rate" value="$1.06/1K" detail="Cheap attracts more" />
              <DNARow icon={true} label="Platforms" value="TT + IG + YT" detail="3 platform combo" />
              <DNARow icon={true} label="Description" value="Short or none" detail="32.8% spend rate" />
              <DNARow icon={true} label="Type" value="Music / Personal Brand" detail="Highest engagement" />
              <DNARow icon={true} label="Language" value="Spanish overrepresented" detail="6/20 top campaigns" />
            </div>
          </div>

          {/* Dead Campaign DNA — red left border */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5 border-l-4 border-l-red-500/60">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[13px] font-bold text-red-400">Dead Campaign DNA</span>
            </div>
            <div className="space-y-2.5 text-[11px]">
              <DNARow icon={false} label="Rate" value="$1.92/1K" detail="2x the viral rate" negative />
              <DNARow icon={false} label="Description" value="Long, overexplained" detail="500-1K chars = 15.9% spend" negative />
              <DNARow icon={false} label="Type" value="Logo / Unknown music" detail="Logo: 14.2% avg spend" negative />
              <DNARow icon={false} label="Pattern" value="25 join, ~1 submits" detail="Classic dead campaign" negative />
              <DNARow icon={false} label="Requirements" value="3+ stacked rules" detail="79.5% submission drop" negative />
              <DNARow icon={false} label="Min views" value=">12,917 threshold" detail="Kills 21pp of success" negative />
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
