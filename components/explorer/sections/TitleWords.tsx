"use client";

import { FadeInSection, SectionHeader } from "../shared";
import { SUCCESS_WORDS, FAILURE_WORDS } from "../constants";

export function TitleWords() {
  return (
    <FadeInSection>
      <div id="title-words" className="scroll-mt-24">
        <SectionHeader number="17" title="Title Words That Predict Success" subtitle="What you name your campaign matters" />

        <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
          We analyzed every word in every campaign title against spend rates.
          Baseline spend rate: 25.7%. These words consistently predict higher or lower performance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Words that help — green bubbles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Words that Help</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUCCESS_WORDS.map((w) => (
                <div key={w.word} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/[0.08] border border-green-500/20">
                  <span className="text-[12px] text-green-300 font-mono font-medium">&quot;{w.word}&quot;</span>
                  <span className="text-[9px] text-green-400/70 font-mono">{w.delta}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {SUCCESS_WORDS.map((w) => (
                <div key={w.word} className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono">{w.word}</span>
                  <span className="text-zinc-500">{w.spendRate.toFixed(0)}% spend rate</span>
                </div>
              ))}
            </div>
          </div>

          {/* Words that hurt — red bubbles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Words that Hurt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FAILURE_WORDS.map((w) => (
                <div key={w.word} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/[0.08] border border-red-500/20">
                  <span className="text-[12px] text-red-300 font-mono font-medium">&quot;{w.word}&quot;</span>
                  <span className="text-[9px] text-red-400/70 font-mono">{w.delta}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {FAILURE_WORDS.map((w) => (
                <div key={w.word} className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono">{w.word}</span>
                  <span className="text-zinc-500">{w.spendRate.toFixed(0)}% spend rate</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Irony callout — with emphasis */}
        <div className="mt-5 px-5 py-4 rounded-2xl bg-yellow-500/[0.06] border border-yellow-500/[0.12] relative">
          <div className="absolute -top-3 left-5 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[18px]">
            &#129327;
          </div>
          <div className="text-[14px] font-bold text-yellow-400 mb-1 mt-1">
            Putting &quot;viral&quot; in your title PREDICTS FAILURE
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Campaigns with &quot;viral&quot; in the title have a 13.0% spend rate &mdash; roughly half the baseline.
            Similarly, &quot;no description &gt; long description&quot;: campaigns with zero description have a 32.8% spend rate,
            while 500-1000 char descriptions drop to 15.9%. Overexplaining kills.
          </p>
        </div>
      </div>
    </FadeInSection>
  );
}
