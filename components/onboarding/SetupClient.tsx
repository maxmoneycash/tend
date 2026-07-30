"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CheckIcon, SpinnerIcon, CircleIcon } from "@/components/ui/Icons";
import { GlowCard } from "@/components/ui/GlowCard";

type StepStatus = "pending" | "active" | "done";

const STEPS = [
  "Creating private donation zone",
  "Anchoring to Tempo L1",
  "Provisioning Stripe offramp via projects.dev",
  "Publishing campaign",
] as const;

export function SetupClient() {
  const [statuses, setStatuses] = useState<StepStatus[]>(["active", "pending", "pending", "pending"]);

  const advance = useCallback(async () => {
    const delays = [2200, 2000, 1800, 1500];

    for (let i = 0; i < STEPS.length; i++) {
      // Mark current as active
      setStatuses((prev) => prev.map((s, j) => (j === i ? "active" : j < i ? "done" : "pending")));
      await sleep(delays[i]);
      // Mark as done
      setStatuses((prev) => prev.map((s, j) => (j === i ? "done" : s)));
    }
  }, []);

  useEffect(() => { advance(); }, [advance]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--background)]">
      <Navbar />

      <div className="w-full max-w-[500px] px-6 animate-fade-in" style={{ paddingTop: "72px" }}>
        {/* Brand header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FA4616]/10 border border-[#FA4616]/20 flex items-center justify-center shrink-0">
            <img src="/tend-logo-dark.svg" alt="Tend" className="w-11" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold text-[#111111]">Muwekma Ohlone contribution</h1>
              <svg className="w-5 h-5 opacity-35" viewBox="0 0 24 24" fill="#666">
                <path d="M12 2l2.4 3.6L18 4.5l-.9 3.8 3.4 1.8-2.7 2.8 1.2 3.7-3.8-.3L13.5 20l-1.5-3.5L10.5 20l-1.7-3.6-3.8.3 1.2-3.7L3.5 10.2l3.4-1.8L6 4.5l3.6 1.1L12 2z" />
              </svg>
            </div>
            <p className="text-sm text-[#777777] mt-0.5">https://www.muwekmafoundation.org</p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#111111] mb-1">Creating your donation campaign</h2>
          <p className="text-sm text-[#777777]">Hang tight — zone, rails, and offramp are provisioning.</p>
        </div>

        {/* Steps */}
        <GlowCard className="mb-4">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                statuses[i] === "active" ? "bg-[var(--accent)]/6" : ""
              } ${i > 0 ? "border-t border-black/[0.06]" : ""}`}
            >
              <StepIcon status={statuses[i]} />
              <span
                className={`text-sm font-medium transition-colors ${
                  statuses[i] === "done"
                    ? "text-[#8a8a8a]"
                    : statuses[i] === "active"
                    ? "text-[#111111]"
                    : "text-[#b5b5b5]"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </GlowCard>

        {/* Connected rails */}
        <div className="mt-7 animate-fade-in-d2">
          <p className="text-[11px] font-semibold text-[#999999] tracking-widest uppercase mb-3">
            Connected rails
          </p>
          <GlowCard>
            <ConnectedRow icon={<StripeIcon />} name="Stripe · offramp + Checkout" />
            <ConnectedRow icon={<ZoneIcon />} name="Tempo zone · confidential balances" border />
          </GlowCard>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") return <CheckIcon className="text-[var(--success)] animate-icon-pop" />;
  if (status === "active") return <SpinnerIcon />;
  return <CircleIcon />;
}

function ConnectedRow({ icon, name, border }: { icon: React.ReactNode; name: string; border?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${border ? "border-t border-black/[0.06]" : ""}`}>
      <div className="w-[22px] h-[22px] shrink-0 text-[#555555]">{icon}</div>
      <span className="text-sm font-medium text-[#333333] flex-1">{name}</span>
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--emerald)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        Connected
      </span>
    </div>
  );
}

function StripeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19" />
    </svg>
  );
}

function ZoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7L12 2.8z" />
      <path d="M12 21.2V12M3.5 7 12 12l8.5-5" />
    </svg>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
