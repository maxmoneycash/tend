"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { DonationsTab } from "@/components/rewards/DonationsTab";

export default function RewardsPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8 animate-enter">
            <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
              Tend Programs
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-white mb-2 tracking-[-0.02em]">
              Streamed donations
            </h1>
            <p className="text-[13px] sm:text-[14px] font-sans text-[#7d7d7d] max-w-xl text-pretty leading-relaxed tracking-[-0.01em]">
              Donations stream as USDC on Tempo and offramp to each
              tribe&apos;s own account through Stripe — live, transparent,
              continuous.
            </p>
          </div>

          <div className="animate-enter animate-enter-delay-1">
            <DonationsTab />
          </div>
        </main>
      </div>
    </div>
  );
}
