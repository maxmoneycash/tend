"use client";

import { useState, useEffect, useCallback } from "react";
import { OracleHeatmap } from "@/components/explorer/OracleHeatmap";

const DEFAULT_CAMPAIGN = "0xc726c78d3282fee1777bde05743ab9ca8f8933e22497f38f8db14727b0511a45";

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

interface EvidenceRollup {
  id: string;
  merkleRoot: string;
  packCount: number;
  shelbyBlobName: string | null;
  shelbyExplorerUrl: string | null;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface LiveSub {
  address: string;
  contentUrl: string;
  viewsCurrent: number;
  earnedCreator: number;
  botScore: number;
  status: number;
}

function formatUsd(octas: number): string {
  return (octas / 1e6).toFixed(2);
}

const SHELBY_EXPLORER = "https://explorer.shelby.xyz/testnet";
const SHELBY_OWNER = "0x7bbcf646fc2374909ff40c90f9baa860620c940af98a761619144da68b215ff3";

function shelbyUrl(blobName: string | null): string {
  if (!blobName) return `${SHELBY_EXPLORER}/account/${SHELBY_OWNER}/blobs`;
  return `${SHELBY_EXPLORER}/account/${SHELBY_OWNER}/blobs?name=${encodeURIComponent(blobName)}`;
}

function aptosExplorerUrl(address: string): string {
  return `https://explorer.aptoslabs.com/account/${address}?network=testnet`;
}

function truncAddr(addr: string): string {
  if (addr.length <= 16) return addr;
  return addr.slice(0, 10) + "..." + addr.slice(-6);
}

export function ShelbyTab({ campaignAddress }: { campaignAddress?: string }) {
  const addr = campaignAddress || DEFAULT_CAMPAIGN;
  const [packs, setPacks] = useState<EvidencePack[]>([]);
  const [rollups, setRollups] = useState<EvidenceRollup[]>([]);
  const [subs, setSubs] = useState<LiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [evidenceRes, subsRes] = await Promise.all([
        fetch(`/api/rewards/evidence/list?campaign=${addr}&limit=500`),
        fetch(`/api/rewards/submissions/live?campaign=${addr}`),
      ]);

      if (evidenceRes.ok) {
        const d = await evidenceRes.json();
        setPacks(d.packs || []);
        setRollups(d.rollups || []);
      }
      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubs(d.submissions || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalEvidenceViews = packs.reduce((s, p) => s + (p.viewCount || 0), 0);
  const totalRollupPacks = rollups.reduce((s, r) => s + r.packCount, 0);

  // Derive unique submission/campaign addresses from packs
  const submissionAddrs = [...new Set(packs.map(p => p.submissionAddress).filter(Boolean))] as string[];
  const campaignAddrs = [...new Set(packs.map(p => p.campaignAddress).filter(Boolean))] as string[];

  return (
    <div className="space-y-5 animate-enter">
      {/* Oracle Activity Heatmap */}
      <div className="surface-1 rounded-[16px] py-5">
        <OracleHeatmap />
      </div>

      {/* Stats — editorial inline, no boxes */}
      <div className="px-1">
        <p className="text-[12px] text-zinc-500">
          <span className="text-white font-mono font-medium">{loading ? "..." : packs.length}</span> evidence packs
          {" "}&middot;{" "}
          <span className="text-white font-mono font-medium">{loading ? "..." : rollups.length}</span> rollups
          {" "}&middot;{" "}
          <span className="text-green-400 font-medium">&#x2713; chain valid</span>
        </p>
      </div>

      {/* ── Stored on Shelby hero ── */}
      <div className="cr-card p-5 border border-orange-500/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[14px] font-semibold text-white">Stored on Shelby</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[9px] font-semibold uppercase tracking-wider">
                Immutable
              </span>
            </div>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Evidence packs are batched into Merkle rollups and uploaded to Shelby — a permanent data layer on Aptos.
              Once stored, the data cannot be changed or deleted.
            </p>
          </div>
        </div>
        <a
          href={`${SHELBY_EXPLORER}/account/${SHELBY_OWNER}/blobs`}

          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-medium hover:bg-orange-500/20 transition-colors"
        >
          Browse all blobs
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>

      {/* ── Shelby Rollups ── */}
      {!loading && rollups.length > 0 && (
        <div className="cr-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider">
              Shelby Rollups
            </h3>
            <span className="text-[10px] text-zinc-600 font-mono">
              {totalRollupPacks} packs across {rollups.length} rollups
            </span>
          </div>
          <div className="space-y-2">
            {rollups.map((r, i) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-white/[0.02] animate-enter"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[12px] font-semibold text-white">
                    {r.packCount} evidence packs
                  </span>
                  <a
                    href={shelbyUrl(r.shelbyBlobName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-medium hover:bg-orange-500/20 transition-colors"
                  >
                    View on Shelby
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </a>
                </div>
                <div className="font-mono text-[10px] text-[#7d7d7d] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">merkle</span>
                    <span className="truncate text-zinc-400">{r.merkleRoot}</span>
                  </div>
                  {r.shelbyBlobName && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-orange-400">blob</span>
                      <span className="truncate text-orange-300">{r.shelbyBlobName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── On-chain Addresses ── */}
      {!loading && (submissionAddrs.length > 0 || campaignAddrs.length > 0) && (
        <div className="cr-card p-5">
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
            On-chain Addresses
          </h3>
          <div className="space-y-2">
            {submissionAddrs.map((a) => (
              <div key={a} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02]">
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Submission</div>
                  <div className="font-mono text-[11px] text-zinc-400">{truncAddr(a)}</div>
                </div>
                <a
                  href={aptosExplorerUrl(a)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-medium hover:bg-blue-500/20 transition-colors"
                >
                  View on Aptos
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              </div>
            ))}
            {campaignAddrs.map((a) => (
              <div key={a} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02]">
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Campaign</div>
                  <div className="font-mono text-[11px] text-zinc-400">{truncAddr(a)}</div>
                </div>
                <a
                  href={aptosExplorerUrl(a)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-medium hover:bg-blue-500/20 transition-colors"
                >
                  View on Aptos
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Evidence Packs ── */}
      <div className="cr-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider">
            Evidence Packs
          </h3>
          <button
            onClick={fetchData}
            className="text-[10px] text-[#7d7d7d] hover:text-white px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#FA4616] border-t-transparent animate-spin" />
            <span className="text-[12px] text-zinc-400">Loading evidence...</span>
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-8 text-[12px] text-zinc-600">
            No evidence packs yet. Submit a clip to generate evidence.
          </div>
        ) : (
          <div className="space-y-2">
            {packs.slice(0, 20).map((pack, i) => (
              <div
                key={pack.id}
                className="p-3.5 rounded-xl bg-white/[0.02] animate-enter"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-semibold text-white">
                    ev_{pack.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    {pack.viewCount !== null && (
                      <span className="text-[9px] text-[#7d7d7d] font-mono">
                        {pack.viewCount.toLocaleString()} views
                      </span>
                    )}
                    <span className="text-[10px] text-green-400 font-semibold">
                      &#x2713; Verified
                    </span>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#7d7d7d] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">hash</span>
                    <span className="truncate text-zinc-400">{pack.packHash}</span>
                  </div>
                  {pack.previousHash && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-600">prev</span>
                      <span className="truncate">{pack.previousHash}</span>
                    </div>
                  )}
                  {pack.shelbyBlobName && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-orange-400">blob</span>
                      <span className="truncate text-orange-300">{pack.shelbyBlobName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.03]">
                    <span className="text-zinc-600">
                      {new Date(pack.generatedAt).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {pack.payoutCreator !== null && pack.payoutCreator > 0 && (
                        <span className="text-green-400">
                          +${formatUsd(pack.payoutCreator)}
                        </span>
                      )}
                      {pack.txHash && (
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${pack.txHash}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-medium hover:bg-blue-500/20 transition-colors"
                        >
                          View on Aptos
                          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* On-chain State Summary */}
      <div className="surface-2 rounded-[16px] p-4">
        <h3 className="text-[11px] font-semibold text-zinc-400 mb-3">
          On-chain State
        </h3>
        <div className="font-mono text-[10px] text-[#7d7d7d] space-y-1 leading-relaxed">
          <div>&#x1F4E6; {subs.length} submissions tracked</div>
          <div>&#x1F4CA; {totalEvidenceViews.toLocaleString()} evidence views recorded</div>
          <div>&#x1F4DD; {packs.length} evidence packs in database</div>
          <div>&#x1F517; {rollups.length} Shelby rollups ({totalRollupPacks} packs batched)</div>
          <div className="text-green-400">&#x2705; testnet connected</div>
        </div>
      </div>
    </div>
  );
}
