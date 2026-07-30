"use client";

import { useState } from "react";
import type { SubmissionDetail as SubDetailType } from "@/lib/rewards-types";
import { fmtViews, fmtUSD, fmtExact, fmtTime, shortHash, shortAddr } from "@/lib/rewards-mock";
import { AnimatedNumber } from "./AnimatedNumber";
import { BotRadar } from "./BotRadar";
import { ViewsSparkline } from "./ViewsSparkline";

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  processing: { bg: "bg-white/[0.04]", text: "text-zinc-400", label: "Processing" },
  approved: { bg: "bg-green-500/10", text: "text-green-400", label: "Approved" },
  flagged: { bg: "bg-[#FA4616]/10", text: "text-[#FA4616]", label: "Flagged" },
  paid: { bg: "bg-green-500/10", text: "text-green-400", label: "Paid" },
  claimable: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Claimable" },
};

const SECTION_TABS = [
  { id: "timeline", label: "Timeline", icon: "" },
  { id: "bot", label: "Bot Check", icon: "" },
  { id: "payout", label: "Payout", icon: "" },
  { id: "evidence", label: "Evidence", icon: "" },
];

export function SubmissionDetailView({ sub }: { sub: SubDetailType }) {
  const [section, setSection] = useState("timeline");
  const status = STATUS_MAP[sub.status] || STATUS_MAP.processing;

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-enter">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14px] font-bold text-white">Submission Detail</div>
          <div className="text-[10px] font-mono text-zinc-600">{sub.id}</div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${status.bg} ${status.text} text-[11px] font-semibold`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.text === "text-green-400" ? "bg-green-400" : status.text === "text-[#FA4616]" ? "bg-[#FA4616]" : "bg-zinc-400"}`} />
          {status.label}
        </span>
      </div>

      {/* Hero card */}
      <div className="surface-1 rounded-[16px] p-5">
        {/* Creator + platform */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[18px]">
            {sub.platform === "youtube" ? "\u25B6" : sub.platform === "tiktok" ? "\u266A" : sub.platform === "instagram" ? "\u25C9" : "\uD835\uDD4F"}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-bold text-white">{sub.handle}</div>
            <div className="text-[11px] text-zinc-500">
              {sub.platformLabel} {"\u00B7"} {sub.campaignName}
            </div>
          </div>
        </div>

        {/* Video title */}
        {sub.videoTitle && (
          <div className="p-3 rounded-lg bg-white/[0.03] mb-4">
            <div className="text-[12px] text-zinc-300">{sub.videoTitle}</div>
            {sub.url && (
              <div className="text-[10px] text-zinc-600 font-mono mt-1 break-all">{sub.url}</div>
            )}
          </div>
        )}

        {/* Big numbers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-green-500/[0.04] border border-green-500/10">
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Total Views</div>
            <div className="font-mono text-[26px] font-bold text-white tracking-tight">
              <AnimatedNumber value={sub.views} />
            </div>
            <div className="text-[10px] text-green-400 font-mono mt-0.5">
              +{fmtViews(sub.evidenceChain[sub.evidenceChain.length - 1].viewDelta)} latest
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-green-500/[0.04] border border-green-500/10">
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Net Payout</div>
            <div className="font-mono text-[26px] font-bold text-green-400 tracking-tight">
              <AnimatedNumber value={sub.payout.netPayout} prefix="$" decimals={2} />
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{sub.payout.currency}</div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-4">
          <div className="text-[10px] text-zinc-500 mb-2">
            View growth across {sub.evidenceChain.length} oracle reports
          </div>
          <ViewsSparkline evidence={sub.evidenceChain} />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {SECTION_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
              section === t.id
                ? t.id === "evidence"
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  : "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-white/[0.06] bg-white/[0.02] text-zinc-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TIMELINE ═══ */}
      {section === "timeline" && (
        <div className="surface-1 rounded-[16px] p-4 animate-enter">
          {sub.timeline.map((ev, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center w-5 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full border-2 z-10 ${ev.color.replace("text-", "border-")} bg-transparent`} />
                {i < sub.timeline.length - 1 && (
                  <div className="w-px flex-1 bg-white/[0.06] min-h-[20px]" />
                )}
              </div>
              <div className={`flex-1 ${i < sub.timeline.length - 1 ? "pb-3" : ""}`}>
                <div className="text-[12px] text-white font-medium">
                  <span className="mr-1.5">{ev.icon}</span>
                  {ev.label}
                </div>
                <div className="text-[9px] text-zinc-600 font-mono mt-0.5">{fmtTime(ev.ts)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ BOT CHECK ═══ */}
      {section === "bot" && (
        <div className="space-y-3 animate-enter">
          {/* Overall score */}
          <div className="surface-1 rounded-[16px] p-5 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Composite Bot Score</div>
            <div className={`font-mono text-[48px] font-bold tracking-tight ${
              sub.botScore >= 85 ? "text-[#FA4616]" : sub.botScore >= 50 ? "text-yellow-400" : "text-green-400"
            }`}>
              {sub.botScore}
            </div>
            <div className="font-mono text-[11px] text-zinc-500">
              /100 {"\u2014"} {sub.botScore < 30 ? "LEGIT" : sub.botScore < 50 ? "LOW RISK" : sub.botScore < 85 ? "MODERATE" : "FLAGGED"}
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  sub.botScore >= 85 ? "bg-[#FA4616]" : sub.botScore >= 50 ? "bg-yellow-400" : "bg-green-400"
                }`}
                style={{ width: `${sub.botScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-zinc-600 font-mono mt-1">
              <span>0 {"\u2014"} Legit</span>
              <span className="text-red-400">85 {"\u2014"} Flag threshold</span>
              <span>100</span>
            </div>
          </div>

          {/* Radar */}
          <div className="surface-1 rounded-[16px] p-5 text-center">
            <div className="text-[12px] font-semibold text-white mb-3">Signal Distribution</div>
            <BotRadar signals={sub.botSignals} />
            <div className="text-[9px] text-zinc-600 mt-2">Dashed line = 85% flag threshold</div>
          </div>

          {/* Individual signals */}
          <div className="surface-1 rounded-[16px] overflow-hidden">
            <div className="px-4 py-3 text-[12px] font-semibold text-white border-b border-white/[0.06]">
              5 Detection Signals
            </div>
            {Object.entries(sub.botSignals).map(([key, sig], i) => (
              <div key={key} className={`px-4 py-3 ${i < 4 ? "border-b border-white/[0.04]" : ""}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${sig.flag ? "text-[#FA4616]" : "text-white"}`}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    {sig.flag && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#FA4616]/10 text-[#FA4616] font-semibold">
                        FLAG
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[12px] font-bold ${sig.flag ? "text-[#FA4616]" : "text-white"}`}>
                      {sig.score}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-600">{"\u00D7"}{sig.weight}</span>
                  </div>
                </div>
                <div className="h-0.5 rounded-full bg-white/[0.06] overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full ${sig.flag ? "bg-[#FA4616]" : "bg-[#FA4616]"}`}
                    style={{ width: `${sig.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-500 leading-relaxed">{sig.detail}</div>
              </div>
            ))}
            <div className="px-4 py-2.5 bg-white/[0.02] font-mono text-[10px] text-zinc-600">
              Weighted sum: {Object.entries(sub.botSignals).map(([, s]) => `${s.score}\u00D7${s.weight}`).join(" + ")} = {sub.botScore}
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYOUT ═══ */}
      {section === "payout" && (
        <div className="space-y-3 animate-enter">
          <div className="surface-1 rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-white mb-3">CPM Calculation</div>
            <div className="rounded-xl bg-black p-4 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Total views</span>
                <span className="text-white">{fmtExact(sub.payout.totalViews)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>{"\u00F7"} 1,000</span>
                <span className="text-white">{(sub.payout.totalViews / 1000).toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>{"\u00D7"} ${sub.payout.cpmRate.toFixed(2)} CPM ({sub.platformLabel})</span>
                <span className="text-white">{fmtUSD(sub.payout.grossPayout)}</span>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div className="flex justify-between text-green-400">
                <span>+ Flat fee bonus</span>
                <span>{fmtUSD(sub.payout.flatFeeBonus)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>{"\u2212"} Platform fee (5%)</span>
                <span>-{fmtUSD(sub.payout.platformFee)}</span>
              </div>
              <div className="h-px bg-white/[0.08]" />
              <div className="flex justify-between text-[14px] font-bold">
                <span className="text-white">Net payout</span>
                <span className="text-green-400">{fmtUSD(sub.payout.netPayout)}</span>
              </div>
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { l: "Min", v: fmtUSD(sub.payout.minPayout), ok: sub.payout.netPayout >= sub.payout.minPayout },
                { l: "Max", v: fmtUSD(sub.payout.maxPayout), ok: sub.payout.netPayout <= sub.payout.maxPayout },
                { l: "Currency", v: sub.payout.currency, ok: true },
              ].map((c) => (
                <div key={c.l} className="p-2 bg-white/[0.03] rounded-lg text-center">
                  <div className="text-[8px] text-zinc-600">{c.l}</div>
                  <div className={`font-mono text-[11px] font-semibold mt-0.5 ${c.ok ? "text-green-400" : "text-[#FA4616]"}`}>
                    {c.ok ? "\u2713 " : ""}{c.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout tx */}
          {sub.payout.payoutTx && (
            <div className="surface-1 rounded-[16px] p-4 border-green-500/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[12px] font-semibold text-green-400">Payout Confirmed</span>
              </div>
              <div className="font-mono text-[10px] text-zinc-500 space-y-1 break-all leading-relaxed">
                <div><span className="text-zinc-400">Tx:</span> {sub.payout.payoutTx}</div>
                <div><span className="text-zinc-400">To:</span> {sub.walletAddress}</div>
                <div>
                  <span className="text-zinc-400">Amount:</span>{" "}
                  <span className="text-green-400">{fmtUSD(sub.payout.netPayout)} {sub.payout.currency}</span>
                </div>
              </div>
              <button className="mt-3 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-semibold">
                View on Explorer {"\u2197"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ EVIDENCE ═══ */}
      {section === "evidence" && (
        <div className="space-y-3 animate-enter">
          {/* Chain status */}
          <div className="surface-1 rounded-[16px] p-4 border-orange-500/10 flex items-center gap-3">
            <span className="text-[20px] text-orange-400">{"\u25C6"}</span>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-orange-400">Evidence Chain Valid</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {sub.evidenceChain.length} reports {"\u00B7"} All hashes verified {"\u00B7"} Chain unbroken
              </div>
            </div>
            <span className="text-[18px] text-green-400">{"\u2713"}</span>
          </div>

          {/* Evidence packs */}
          {sub.evidenceChain.map((ev, i) => (
            <div key={i}>
              <div className="surface-1 rounded-[16px] p-4 animate-enter" style={{ animationDelay: `${i * 0.05}s` }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-mono text-[10px] font-bold text-orange-400">
                      {ev.reportId}
                    </div>
                    <span className="text-[12px] font-semibold text-white">Oracle Report #{ev.reportId}</span>
                  </div>
                  <span className="text-[9px] text-zinc-600">{fmtTime(ev.timestamp)}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                    <div className="text-[8px] text-zinc-600">Views</div>
                    <div className="font-mono text-[13px] font-bold text-white">{fmtViews(ev.views)}</div>
                    <div className="font-mono text-[9px] text-green-400">+{fmtViews(ev.viewDelta)}</div>
                  </div>
                  <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                    <div className="text-[8px] text-zinc-600">Bot</div>
                    <div className={`font-mono text-[13px] font-bold ${ev.botScore >= 85 ? "text-[#FA4616]" : "text-white"}`}>{ev.botScore}</div>
                  </div>
                  <div className="p-2 bg-white/[0.03] rounded-lg text-center">
                    <div className="text-[8px] text-zinc-600">Size</div>
                    <div className="font-mono text-[13px] font-bold text-white">{(ev.blobSize / 1024).toFixed(1)}KB</div>
                  </div>
                </div>

                {/* Hashes */}
                <div className="font-mono text-[9px] text-zinc-500 p-2.5 rounded-lg bg-black space-y-0.5 leading-relaxed">
                  <div><span className="text-orange-400">hash:</span> {ev.hash}</div>
                  <div>
                    <span className="text-zinc-400">prev:</span>{" "}
                    {ev.prevHash === "sha256:0000000000000000000000000000000000000000"
                      ? "genesis (0x0\u2026)"
                      : shortHash(ev.prevHash)}
                  </div>
                  <div><span className="text-blue-400">api_response:</span> {shortHash(ev.apiResponseHash)}</div>
                  <div><span className="text-orange-300">oracle:</span> {shortAddr(ev.oracleAddress)}</div>
                </div>

                {/* Shelby blob */}
                <div className="flex items-center gap-2 mt-2.5 p-2 rounded-lg bg-orange-500/[0.05] border border-orange-500/10">
                  <span className="text-orange-400 text-[11px]">{"\u25C6"}</span>
                  <span className="font-mono text-[9px] text-zinc-500 flex-1 truncate">{ev.blobName}</span>
                  <button className="px-2 py-0.5 rounded text-orange-400 bg-orange-500/10 text-[8px] font-semibold shrink-0">
                    Download {"\u2193"}
                  </button>
                </div>
              </div>

              {/* Chain link */}
              {i < sub.evidenceChain.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-px h-2 bg-orange-500/30" />
                    <div className="text-[8px] text-orange-400 font-mono px-2 py-0.5 bg-orange-500/[0.05] rounded">
                      hash chain {"\u2193"}
                    </div>
                    <div className="w-px h-2 bg-orange-500/30" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Verify CTA */}
          <div className="surface-1 rounded-[16px] p-5 text-center">
            <div className="text-[12px] font-semibold text-white mb-1">Verify this chain yourself</div>
            <div className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
              Download each evidence pack from Shelby, SHA-256 hash it, and confirm each report{"'"}s prevHash matches the previous report{"'"}s hash.
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-[#FA4616] text-white text-[12px] font-bold">
              Download Full Evidence Chain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
