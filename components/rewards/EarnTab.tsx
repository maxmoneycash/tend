"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRewards } from "./RewardsProvider";
import { LiveCounter, calculateEarningsVelocity } from "./LiveCounter";
import { ClipsCarousel } from "./ClipsCarousel";

// ── Types ───────────────────────────────────────────

interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
  value: string;
  required: boolean;
}

interface ShelbyRef {
  blobName: string;
  explorerUrl: string;
}

interface SubmitResult {
  status: "paid" | "submitted" | "ineligible" | "views_updated";
  isNewSubmission?: boolean;
  checks?: VerificationCheck[];
  payoutSkipReason?: string;
  phase1?: {
    eligible: boolean;
    video: {
      videoId: string;
      title: string;
      channelTitle: string;
      description: string;
      durationSeconds: number;
      isPublic: boolean;
      hasCaptions: boolean;
    };
    submitTxHash: string | null;
    submissionAddress: string;
    attestation: ShelbyRef | null;
  };
  phase2?: {
    txHash: string | null;
    payoutError: string | null;
    explorerUrl: string | null;
    viewCount: number;
    newViews: number;
    likeCount: number;
    commentCount: number;
    botScore: number;
    aiLegit: boolean;
    evidenceHash: string;
    payoutAmount: {
      gross: number;
      fee: number;
      creator: number;
      grossFormatted: string;
      creatorFormatted: string;
    };
    cpmRate: number;
    finalOnChainViews: number;
    finalOnChainEarned: number;
    minPayout?: number;
    payoutSkipped?: boolean;
  };
  receipt?: {
    submissionAddress: string;
    submissionExplorerUrl: string;
    campaignAddress: string;
    campaignExplorerUrl: string;
    oracleAddress: string;
    oracleExplorerUrl: string;
    latestEvidence: {
      hash: string;
      shelbyBlob: string | null;
      shelbyUrl: string | null;
      generatedAt: string;
    } | null;
  };
  similarity?: {
    score: number;
    threshold: number;
    passed: boolean;
  };
  issues?: string[];
  video?: {
    videoId: string;
    title: string;
    channelTitle: string;
    durationSeconds: number;
    isPublic: boolean;
  };
  durationMs: number;
  error?: string;
}

interface LiveSubmission {
  address: string;
  campaign: string;
  creator: string;
  platform: number;
  contentUrl: string;
  status: number;
  botScore: number;
  aiLegit: boolean;
  viewsCurrent: number;
  earnedCreator: number;
  feeAccumulated: number;
  isCompleted: boolean;
}

interface LiveCampaign {
  address: string;
  owner: string;
  name: string;
  campaignType: number;
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

const DEFAULT_CAMPAIGN = "0xc726c78d3282fee1777bde05743ab9ca8f8933e22497f38f8db14727b0511a45";
const REFRESH_INTERVAL = 30_000;

function formatUsd(octas: number): string {
  return (octas / 1e6).toFixed(2);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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

// ── Main Component ────────────────────────────────

export function EarnTab({ campaignAddress }: { campaignAddress?: string }) {
  const addr = campaignAddress || DEFAULT_CAMPAIGN;
  const { walletAddress, walletConnected } = useRewards();

  // Submit state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [showPayout, setShowPayout] = useState(false);

  // Live state
  const [liveCampaign, setLiveCampaign] = useState<LiveCampaign | null>(null);
  const [liveSubmissions, setLiveSubmissions] = useState<LiveSubmission[]>([]);
  const [liveTotalEarned, setLiveTotalEarned] = useState(0);
  const [liveTotalViews, setLiveTotalViews] = useState(0);
  const [liveLoading, setLiveLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstLoad = useRef(true);

  // Velocity state for live counter
  const [earningsVelocity, setEarningsVelocity] = useState(0);
  const [viewsPerHour, setViewsPerHour] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  // ── Live data fetcher ──────────────────────────

  const fetchLiveData = useCallback(async () => {
    try {
      // Keeper runs server-side via Vercel cron (every 1 min).
      // We poll live data + evidence packs to update display + velocity.
      isFirstLoad.current = false;

      const [cRes, sRes, eRes] = await Promise.all([
        fetch(`/api/rewards/campaigns/live?address=${addr}`),
        fetch(`/api/rewards/submissions/live?campaign=${addr}`),
        fetch(`/api/rewards/evidence/list?campaign=${addr}&limit=50`).catch(() => null),
      ]);

      let currentCpmRate = 0;

      if (cRes.ok) {
        const d = await cRes.json();
        if (!d.error) {
          setLiveCampaign(d);
          currentCpmRate = d.economics?.cpmRates?.[0] || 0;
        }
      }
      if (sRes.ok) {
        const d = await sRes.json();
        if (!d.error) {
          setLiveSubmissions(d.submissions || []);
          setLiveTotalEarned(d.totalEarned || 0);
          setLiveTotalViews(d.totalViews || 0);
        }
      }

      // Calculate velocity from evidence pack history
      if (eRes && eRes.ok) {
        try {
          const ed = await eRes.json();
          if (ed.packs && ed.packs.length >= 2 && currentCpmRate > 0) {
            const vel = calculateEarningsVelocity(ed.packs, currentCpmRate);
            setEarningsVelocity(vel.octasPerSecond);
            setViewsPerHour(vel.viewsPerHour);
          }
        } catch {}
      }

      setLastFetchTime(Date.now());
    } catch {} finally {
      setLiveLoading(false);
    }
  }, [addr]);

  useEffect(() => {
    fetchLiveData();
    refreshTimer.current = setInterval(fetchLiveData, REFRESH_INTERVAL);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [fetchLiveData]);

  // ── Submit handler ─────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!youtubeUrl.trim()) return;
    const creatorAddr = walletAddress || "0x196f88a51a6ce21bd854aef2065966db2ec1f2fb171894d2c8dc3ac529e12176";

    setVerifying(true);
    setError(null);
    setResult(null);
    setVisibleChecks(0);
    setShowPayout(false);

    try {
      const res = await fetch("/api/rewards/submit-and-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          campaignAddress: addr,
          creatorAddress: creatorAddr,
        }),
      });

      const data: SubmitResult = await res.json();

      if (!res.ok && data.status === "ineligible") {
        setResult(data);
        setVerifying(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setResult(data);

      // Animate checks appearing one by one
      const totalChecks = data.checks?.length || 0;
      for (let i = 1; i <= totalChecks; i++) {
        await new Promise(r => setTimeout(r, 280));
        setVisibleChecks(i);
      }

      // Show payout card after checks
      await new Promise(r => setTimeout(r, 400));
      setShowPayout(true);

      // Refresh live data
      setTimeout(fetchLiveData, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setVerifying(false);
    }
  }, [youtubeUrl, walletAddress, fetchLiveData]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setYoutubeUrl("");
    setVisibleChecks(0);
    setShowPayout(false);
  }, []);

  // ── Derived ────────────────────────────────────

  const cpmRate = liveCampaign?.economics?.cpmRates?.[0] ?? 0;
  const campaignName = liveCampaign?.name || "Campaign";
  const budgetTotal = liveCampaign?.budgetTotal ?? 0;
  const budgetRemaining = liveCampaign?.budgetRemaining ?? 0;
  const budgetUsedPct = budgetTotal > 0 ? ((budgetTotal - budgetRemaining) / budgetTotal) * 100 : 0;

  const totalFees = liveSubmissions.reduce((s, sub) => s + sub.feeAccumulated, 0);

  return (
    <div className="space-y-5 animate-enter">
      {/* Campaign Hero Card */}
      <div className="cr-card cr-card--hero p-5 sm:p-6">
        {/* Campaign header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[18px]">
              &#x25B6;
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-white tracking-[-0.02em]">
                {campaignName}
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
        {budgetTotal > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[12px] mb-1.5">
              <span className="text-[#7d7d7d]">Budget used</span>
              <span className="text-white font-medium font-mono tracking-[-0.01em]">
                ${formatUsd(budgetTotal - budgetRemaining)} / ${formatUsd(budgetTotal)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FA4616] to-[#ff7a4a] transition-all duration-1000"
                style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Hero stat + secondary metrics — no boxes */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[28px] font-bold text-green-400 font-mono tracking-tight">
              ${formatUsd(liveTotalEarned)}
            </span>
            <span className="text-[11px] text-[#7d7d7d]">earned</span>
          </div>
          <p className="text-[12px] text-zinc-500">
            {liveTotalViews >= 1_000_000 ? (liveTotalViews / 1_000_000).toFixed(1) + "M" : liveTotalViews >= 1_000 ? (liveTotalViews / 1_000).toFixed(1) + "K" : liveTotalViews.toString()} views across {liveSubmissions.length} clip{liveSubmissions.length !== 1 ? "s" : ""} &middot; ${formatUsd(cpmRate)}/1K rate
          </p>
        </div>

        {/* Segmented budget bar — payouts / fees / remaining as colored segments */}
        {budgetTotal > 0 && (() => {
          const spent = budgetTotal - budgetRemaining;
          const payoutPct = (liveTotalEarned / budgetTotal) * 100;
          const feePct = (totalFees / budgetTotal) * 100;
          const remainPct = 100 - payoutPct - feePct;
          return (
            <div>
              <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden flex">
                {payoutPct > 0 && (
                  <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${payoutPct}%` }} />
                )}
                {feePct > 0 && (
                  <div className="h-full bg-zinc-500 transition-all duration-1000" style={{ width: `${feePct}%` }} />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-zinc-500">Payouts</span>
                  <span className="text-white font-mono font-medium">${formatUsd(liveTotalEarned)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-500">Fees</span>
                  <span className="text-white font-mono font-medium">${formatUsd(totalFees)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-white/[0.04]" />
                  <span className="text-zinc-500">Left</span>
                  <span className="text-[#FA4616] font-mono font-medium">${formatUsd(budgetRemaining)}</span>
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Submit & Verify */}
      <div className="cr-card p-5 sm:p-6">
        <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
          Submit Clip
        </h3>

        {/* URL Input */}
        {!result && (
          <>
            <div className="flex gap-2">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube Shorts link..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white placeholder-zinc-600 outline-none focus:border-[#FA4616]/40 transition-colors"
                disabled={verifying}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={verifying || !youtubeUrl.trim()}
                className="px-5 py-3 rounded-xl bg-[#FA4616] text-white text-[13px] font-semibold hover:bg-[#e03d12] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Verifying...
                  </span>
                ) : "Submit & Pay"}
              </button>
            </div>

            {/* Sample URLs */}
            {!youtubeUrl && !verifying && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] text-zinc-600 self-center">Try:</span>
                {[
                  { label: "Paul Ranch clip", url: "https://youtube.com/shorts/kcGGSoaN2zA" },
                  { label: "Random video (will reject)", url: "https://youtube.com/shorts/dQw4w9WgXcQ" },
                ].map((sample) => (
                  <button
                    key={sample.url}
                    onClick={() => setYoutubeUrl(sample.url)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] text-red-400">
                {error}
              </div>
            )}
          </>
        )}

        {/* Ineligible */}
        {result?.status === "ineligible" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XIcon className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white">Content Rejected</div>
                  <div className="text-[11px] text-[#7d7d7d]">{(result.durationMs / 1000).toFixed(1)}s &middot; No USDT was sent</div>
                </div>
              </div>
              <button onClick={handleReset} className="text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors">
                Try Another
              </button>
            </div>
            {result.video && (
              <VideoCard title={result.video.title} channel={result.video.channelTitle} duration={result.video.durationSeconds} videoId={result.video.videoId} />
            )}

            {/* Show checks array if returned (content verification failure) */}
            {result.checks && result.checks.length > 0 ? (
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="px-4 py-2.5 bg-red-500/[0.04] border-b border-white/[0.04]">
                  <div className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">
                    Content Verification Failed
                  </div>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {result.checks.map((check) => (
                    <CheckRow key={check.id} check={check} visible={true} animating={false} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {result.issues?.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-[12px] text-red-400">
                    <XIcon className="w-3.5 h-3.5 shrink-0" />
                    {issue}
                  </div>
                ))}
              </div>
            )}

            {result.similarity && (
              <SimilarityGauge
                score={result.similarity.score}
                threshold={result.similarity.threshold}
                passed={result.similarity.passed}
              />
            )}

            <div className="px-4 py-3 rounded-xl bg-zinc-500/[0.06] border border-zinc-500/10 text-[11px] text-zinc-400">
              This video does not match the campaign&apos;s content requirements. Only clips from approved sources are eligible for payouts.
            </div>
          </div>
        )}

        {/* Verification Checklist (Success flow) */}
        {result && result.status !== "ineligible" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showPayout ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#FA4616] border-t-transparent animate-spin" />
                )}
                <div>
                  <div className="text-[14px] font-semibold text-white">
                    {showPayout
                      ? result.status === "views_updated"
                        ? "Verified & Tracking"
                        : "Verified & Paid"
                      : "Verifying Content..."}
                  </div>
                  <div className="text-[11px] text-[#7d7d7d]">
                    {result.isNewSubmission ? "New submission" : "Existing"} &middot; {(result.durationMs / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
              {showPayout && (
                <button onClick={handleReset} className="text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors">
                  New Clip
                </button>
              )}
            </div>

            {/* Video card */}
            {result.phase1 && (
              <VideoCard
                title={result.phase1.video.title}
                channel={result.phase1.video.channelTitle}
                duration={result.phase1.video.durationSeconds}
                videoId={result.phase1.video.videoId}
              />
            )}

            {/* Animated verification checks */}
            {result.checks && (
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
                  <div className="text-[10px] text-[#7d7d7d] uppercase tracking-wider font-semibold">
                    Content Verification
                  </div>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {result.checks.map((check, i) => (
                    <CheckRow
                      key={check.id}
                      check={check}
                      visible={i < visibleChecks}
                      animating={i === visibleChecks - 1 && !showPayout}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Similarity Score Gauge */}
            {showPayout && result.similarity && (
              <SimilarityGauge
                score={result.similarity.score}
                threshold={result.similarity.threshold}
                passed={result.similarity.passed}
              />
            )}

            {/* Payout card */}
            {showPayout && result.phase2 && (
              result.status === "views_updated" ? (
                <div className="rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20 p-5 text-center animate-enter">
                  <div className="text-[10px] text-yellow-400/70 uppercase tracking-wider mb-1">
                    Views Tracked &middot; Payout Accumulating
                  </div>
                  <div className="text-[24px] font-bold font-mono text-yellow-400 tracking-tight">
                    {result.phase2.viewCount.toLocaleString()} views
                  </div>
                  <div className="text-[11px] text-[#7d7d7d] mt-1">
                    {result.payoutSkipReason || "Payout below campaign minimum. Views accumulate until threshold is met."}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <MiniStat label="New Views" value={result.phase2.newViews.toLocaleString()} />
                    <MiniStat label="Bot Risk" value={result.phase2.botScore < 30 ? "Low" : result.phase2.botScore < 70 ? "Med" : "High"} color={result.phase2.botScore < 30 ? "text-green-400" : result.phase2.botScore < 70 ? "text-yellow-400" : "text-red-400"} />
                    <MiniStat label="Min Payout" value={result.phase2.minPayout ? `$${formatUsd(result.phase2.minPayout)}` : "N/A"} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-green-500/[0.06] border border-green-500/20 p-5 text-center animate-enter">
                  <div className="text-[10px] text-green-400/70 uppercase tracking-wider mb-1">
                    USDT Sent to Your Wallet
                  </div>
                  <div className="text-[32px] font-bold font-mono text-green-400 tracking-tight">
                    ${formatUsd(result.phase2.payoutAmount.creator)}
                  </div>
                  <div className="text-[11px] text-[#7d7d7d] mt-1">
                    {result.phase2.newViews.toLocaleString()} views &times; ${formatUsd(result.phase2.cpmRate)}/1K CPM &middot; 5% fee
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <MiniStat label="Views" value={result.phase2.viewCount.toLocaleString()} />
                    <MiniStat label="Likes" value={result.phase2.likeCount.toLocaleString()} />
                    <MiniStat label="Bot Risk" value={result.phase2.botScore < 30 ? "Low" : result.phase2.botScore < 70 ? "Med" : "High"} color={result.phase2.botScore < 30 ? "text-green-400" : result.phase2.botScore < 70 ? "text-yellow-400" : "text-red-400"} />
                    <MiniStat label="Fee" value={`$${formatUsd(result.phase2.payoutAmount.fee)}`} />
                  </div>
                </div>
              )
            )}

            {/* Receipt */}
            {showPayout && (
              <div className="rounded-xl border border-white/[0.06] overflow-hidden animate-enter">
                {/* Clickable links */}
                <div className="p-3 space-y-1.5">
                  {/* Payout or View Report tx — most important link */}
                  {result.phase2?.txHash && (
                    <ExplorerLink
                      label={result.status === "paid" ? "Payout Transaction" : "View Report Transaction"}
                      hash={result.phase2.txHash}
                      url={result.phase2.explorerUrl!}
                      color={result.status === "paid" ? "green" : "yellow"}
                    />
                  )}

                  {/* On-chain submission tx (new submissions only) */}
                  {result.phase1?.submitTxHash && (
                    <ExplorerLink
                      label="Submission Transaction"
                      hash={result.phase1.submitTxHash}
                      url={`https://explorer.aptoslabs.com/txn/${result.phase1.submitTxHash}?network=testnet`}
                      color="purple"
                    />
                  )}

                  {/* Shelby attestation */}
                  {result.phase1?.attestation ? (
                    <ExplorerLink
                      label="Shelby Attestation"
                      hash={result.phase1.attestation.blobName}
                      url={result.phase1.attestation.explorerUrl}
                      color="blue"
                    />
                  ) : result.receipt?.latestEvidence?.shelbyUrl ? (
                    <ExplorerLink
                      label="Evidence on Shelby"
                      hash={result.receipt.latestEvidence.shelbyBlob || result.receipt.latestEvidence.hash}
                      url={result.receipt.latestEvidence.shelbyUrl}
                      color="blue"
                    />
                  ) : null}

                  {/* Evidence explorer — always available */}
                  {result.receipt?.submissionAddress && (
                    <ExplorerLink
                      label="Evidence Explorer"
                      hash={`${result.receipt.latestEvidence?.hash.slice(0, 16) || "View"} — cryptographic proof of views & payouts`}
                      url={`/rewards/evidence?submission=${result.receipt.submissionAddress}`}
                      color="purple"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Submissions Feed */}
      {!liveLoading && liveSubmissions.length > 0 && (
        <div className="cr-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider">
              Live Earnings
            </h3>
            <button
              onClick={fetchLiveData}
              className="text-[10px] text-[#7d7d7d] hover:text-white px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            {liveSubmissions.map((sub) => {
              const statusLabel = sub.status === 0 ? "Tracking" : sub.status === 1 ? "Flagged" : "Completed";
              const statusColor = sub.status === 0 ? "text-green-400" : sub.status === 1 ? "text-red-400" : "text-blue-400";
              const vid = extractVideoId(sub.contentUrl);
              return (
                <div key={sub.address} className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    {vid ? (
                      <img
                        src={`https://img.youtube.com/vi/${vid}/default.jpg`}
                        alt=""
                        className="w-10 h-7 rounded object-cover shrink-0 bg-zinc-800"
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full ${sub.status === 0 ? "bg-green-500/10" : "bg-zinc-500/10"} flex items-center justify-center shrink-0`}>
                        {sub.status === 0 ? (
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        ) : (
                          <CheckIcon className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-[12px] text-white font-medium truncate max-w-[200px]">
                        {vid || sub.address.slice(0, 10) + "..."}
                      </div>
                      <div className="text-[10px] text-zinc-600">
                        {sub.viewsCurrent.toLocaleString()} views &middot;{" "}
                        <span className={statusColor}>{statusLabel}</span>
                        {sub.botScore > 0 && <> &middot; bot {sub.botScore}</>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-semibold text-green-400 font-mono">
                      +${formatUsd(sub.earnedCreator)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-3 text-[9px] text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/50 animate-pulse" />
            Auto-refreshing every 30s &middot; Keeper runs every 60s &middot; USDT paid on-chain instantly
          </div>
        </div>
      )}

      {/* Clips Carousel — floating, no container box */}
      {!liveLoading && liveSubmissions.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider">
              Your Clips
            </h3>
            <span className="text-[10px] text-[#7d7d7d]">
              {liveSubmissions.length} clip{liveSubmissions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ClipsCarousel
            submissions={liveSubmissions}
            cpmRate={liveCampaign?.economics?.cpmRates?.[0] ?? 0}
          />
        </div>
      )}

      {liveLoading && (
        <div className="cr-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#FA4616] border-t-transparent animate-spin" />
            <span className="text-[12px] text-zinc-400">Loading on-chain data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────

function CheckRow({ check, visible, animating }: { check: VerificationCheck; visible: boolean; animating: boolean }) {
  if (!visible) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 opacity-0">
        <div className="w-5 h-5" />
        <span className="text-[12px]">{check.label}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 ${animating ? "bg-white/[0.02]" : ""}`}
      style={{ animation: "fadeSlideIn 0.3s ease-out" }}
    >
      {/* Status icon */}
      {animating ? (
        <div className="w-5 h-5 rounded-full border-2 border-[#FA4616] border-t-transparent animate-spin shrink-0" />
      ) : check.passed ? (
        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckIcon className="w-3 h-3 text-green-400" />
        </div>
      ) : check.required ? (
        <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
          <XIcon className="w-3 h-3 text-red-400" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] text-yellow-400">!</span>
        </div>
      )}

      {/* Label */}
      <div className="flex-1 min-w-0">
        <span className={`text-[12px] ${check.passed ? "text-zinc-300" : check.required ? "text-red-400" : "text-yellow-400"}`}>
          {check.label}
        </span>
      </div>

      {/* Value */}
      <span className={`text-[11px] font-mono shrink-0 ${check.passed ? "text-[#7d7d7d]" : check.required ? "text-red-400/70" : "text-yellow-400/70"}`}>
        {check.value}
      </span>
    </div>
  );
}

function VideoCard({ title, channel, duration, videoId }: { title: string; channel: string; duration: number; videoId?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
      {videoId && (
        <img
          src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
          alt=""
          className="w-16 h-12 rounded-lg object-cover shrink-0 bg-zinc-800"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-white truncate">{title}</div>
        <div className="text-[10px] text-[#7d7d7d] mt-0.5">
          {channel} &middot; {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
}

function ExplorerLink({ label, hash, url, color }: { label: string; hash: string; url: string; color: "green" | "purple" | "blue" | "yellow" }) {
  const colors = {
    green: "bg-green-500/10 text-green-400",
    purple: "bg-[#FA4616]/10 text-[#FA4616]",
    blue: "bg-blue-500/10 text-blue-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
  };
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors group"
    >
      <div className={`w-6 h-6 rounded-lg ${colors[color]} flex items-center justify-center shrink-0`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-zinc-600">{label}</div>
        <div className="text-[11px] font-mono text-zinc-400 truncate group-hover:text-zinc-300 transition-colors">
          {hash}
        </div>
      </div>
    </a>
  );
}

function SimilarityGauge({ score, threshold, passed }: { score: number; threshold: number; passed: boolean }) {
  const color = passed
    ? score >= 80 ? "text-green-400" : "text-green-400"
    : score >= threshold * 0.7 ? "text-yellow-400" : "text-red-400";
  const bgColor = passed ? "bg-green-500/[0.06] border-green-500/20" : "bg-red-500/[0.06] border-red-500/20";
  const barColor = passed ? "bg-green-500" : score >= threshold * 0.7 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className={`rounded-xl ${bgColor} border p-4 animate-enter`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[12px] font-semibold text-white">Content Similarity</span>
        </div>
        <span className={`text-[20px] font-bold font-mono ${color}`}>{score}%</span>
      </div>
      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-[-2px] w-0.5 h-3 bg-white/40"
          style={{ left: `${threshold}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-zinc-600">0%</span>
        <span className="text-[9px] text-[#7d7d7d]">
          {passed ? "Passes" : "Below"} {threshold}% threshold
        </span>
        <span className="text-[9px] text-zinc-600">100%</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.03]">
      <div className={`text-[13px] font-bold font-mono ${color || "text-white"}`}>{value}</div>
      <div className="text-[8px] text-zinc-600 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
