"use client";

import type { TabId } from "@/lib/rewards-types";
import { useRewards } from "./RewardsProvider";

const TABS: { id: TabId; label: string }[] = [
  { id: "earn", label: "Earn" },
  { id: "keeper", label: "Keeper Bot" },
  { id: "shelby", label: "Shelby" },
  { id: "market", label: "Market" },
];

export function RewardsTabs({
  active,
  onChange,
  showMarketTab = false,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
  showMarketTab?: boolean;
}) {
  const { keeper } = useRewards();
  const visibleTabs = showMarketTab ? TABS : TABS.filter((t) => t.id !== "market");

  return (
    <div className="relative mb-6">
      {/* Tab bar — borderless, blends into page */}
      <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
        {visibleTabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex items-center px-5 py-3 text-[12px] font-medium transition-all whitespace-nowrap flex-shrink-0 tracking-[-0.01em] group"
              style={{ color: isActive ? "#fff" : "#555" }}
            >
              <span className="group-hover:text-zinc-300 transition-colors">
                {tab.label}
              </span>
              {tab.id === "keeper" && keeper.polling && (
                <span className="relative flex h-1.5 w-1.5 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                </span>
              )}
              {/* Active indicator — bottom line that blends into content border */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, #FA4616 30%, #FA4616 70%, transparent 100%)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      {/* Subtle separator that blends with the content area */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #212121 15%, #212121 85%, transparent 100%)",
        }}
      />
    </div>
  );
}
