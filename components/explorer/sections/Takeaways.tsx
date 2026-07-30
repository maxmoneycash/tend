"use client";

import Link from "next/link";
import { FadeInSection, SectionHeader, TakeawayRow } from "../shared";

export function Takeaways() {
  return (
    <FadeInSection>
      <div id="takeaways" className="scroll-mt-24">
        {/* Gradient border wrapper */}
        <div className="rounded-3xl p-px bg-gradient-to-br from-[#FA4616]/40 via-[#FA4616]/10 to-transparent">
          <div className="rounded-3xl bg-[var(--background)] p-6 sm:p-8">
            <SectionHeader number="24" title="What This Means for You" subtitle="Actionable takeaways" />

            {/* For Brands */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#FA4616]/10 text-[#FA4616] uppercase tracking-wider">
                  For Brands
                </span>
              </div>
              <div className="space-y-2">
                <TakeawayRow
                  icon="1"
                  text="Keep requirements at 2 or fewer. Two is the sweet spot. Three causes a 79.5% submission cliff."
                />
                <TakeawayRow
                  icon="2"
                  text="Budget at least $1,070. Below this threshold, success rate drops from 51.5% to 29.5%."
                />
                <TakeawayRow
                  icon="3"
                  text="Set CPM between $0.50-$1.00. Higher CPM has diminishing returns. Budget size matters more."
                />
                <TakeawayRow
                  icon="4"
                  text="Use TikTok + Instagram + YouTube together. The tri-platform combo has the best spend rate (28.3%)."
                />
                <TakeawayRow
                  icon="5"
                  text="Keep descriptions short or omit them. No description = 32.8% spend. Long descriptions = 15.9%."
                />
              </div>
            </div>

            {/* For Creators */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 uppercase tracking-wider">
                  For Creators
                </span>
              </div>
              <div className="space-y-2">
                <TakeawayRow
                  icon="1"
                  text="Check creator count first. Campaigns with 15+ creators have 57% success vs. 15% for smaller ones."
                />
                <TakeawayRow
                  icon="2"
                  text="Avoid campaigns with 3+ requirements. Your submission is 79.5% less likely to convert."
                />
                <TakeawayRow
                  icon="3"
                  text="Music and Personal Brand campaigns have the highest engagement and lowest dead-on-arrival rates."
                />
                <TakeawayRow
                  icon="4"
                  text="Skip campaigns with 'test', 'logo', or 'viral' in the title. These predict failure."
                />
              </div>
            </div>

            {/* Why Shelby is different */}
            <div className="px-5 py-5 rounded-2xl bg-[#FA4616]/[0.05] border border-[#FA4616]/[0.12]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] font-bold text-[#FA4616]">Why This Data Matters</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Content rewards campaigns manage over $1M in creator budgets with zero transparency into how decisions are made.
                Our system provides on-chain evidence for every payout, transparent dispute resolution, and
                data-driven campaign recommendations. Every insight on this page comes from our
                analysis of real campaign data &mdash; not surveys or estimates.
              </p>
              <Link
                href="/rewards/evidence"
                className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-lg bg-[#FA4616]/10 text-[#FA4616] text-[11px] font-semibold hover:bg-[#FA4616]/20 transition-colors"
              >
                View Evidence System
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
