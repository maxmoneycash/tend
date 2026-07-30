"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CheckIcon, SpinnerIcon, CircleIcon } from "@/components/ui/Icons";
import { GlowCard } from "@/components/ui/GlowCard";

type StepStatus = "pending" | "active" | "done";

const STEPS = [
  "Creating company",
  "Configuring profile",
  "Setting up experiences",
  "Finalizing account",
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

      <div className="w-full max-w-[500px] px-6 animate-fade-in">
        {/* Brand header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E5F020] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
              <ellipse cx="12" cy="10" rx="4.5" ry="5.5" fill="#111" transform="rotate(-15 12 10)" />
              <ellipse cx="24" cy="8" rx="4" ry="5" fill="#111" transform="rotate(10 24 8)" />
              <ellipse cx="32" cy="16" rx="3.5" ry="5" fill="#111" transform="rotate(35 32 16)" />
              <ellipse cx="20" cy="24" rx="8" ry="7" fill="#111" />
              <ellipse cx="11" cy="22" rx="4" ry="5" fill="#111" transform="rotate(-20 11 22)" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold text-white">Decibel Trade</h1>
              <svg className="w-5 h-5 opacity-35" viewBox="0 0 24 24" fill="#666">
                <path d="M12 2l2.4 3.6L18 4.5l-.9 3.8 3.4 1.8-2.7 2.8 1.2 3.7-3.8-.3L13.5 20l-1.5-3.5L10.5 20l-1.7-3.6-3.8.3 1.2-3.7L3.5 10.2l3.4-1.8L6 4.5l3.6 1.1L12 2z" />
              </svg>
            </div>
            <p className="text-sm text-white/40 mt-0.5">https://www.decibel.trade</p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-1">Setting up your workspace</h2>
          <p className="text-sm text-white/40">Hang tight, we&apos;re configuring everything.</p>
        </div>

        {/* Steps */}
        <GlowCard className="mb-4">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                statuses[i] === "active" ? "bg-[var(--accent)]/6" : ""
              } ${i > 0 ? "border-t border-white/[0.04]" : ""}`}
            >
              <StepIcon status={statuses[i]} />
              <span
                className={`text-sm font-medium transition-colors ${
                  statuses[i] === "done"
                    ? "text-white/50"
                    : statuses[i] === "active"
                    ? "text-white"
                    : "text-white/25"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </GlowCard>

        {/* Connected accounts */}
        <div className="mt-7 animate-fade-in-d2">
          <p className="text-[11px] font-semibold text-white/30 tracking-widest uppercase mb-3">
            Connected accounts
          </p>
          <GlowCard>
            <ConnectedRow icon={<GoogleIcon />} name="Google" />
            <ConnectedRow icon={<WhopIcon />} name="Whop" border />
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
    <div className={`flex items-center gap-3 px-4 py-3.5 ${border ? "border-t border-white/[0.04]" : ""}`}>
      <div className="w-[22px] h-[22px] shrink-0 text-white/55">{icon}</div>
      <span className="text-sm font-medium text-white/80 flex-1">{name}</span>
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--emerald)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        Connected
      </span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function WhopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1000 515" className="w-[22px] h-[22px]">
      <path d="M158.881-.004c-65.68 0-110.956 28.993-145.22 61.779 0 0-13.834 13.19-13.66 13.592l143.896 144.762L287.766 75.367C260.521 37.63 209.152-.003 158.881-.003M514.191-.004c-65.678 0-110.955 28.993-145.22 61.779 0 0-12.635 12.838-13.208 13.592l-177.86 178.955 143.671 144.535 321.503-323.49C615.831 37.632 564.488-.003 514.191-.003M870.479-.004c-65.681 0-110.955 28.993-145.22 61.779 0 0-13.161 12.939-13.659 13.592L355.806 433.351l37.66 37.886c58.264 58.615 153.635 58.615 211.899 0l393.549-395.87h.451C972.119 37.632 920.773-.003 870.479-.003" />
    </svg>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
