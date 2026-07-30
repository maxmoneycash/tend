"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { KeeperTerminal } from "./KeeperTerminal";

const FlowingMenu = dynamic(() => import("./FlowingMenu"), { ssr: false });

const DEFAULT_CAMPAIGN = "0xc726c78d3282fee1777bde05743ab9ca8f8933e22497f38f8db14727b0511a45";

interface LiveSub {
  address: string;
  contentUrl: string;
  viewsCurrent: number;
  earnedCreator: number;
  botScore: number;
  status: number;
  isCompleted: boolean;
  payoutRecipient: string;
}

interface EvidencePack {
  id: string;
  submissionAddress: string | null;
  campaignAddress: string | null;
  packHash: string;
  previousHash: string | null;
  viewCount: number | null;
  botScore: number | null;
  payoutGross: number | null;
  payoutCreator: number | null;
  shelbyBlobName: string | null;
  txHash: string | null;
  generatedAt: string;
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

function formatUsd(octas: number): string {
  return (octas / 1e6).toFixed(2);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmtDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
}

function fmtDateOnly(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

type KeeperStatus = "active" | "idle" | "stale" | "unknown";

function getKeeperStatus(newestPackDate: string | null): { status: KeeperStatus; label: string; color: string } {
  if (!newestPackDate) return { status: "unknown", label: "No data", color: "text-[#7d7d7d]" };
  const age = Date.now() - new Date(newestPackDate).getTime();
  const mins = age / 60_000;
  if (mins < 5) return { status: "active", label: "Active", color: "text-green-400" };
  if (mins < 30) return { status: "idle", label: "Idle", color: "text-yellow-400" };
  return { status: "stale", label: `Last ran ${timeAgo(newestPackDate)}`, color: "text-orange-400" };
}

export function KeeperBotTab({ campaignAddress }: { campaignAddress?: string }) {
  const addr = campaignAddress || DEFAULT_CAMPAIGN;
  const [subs, setSubs] = useState<LiveSub[]>([]);
  const [packs, setPacks] = useState<EvidencePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [subsRes, evidenceRes] = await Promise.all([
        fetch(`/api/rewards/submissions/live?campaign=${addr}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/rewards/evidence/list?campaign=${addr}&limit=500`).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      if (subsRes?.submissions) setSubs(subsRes.submissions);
      if (evidenceRes?.packs) setPacks(evidenceRes.packs);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  }, [addr]);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const handleTerminalScroll = useCallback(() => {
    const el = terminalRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    shouldAutoScroll.current = atBottom;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [packs]);

  const trackingSubs = subs.filter((s) => s.status === 0 && !s.isCompleted);
  const totalEarned = subs.reduce((s, sub) => s + sub.earnedCreator, 0);
  const payoutPacks = packs.filter(p => (p.payoutCreator || 0) > 0);
  const totalPayouts = payoutPacks.length;

  // Build video ID lookup — try matching by full address, or prefix
  const subVideoMap = new Map<string, string>();
  for (const sub of subs) {
    const vid = extractVideoId(sub.contentUrl);
    if (vid) {
      subVideoMap.set(sub.address, vid);
      // Also store by common prefixes for fuzzy matching
      subVideoMap.set(sub.address.slice(0, 20), vid);
      subVideoMap.set(sub.address.slice(0, 10), vid);
    }
  }

  function resolveVideoLabel(p: EvidencePack): string {
    if (!p.submissionAddress) return "unknown";
    // Try exact match
    const exact = subVideoMap.get(p.submissionAddress);
    if (exact) return exact;
    // Try prefix match
    const prefix20 = subVideoMap.get(p.submissionAddress.slice(0, 20));
    if (prefix20) return prefix20;
    const prefix10 = subVideoMap.get(p.submissionAddress.slice(0, 10));
    if (prefix10) return prefix10;
    // Fall back to truncated address
    return p.submissionAddress.slice(2, 12);
  }

  // Group packs by submission for Active Submissions section
  const subMap = new Map<string, { videoId: string; packs: EvidencePack[] }>();
  for (const p of packs) {
    if (!p.submissionAddress) continue;
    const vid = resolveVideoLabel(p);
    if (!subMap.has(p.submissionAddress)) {
      subMap.set(p.submissionAddress, { videoId: vid, packs: [] });
    }
    subMap.get(p.submissionAddress)!.packs.push(p);
  }

  // Chronological order — oldest first, newest at bottom
  const terminalFeed = [...packs].sort((a, b) =>
    new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
  );

  // Keeper status
  const newestPack = terminalFeed.length > 0 ? terminalFeed[terminalFeed.length - 1] : null;
  const oldestPack = terminalFeed.length > 0 ? terminalFeed[0] : null;
  const keeperStatus = getKeeperStatus(newestPack?.generatedAt || null);

  // Compute avg interval between packs
  let avgIntervalLabel = "";
  if (terminalFeed.length >= 2) {
    const first = new Date(terminalFeed[0].generatedAt).getTime();
    const last = new Date(terminalFeed[terminalFeed.length - 1].generatedAt).getTime();
    const avgMs = (last - first) / (terminalFeed.length - 1);
    const avgSec = Math.round(avgMs / 1000);
    if (avgSec < 60) avgIntervalLabel = `~${avgSec}s`;
    else if (avgSec < 3600) avgIntervalLabel = `~${Math.round(avgSec / 60)}m`;
    else avgIntervalLabel = `~${(avgSec / 3600).toFixed(1)}h`;
  }

  // Count unique days in evidence
  const uniqueDays = new Set(packs.map(p => new Date(p.generatedAt).toDateString()));

  // Calculate view delta across all packs
  let totalViewDelta = 0;
  if (terminalFeed.length >= 2) {
    const firstViews = terminalFeed[0].viewCount || 0;
    const lastViews = terminalFeed[terminalFeed.length - 1].viewCount || 0;
    totalViewDelta = lastViews - firstViews;
  }

  return (
    <div className="space-y-5 animate-enter">
      {/* Keeper Status Card */}
      <div className="cr-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold font-display">Keeper Bot</h2>
            <span className="relative flex h-2.5 w-2.5">
              {keeperStatus.status === "active" ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                </>
              ) : keeperStatus.status === "idle" ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
              ) : keeperStatus.status === "stale" ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400" />
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-600" />
              )}
            </span>
            <span className={`text-[11px] font-medium ${keeperStatus.color}`}>
              {keeperStatus.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="text-[9px] text-zinc-600">
                Updated {timeAgo(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={fetchData}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Hero stat — editorial typography, no boxes */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[28px] font-bold text-green-400 font-mono tracking-tight">
              ${formatUsd(totalEarned)}
            </span>
            <span className="text-[11px] text-[#7d7d7d]">earned from {totalPayouts} payout{totalPayouts !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Tracking {trackingSubs.length} clip{trackingSubs.length !== 1 ? "s" : ""} &middot; {packs.length} evidence packs
            {avgIntervalLabel && <> &middot; checking every {avgIntervalLabel}</>}
            {newestPack && <> &middot; last {timeAgo(newestPack.generatedAt)}</>}
          </p>
        </div>

        {/* Pipeline — Flowing Menu */}
        <div className="mt-4">
          <div className="text-[9px] text-white/20 uppercase tracking-[0.1em] mb-2 font-medium">Pipeline</div>
          <div className="rounded-[12px] overflow-hidden" style={{ height: 200 }}>
            <FlowingMenu
              items={[
                {
                  link: "#",
                  text: "Scrape Views",
                  visual: (
                    <div className="flex items-center gap-2">
                      <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                        <polyline points="2,20 8,18 14,16 20,14 26,17 32,10 38,8 44,12 50,6 56,3" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
                        <circle cx="56" cy="3" r="2.5" fill="#0a0a0a" opacity="0.8" />
                      </svg>
                      <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", fontWeight: 700, opacity: 0.7 }}>
                        410K
                      </span>
                    </div>
                  ),
                },
                {
                  link: "#",
                  text: "Bot Detection",
                  visual: (
                    <div className="flex items-center gap-2">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        {/* mini radar pentagon */}
                        <polygon points="14,3 24,10 21,22 7,22 4,10" stroke="#0a0a0a" strokeWidth="0.8" fill="none" opacity="0.2" />
                        <polygon points="14,7 20,12 18,19 10,19 8,12" stroke="#0a0a0a" strokeWidth="0.8" fill="none" opacity="0.15" />
                        <polygon points="14,8 18,11 17,17 11,17 10,11" fill="#0a0a0a" fillOpacity="0.15" stroke="#0a0a0a" strokeWidth="1.2" />
                        {[0,1,2,3,4].map(i => {
                          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                          return <circle key={i} cx={14 + 7 * Math.cos(a)} cy={14 + 7 * Math.sin(a)} r="1.5" fill="#0a0a0a" opacity="0.5" />;
                        })}
                      </svg>
                      <span style={{ fontSize: 11, fontFamily: "'Geist Mono', monospace", fontWeight: 700, opacity: 0.7 }}>
                        15/100
                      </span>
                    </div>
                  ),
                },
                {
                  link: "#",
                  text: "Pay Creator",
                  visual: (
                    <div className="flex items-center gap-1.5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" opacity="0.6">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                      </svg>
                      <span style={{ fontSize: 13, fontFamily: "'Geist Mono', monospace", fontWeight: 800, opacity: 0.8 }}>
                        +$86.93
                      </span>
                      <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 500 }}>USDT</span>
                    </div>
                  ),
                },
                {
                  link: "#",
                  text: "Store on Shelby",
                  visual: (
                    <div className="flex items-center gap-1">
                      {["0xe7f2", "0x3cd1", "0xa8b9"].map((hash, i) => (
                        <div key={i} className="flex items-center">
                          <div
                            style={{
                              width: 44,
                              height: 18,
                              borderRadius: 4,
                              background: i === 2 ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 8,
                              fontFamily: "'Geist Mono', monospace",
                              fontWeight: 600,
                              opacity: 0.7,
                            }}
                          >
                            {hash}
                          </div>
                          {i < 2 && (
                            <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: 0.3, margin: "0 1px" }}>
                              <path d="M2 5h6M6 3l2 2-2 2" stroke="#0a0a0a" strokeWidth="1.2" fill="none" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
              speed={12}
              textColor="rgba(255,255,255,0.5)"
              bgColor="transparent"
              marqueeBgColor="#FA4616"
              marqueeTextColor="#0a0a0a"
              borderColor="rgba(255,255,255,0.04)"
            />
          </div>
          <div className="text-[9px] text-zinc-600 mt-2">
            Runs every 5 min &middot; scrapes YouTube &rarr; bot check &rarr; pay on-chain &rarr; evidence to Shelby
          </div>
        </div>
      </div>

      {/* Active Submissions */}
      {trackingSubs.length > 0 && (
        <div className="cr-card p-5">
          <h3 className="text-[11px] font-semibold text-[#7d7d7d] uppercase tracking-wider mb-3">
            Active Submissions &middot; {trackingSubs.length}
          </h3>
          <div className="space-y-2">
            {trackingSubs.map((sub) => {
              const vid = extractVideoId(sub.contentUrl);
              const subPacks = subMap.get(sub.address);
              const checkCount = subPacks?.packs.length || 0;
              const latestCheck = subPacks?.packs[0];
              return (
                <div key={sub.address} className="py-3 px-3.5 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {vid ? (
                        <img
                          src={`https://img.youtube.com/vi/${vid}/default.jpg`}
                          alt=""
                          className="w-12 h-8 rounded object-cover shrink-0 bg-zinc-800"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded bg-zinc-800 shrink-0" />
                      )}
                      <div>
                        <div className="text-[12px] font-mono text-white font-medium">
                          {vid || sub.address.slice(0, 12) + "..."}
                        </div>
                        <div className="text-[10px] text-[#7d7d7d]">
                          {sub.viewsCurrent.toLocaleString()} views &middot; bot score {sub.botScore}/100
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-mono text-green-400 font-medium">
                        +${formatUsd(sub.earnedCreator)}
                      </div>
                      <div className="text-[9px] text-zinc-600">
                        {checkCount} checks
                      </div>
                    </div>
                  </div>
                  {subPacks && subPacks.packs.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {subPacks.packs.slice(0, 20).reverse().map((p) => {
                        const paid = (p.payoutCreator || 0) > 0;
                        return (
                          <div
                            key={p.id}
                            className={`h-1.5 flex-1 rounded-full ${
                              paid ? "bg-green-400" : "bg-zinc-700"
                            }`}
                            title={`${fmtDateTime(p.generatedAt)} — ${(p.viewCount || 0).toLocaleString()} views${paid ? ` — $${formatUsd(p.payoutCreator!)} paid` : ""}`}
                          />
                        );
                      })}
                    </div>
                  )}
                  {latestCheck && (
                    <div className="text-[9px] text-zinc-600 mt-1">
                      Last check: {fmtDateTime(latestCheck.generatedAt)} ({timeAgo(latestCheck.generatedAt)}) &middot; {(latestCheck.viewCount || 0).toLocaleString()} views
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Terminal Feed */}
      <KeeperTerminal
        packs={packs}
        subs={subs}
        resolveVideoLabel={resolveVideoLabel}
        trackingCount={trackingSubs.length}
        totalPayouts={totalPayouts}
      />

      {loading && packs.length === 0 && (
        <div className="cr-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#FA4616] border-t-transparent animate-spin" />
            <span className="text-[12px] text-zinc-400">Loading keeper data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
