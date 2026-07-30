"use client";

import { useState, useEffect, useCallback } from "react";
import { CRCard, CRCardHero, CRCardSubtle } from "./CRCard";

const DEFAULT_CAMPAIGN = "0xc726c78d3282fee1777bde05743ab9ca8f8933e22497f38f8db14727b0511a45";

interface LiveCampaign {
  address: string;
  owner: string;
  name: string;
  status: number;
  budgetTotal: number;
  budgetRemaining: number;
  totalSubmissions: number;
  totalPaid: number;
  totalViews: number;
  economics: {
    cpmRates: number[];
    minPayout: number;
    maxPayout: number;
    flatFeeBonus: number;
    budgetLocked: boolean;
  };
}

interface LiveSub {
  address: string;
  contentUrl: string;
  payoutRecipient: string;
  viewsCurrent: number;
  earnedCreator: number;
  feeAccumulated: number;
  botScore: number;
  status: number;
  isCompleted: boolean;
}

function formatUsd(octas: number): string {
  return "$" + (octas / 1e6).toFixed(2);
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch {}
  return null;
}

export function RewardsDashboard({ campaignAddress }: { campaignAddress?: string }) {
  const addr = campaignAddress || DEFAULT_CAMPAIGN;
  const [campaign, setCampaign] = useState<LiveCampaign | null>(null);
  const [subs, setSubs] = useState<LiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`/api/rewards/campaigns/live?address=${addr}`),
        fetch(`/api/rewards/submissions/live?campaign=${addr}`),
      ]);

      if (cRes.ok) {
        const d = await cRes.json();
        if (!d.error) setCampaign(d);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        if (!d.error) setSubs(d.submissions || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-5">
        <CRCardHero>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-16 bg-white/[0.06] rounded mb-2" />
                <div className="h-6 w-24 bg-white/[0.06] rounded" />
              </div>
            ))}
          </div>
        </CRCardHero>
      </div>
    );
  }

  const totalPaid = campaign ? campaign.budgetTotal - campaign.budgetRemaining : 0;
  const budgetPct = campaign && campaign.budgetTotal > 0
    ? Math.round((totalPaid / campaign.budgetTotal) * 100)
    : 0;
  const cpmRate = campaign?.economics?.cpmRates?.[0] ?? 0;
  const totalViews = subs.reduce((s, sub) => s + sub.viewsCurrent, 0);
  const totalEarned = subs.reduce((s, sub) => s + sub.earnedCreator, 0);
  const totalFees = subs.reduce((s, sub) => s + sub.feeAccumulated, 0);
  const uniqueRecipients = new Set(subs.map(s => s.payoutRecipient)).size;
  const trackingSubs = subs.filter(s => s.status === 0 && !s.isCompleted);

  return (
    <div className="space-y-5 animate-enter">
      {/* Campaign Overview */}
      <CRCardHero padding="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[18px]">
              &#x25B6;
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-white tracking-[-0.02em]">
                {campaign?.name || "Yunakin Land Tax"}
              </h3>
              <p className="text-[12px] text-[#7d7d7d] tracking-[-0.01em]">
                Tend land-tax programs · demo
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Active
          </span>
        </div>

        {/* Budget bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="text-[#7d7d7d]">Budget used</span>
            <span className="text-white font-medium font-mono tracking-[-0.01em]">
              {formatUsd(totalPaid)} / {formatUsd(campaign?.budgetTotal ?? 0)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FA4616] to-[#ff7a4a] transition-all duration-1000"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Views", value: formatViews(totalViews) },
            { label: "Clips", value: subs.length.toString() },
            { label: "Clippers", value: uniqueRecipients.toString() },
            { label: "Rate", value: `${formatUsd(cpmRate)}/1K` },
          ].map((stat) => (
            <div key={stat.label} className="cr-stat px-3 py-2.5 text-center">
              <div className="text-[16px] sm:text-[18px] font-bold text-white font-display tracking-[-0.02em]">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#7d7d7d]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CRCardHero>

      {/* Submission Payouts */}
      {subs.length > 0 && (
        <CRCard padding="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider">
              Submission Payouts
            </h3>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[10px] text-green-400 font-medium">On-chain verified</span>
            </div>
          </div>

          <div className="space-y-2">
            {subs.map((sub) => {
              const vid = extractVideoId(sub.contentUrl);
              const statusLabel = sub.status === 0 ? "Tracking" : sub.status === 1 ? "Flagged" : "Completed";
              const statusColor = sub.status === 0 ? "text-green-400" : sub.status === 1 ? "text-red-400" : "text-blue-400";
              return (
                <div key={sub.address} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-black/30 border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    {vid ? (
                      <img
                        src={`https://img.youtube.com/vi/${vid}/default.jpg`}
                        alt=""
                        className="w-12 h-9 rounded-lg object-cover shrink-0 bg-zinc-800"
                      />
                    ) : (
                      <div className="w-12 h-9 rounded-lg bg-zinc-800 shrink-0" />
                    )}
                    <div>
                      <div className="text-[12px] text-white font-medium font-mono tracking-[-0.01em]">
                        {vid || sub.address.slice(0, 10) + "..."}
                      </div>
                      <div className="text-[10px] text-[#7d7d7d]">
                        {sub.viewsCurrent.toLocaleString()} views &middot;{" "}
                        <span className={statusColor}>{statusLabel}</span>
                        &middot; bot {sub.botScore}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-green-400 font-mono">
                      {formatUsd(sub.earnedCreator)}
                    </div>
                    <div className="text-[9px] text-[#7d7d7d] font-mono">
                      {sub.payoutRecipient.slice(0, 6)}...{sub.payoutRecipient.slice(-4)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-4">
            <div className="cr-stat px-3 py-2.5 text-center">
              <div className="text-[14px] font-bold text-green-400 font-mono">{formatUsd(totalEarned)}</div>
              <div className="text-[9px] text-[#7d7d7d]">Creator Payouts</div>
            </div>
            <div className="cr-stat px-3 py-2.5 text-center">
              <div className="text-[14px] font-bold text-zinc-400 font-mono">{formatUsd(totalFees)}</div>
              <div className="text-[9px] text-[#7d7d7d]">Platform Fees</div>
            </div>
            <div className="cr-stat px-3 py-2.5 text-center">
              <div className="text-[14px] font-bold text-[#FA4616] font-mono">{formatUsd(campaign?.budgetRemaining ?? 0)}</div>
              <div className="text-[9px] text-[#7d7d7d]">Remaining</div>
            </div>
          </div>
        </CRCard>
      )}

      {/* Automated payouts badge */}
      <CRCardSubtle delay={0.15}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white tracking-[-0.02em]">Automated Payouts</div>
              <div className="text-[11px] text-[#7d7d7d] tracking-[-0.01em]">
                Views checked &amp; paid every 30s &middot; No manual approval needed
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        </div>
      </CRCardSubtle>

      {/* How It Works */}
      <CRCard padding="p-5 sm:p-6">
        <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-5">
          How It Works
        </h3>
        <div className="grid sm:grid-cols-3 gap-6 text-[13px]">
          {[
            { num: "01", title: "Creator launches campaign", desc: "Set a Content Rewards budget on Whop. Clippers start posting clips of your content." },
            { num: "02", title: "Oracle verifies views", desc: "Keeper bot fetches YouTube APIs, runs bot detection, stores evidence on Shelby." },
            { num: "03", title: "Real-time payouts", desc: "As views accumulate, the system auto-pays USDT from escrow. No manual approval needed." },
          ].map((s) => (
            <div key={s.num} className="border-l-2 border-[#FA4616] pl-4">
              <div className="text-[#FA4616] font-display text-[28px] font-bold mb-1.5 tracking-[-0.02em] leading-none">{s.num}</div>
              <div className="font-semibold mb-1 text-white tracking-[-0.02em]">{s.title}</div>
              <div className="text-[#7d7d7d] text-[12px] leading-relaxed tracking-[-0.01em]">{s.desc}</div>
            </div>
          ))}
        </div>
      </CRCard>
    </div>
  );
}
