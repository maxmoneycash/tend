"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { RewardsProvider } from "@/components/rewards/RewardsProvider";
import { RewardsTabs } from "@/components/rewards/RewardsTabs";
import { KeeperBotTab } from "@/components/rewards/KeeperBotTab";
import { ShelbyTab } from "@/components/rewards/ShelbyTab";
import { EarnTab } from "@/components/rewards/EarnTab";
import { CampaignWizard } from "@/components/rewards/CampaignWizard";
import type { TabId } from "@/lib/rewards-types";

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("earn");
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">

          {/* Hero */}
          <div className="mb-6 sm:mb-8 animate-enter">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
                  Tend Programs
                </span>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FA4616] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FA4616]" />
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-medium text-white tracking-[-0.01em]">
                    Land-tax programs on Tend
                  </span>
                </div>
                <p className="text-[13px] sm:text-[14px] font-sans text-[#7d7d7d] max-w-xl text-pretty leading-relaxed">
                  Recurring land-tax pledges created on each tribe&apos;s own
                  account. Contributions become standing support.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setWizardOpen(true)}
                  className="flex px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-[#FA4616] to-[#e03d12] text-white text-[13px] font-semibold hover:brightness-110 transition-all items-center gap-1.5"
                >
                  + New Program
                </button>
              </div>
            </div>
          </div>

          <RewardsProvider>
              {/* Tabs */}
              <div className="animate-enter animate-enter-delay-1">
                <RewardsTabs active={activeTab} onChange={setActiveTab} />
              </div>

              {/* Tab content */}
              <div className="animate-enter animate-enter-delay-2">
                {activeTab === "keeper" && <KeeperBotTab />}
                {activeTab === "shelby" && <ShelbyTab />}
                {activeTab === "earn" && <EarnTab />}
              </div>

              {/* Mobile FAB */}
              <button
                onClick={() => setWizardOpen(true)}
                className="sm:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#FA4616] border border-[#FA4616]/30 text-white text-[22px] flex items-center justify-center shadow-lg shadow-orange-500/20"
              >
                +
              </button>

              {/* Wizard */}
              <CampaignWizard
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
              />
          </RewardsProvider>
        </main>
      </div>
    </div>
  );
}
