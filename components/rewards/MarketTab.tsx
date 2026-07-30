"use client";

import { useState, useEffect } from "react";
import { CRCard, CRCardHero } from "./CRCard";

/* ── types ─────────────────────────────────────────────────────── */

interface Product {
  id: string;
  title: string;
  route: string;
  member_count: number;
  avg_stars: number | null;
  total_reviews: number;
  pct_5_star?: number;
  pct_paid_reviewers?: number;
  star_distribution?: Record<string, number>;
  payout_rate_per_1k: number | null;
  price: string | null;
  company_title: string | null;
  category: string;
  product_type: string;
  verified: boolean;
}

interface Ecosystem {
  total_campaigns: number;
  total_members: number;
  with_payout_rates: number;
  avg_payout_per_1k: number | null;
  min_payout: number | null;
  max_payout: number | null;
  by_type: { type: string; count: number }[];
}

interface Review {
  id: string;
  title: string | null;
  description: string;
  stars: number;
  created_at: string;
  user: { id: string; name: string; username: string };
}

interface Creator {
  id: string;
  username: string;
  name: string;
  total_earnings: number | null;
  whops_count: number;
}

interface TrendingItem {
  rank: number;
  product_name: string;
  company_name: string | null;
  growth_pct: number | null;
  abs_change: number | null;
  users: number | null;
  category: string | null;
}

interface InsuranceVault {
  id: string;
  campaignTitle: string;
  brandName: string;
  tvl: number;
  apy: number;
  coverage: number;
  disputes: number;
  approvalRating: number;
  approvalTrend: "up" | "down" | "stable";
  totalStakers: number;
  riskTier: "low" | "medium" | "high";
  premium: number;
  members: number;
  route: string;
}

/* ── helpers ───────────────────────────────────────────────────── */

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

function disputeRate(p: Product): number {
  const ones = p.star_distribution?.["1"] ?? 0;
  return p.total_reviews > 0 ? (ones / p.total_reviews) * 100 : 0;
}

type ComplaintCategory = "scam" | "no_payment" | "rejection" | "no_response" | "billing" | "other";

function categorizeComplaint(text: string): ComplaintCategory {
  const t = text.toLowerCase();
  if (/scam|fraud|fake|steal|theft/.test(t)) return "scam";
  if (/pay|paid|money|payout|earning/.test(t)) return "no_payment";
  if (/reject|denied|disapprov|decline/.test(t)) return "rejection";
  if (/ignor|response|reply|ghost|silent/.test(t)) return "no_response";
  if (/cancel|refund|charge|subscript/.test(t)) return "billing";
  return "other";
}

const COMPLAINT_LABELS: Record<ComplaintCategory, { label: string; color: string }> = {
  scam: { label: "Scam", color: "text-red-400 bg-red-500/10" },
  no_payment: { label: "Non-payment", color: "text-orange-400 bg-orange-500/10" },
  rejection: { label: "Unfair rejection", color: "text-yellow-400 bg-yellow-500/10" },
  no_response: { label: "Ghosting", color: "text-orange-400 bg-orange-500/10" },
  billing: { label: "Billing", color: "text-blue-400 bg-blue-500/10" },
  other: { label: "Other", color: "text-zinc-400 bg-zinc-500/10" },
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  high: "text-red-400 bg-red-500/10",
};

// Deterministic pseudo-random from string seed
function seededRand(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return Math.abs(h % 1000) / 1000;
}

function generateVaults(campaigns: Product[]): InsuranceVault[] {
  return campaigns
    .filter((p) => p.total_reviews >= 3 && p.avg_stars !== null)
    .map((p) => {
      const rating = p.avg_stars!;
      const dr = disputeRate(p);
      const riskTier: "low" | "medium" | "high" = rating >= 4 ? "low" : rating >= 3 ? "medium" : "high";
      const baseApy = riskTier === "low" ? 6 : riskTier === "medium" ? 12 : 20;
      const price = parseFloat(p.price || "29") || 29;
      const tvl = Math.round(p.member_count * price * (riskTier === "low" ? 0.12 : riskTier === "medium" ? 0.08 : 0.05));
      const exposure = dr > 0 ? (dr / 100) * p.total_reviews * price * 2 : 1;
      const coverage = Math.min(tvl / exposure, 20);
      const r = seededRand(p.id);

      return {
        id: p.id,
        campaignTitle: p.title,
        brandName: p.company_title || "Unknown",
        tvl,
        apy: parseFloat((baseApy + r * 5).toFixed(1)),
        coverage: parseFloat(coverage.toFixed(1)),
        disputes: p.star_distribution?.["1"] ?? 0,
        approvalRating: rating,
        approvalTrend: (rating > 4 ? "up" : rating < 2.5 ? "down" : "stable") as InsuranceVault["approvalTrend"],
        totalStakers: Math.max(1, Math.floor(p.member_count * 0.02 + r * 10)),
        riskTier,
        premium: riskTier === "low" ? 2 : riskTier === "medium" ? 5 : 8,
        members: p.member_count,
        route: p.route,
      };
    })
    .sort((a, b) => b.tvl - a.tvl);
}

function mockEvidenceHash(seed: string, i: number): string {
  const chars = "0123456789abcdef";
  let h = "";
  for (let j = 0; j < 64; j++) {
    h += chars[Math.abs(((seed.charCodeAt(j % seed.length) * (i + 1) * (j + 7)) >> 2) % 16)];
  }
  return "0x" + h;
}

/* ── SVG icons ─────────────────────────────────────────────────── */

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

/* Card wrappers imported from ./CRCard */

/* ── sub-view: health overview ─────────────────────────────────── */

function HealthOverview({
  campaigns,
  ecosystem,
  vaults,
}: {
  campaigns: Product[];
  ecosystem: Ecosystem | null;
  vaults: InsuranceVault[];
}) {
  const rated = campaigns.filter((p) => p.avg_stars !== null && p.total_reviews > 0);
  const tiers = {
    excellent: rated.filter((p) => p.avg_stars! >= 4.5),
    good: rated.filter((p) => p.avg_stars! >= 4.0 && p.avg_stars! < 4.5),
    mixed: rated.filter((p) => p.avg_stars! >= 3.0 && p.avg_stars! < 4.0),
    poor: rated.filter((p) => p.avg_stars! >= 2.0 && p.avg_stars! < 3.0),
    terrible: rated.filter((p) => p.avg_stars! < 2.0),
  };

  const totalReviews = rated.reduce((s, p) => s + p.total_reviews, 0);
  const avgRating = rated.length > 0 ? rated.reduce((s, p) => s + p.avg_stars!, 0) / rated.length : 0;
  const disputed = rated.filter((p) => p.avg_stars! < 3.5 && p.total_reviews >= 5);

  const totalTvl = vaults.reduce((s, v) => s + v.tvl, 0);
  const avgApy = vaults.length > 0 ? vaults.reduce((s, v) => s + v.apy, 0) / vaults.length : 0;

  const tierData = [
    { label: "Excellent", range: "4.5+", count: tiers.excellent.length, color: "bg-[#FA4616]", pct: rated.length > 0 ? (tiers.excellent.length / rated.length) * 100 : 0 },
    { label: "Good", range: "4.0-4.5", count: tiers.good.length, color: "bg-[#ff7a4a]", pct: rated.length > 0 ? (tiers.good.length / rated.length) * 100 : 0 },
    { label: "Mixed", range: "3.0-4.0", count: tiers.mixed.length, color: "bg-yellow-500", pct: rated.length > 0 ? (tiers.mixed.length / rated.length) * 100 : 0 },
    { label: "Poor", range: "2.0-3.0", count: tiers.poor.length, color: "bg-orange-500", pct: rated.length > 0 ? (tiers.poor.length / rated.length) * 100 : 0 },
    { label: "Terrible", range: "<2.0", count: tiers.terrible.length, color: "bg-red-500", pct: rated.length > 0 ? (tiers.terrible.length / rated.length) * 100 : 0 },
  ];

  return (
    <div className="space-y-5">
      {/* ── Shelby Protection Hero ── */}
      <CRCardHero>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#FA4616]/20 border border-[#FA4616]/30 flex items-center justify-center">
              <ShieldIcon className="w-5 h-5 text-[#FA4616]" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-white tracking-[-0.02em]">Shelby Insurance Protocol</h3>
              <p className="text-[12px] text-[#7d7d7d] tracking-[-0.01em]">Decentralized dispute resolution on Aptos</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total TVL", value: fmtUsd(totalTvl), color: "text-[#FA4616]" },
              { label: "Avg APY", value: avgApy.toFixed(1) + "%", color: "text-green-400" },
              { label: "Active Vaults", value: vaults.length.toString(), color: "text-white" },
            ].map((s) => (
              <div key={s.label} className="cr-stat text-center">
                <div className={`text-[22px] font-bold tracking-[-0.02em] ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-[#7d7d7d] uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
      </CRCardHero>

      {/* ── Market Stats + Payout Rates ── */}
      <CRCard>
          <div className="flex items-center gap-4 divide-x divide-white/[0.06]">
            {[
              { label: "Campaigns", value: ecosystem?.total_campaigns.toLocaleString() ?? "—" },
              { label: "Members", value: ecosystem ? fmtNum(ecosystem.total_members) : "—" },
              { label: "Avg Rating", value: avgRating > 0 ? avgRating.toFixed(1) + " ★" : "—", highlight: avgRating < 3.5 },
              { label: "Disputed", value: disputed.length.toString(), highlight: disputed.length > 0 },
            ].map((s, i) => (
              <div key={s.label} className={`flex-1 text-center ${i > 0 ? "pl-4" : ""}`}>
                <div className={`text-[24px] font-bold tracking-[-0.02em] ${s.highlight ? "text-red-400" : "text-white"}`}>
                  {s.value}
                </div>
                <div className="text-[10px] text-[#7d7d7d] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {ecosystem && (
            <>
              <div className="h-px bg-white/[0.06] my-5" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7d7d7d] uppercase tracking-wider">Payout Rates</span>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[11px] text-[#7d7d7d] mr-2">Min</span>
                    <span className="text-[15px] font-bold text-zinc-400 tracking-[-0.02em] font-mono">${ecosystem.min_payout ?? "—"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#7d7d7d] mr-2">Avg</span>
                    <span className="text-[15px] font-bold text-white tracking-[-0.02em] font-mono">${ecosystem.avg_payout_per_1k ?? "—"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#7d7d7d] mr-2">Max</span>
                    <span className="text-[15px] font-bold text-green-400 tracking-[-0.02em] font-mono">${ecosystem.max_payout ?? "—"}</span>
                  </div>
                </div>
              </div>
            </>
          )}
      </CRCard>

      {/* ── Approval Distribution ── */}
      <CRCard>
          <h3 className="text-[11px] font-semibold text-[#7d7d7d] uppercase tracking-wider mb-5">
            Approval Distribution
          </h3>
          <div className="space-y-3">
            {tierData.map((t) => (
              <div key={t.label} className="group flex items-center gap-3">
                <div className="w-20 flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-zinc-300 font-medium">{t.label}</span>
                </div>
                <div className="flex-1 h-6 rounded-lg bg-black/40 overflow-hidden border border-white/[0.04]">
                  <div
                    className={`h-full rounded-lg ${t.color} transition-all duration-700`}
                    style={{ width: `${Math.max(t.pct, 2)}%` }}
                  />
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="text-[13px] text-white font-semibold font-mono">{t.count}</span>
                  <span className="text-[11px] text-zinc-600 ml-1.5">({t.pct.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06] text-center">
            <span className="text-[11px] text-[#7d7d7d]">
              {totalReviews.toLocaleString()} reviews across {rated.length} campaigns
            </span>
          </div>
      </CRCard>
    </div>
  );
}

/* ── sub-view: disputes ────────────────────────────────────────── */

function DisputeList({
  campaigns,
  onSelect,
}: {
  campaigns: Product[];
  onSelect: (route: string) => void;
}) {
  const disputed = campaigns
    .filter((p) => p.avg_stars !== null && p.avg_stars < 3.5 && p.total_reviews >= 3)
    .sort((a, b) => b.total_reviews - a.total_reviews);

  const totalDisputeReviews = disputed.reduce((s, p) => s + p.total_reviews, 0);
  const totalDisputeMembers = disputed.reduce((s, p) => s + p.member_count, 0);

  return (
    <div className="space-y-5">
      {/* Shelby resolution banner */}
      <div className="cr-card-subtle px-5 py-4">
        <div className="flex items-center gap-3">
          <ShieldIcon className="w-5 h-5 text-[#FA4616] shrink-0" />
          <div>
            <div className="text-[12px] font-semibold text-white">Evidence-Backed Dispute Resolution</div>
            <div className="text-[10px] text-[#7d7d7d]">
              Each dispute is paired with cryptographic evidence packs stored on Shelby. LP reviewers adjudicate claims.
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Flagged Campaigns", value: disputed.length, color: "text-red-400" },
          { label: "Affected Members", value: fmtNum(totalDisputeMembers), color: "text-orange-400" },
          { label: "Dispute Reviews", value: totalDisputeReviews.toLocaleString(), color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="cr-stat px-3 py-3 text-center">
            <div className={`text-[18px] font-bold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-[#7d7d7d] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      <CRCard>
        <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
          Disputed Campaigns
        </h3>
        {disputed.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-[13px]">No disputed campaigns found</div>
        ) : (
          <div className="space-y-1.5">
            {disputed.map((p) => {
              const dr = disputeRate(p);
              const ones = p.star_distribution?.["1"] ?? 0;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.route)}
                  className="w-full flex items-center gap-3 py-3 px-3.5 rounded-xl bg-black/30 border border-white/[0.06] hover:bg-white/[0.05] transition-colors text-left"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-[14px] font-bold font-display ${
                    p.avg_stars! < 2 ? "bg-red-500/15 text-red-400"
                    : p.avg_stars! < 3 ? "bg-orange-500/15 text-orange-400"
                    : "bg-yellow-500/15 text-yellow-400"
                  }`}>
                    {p.avg_stars!.toFixed(1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white truncate">{p.title}</span>
                      {p.verified && (
                        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7d7d7d] truncate">
                      {p.company_title || "-"} &middot; {fmtNum(p.member_count)} members
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] text-red-400 font-mono font-medium">
                      {dr.toFixed(0)}% dispute
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      {ones}/{p.total_reviews} 1-star
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CRCard>
    </div>
  );
}

/* ── sub-view: campaign detail (enhanced with Shelby) ─────────── */

function CampaignDetail({
  route,
  onBack,
  vault,
}: {
  route: string;
  onBack: () => void;
  vault: InsuranceVault | null;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/whop/products/${route}`).then((r) => r.json()),
      fetch(`/api/whop/reviews?product=${route}&limit=100`).then((r) => r.json()),
    ]).then(([pData, rData]) => {
      if (!pData.error) setProduct(pData);
      if (!rData.error) setReviews(rData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [route]);

  if (loading) {
    return (
      <CRCard padding="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 bg-white/[0.06] rounded" />
          <div className="h-20 bg-white/[0.04] rounded-xl" />
          <div className="h-20 bg-white/[0.04] rounded-xl" />
        </div>
      </CRCard>
    );
  }

  if (!product) {
    return (
      <CRCard padding="p-6">
        <div className="text-center">
        <p className="text-[#7d7d7d] text-[13px]">Campaign not found</p>
        <button onClick={onBack} className="mt-3 text-[12px] text-[#FA4616] hover:underline">Back</button>
        </div>
      </CRCard>
    );
  }

  const oneStarReviews = reviews.filter((r) => r.stars <= 2);
  const fiveStarReviews = reviews.filter((r) => r.stars >= 4);

  const complaints: Record<ComplaintCategory, Review[]> = {
    scam: [], no_payment: [], rejection: [], no_response: [], billing: [], other: [],
  };
  for (const r of oneStarReviews) {
    complaints[categorizeComplaint(r.description)].push(r);
  }
  const complaintEntries = (Object.entries(complaints) as [ComplaintCategory, Review[]][])
    .filter(([, arr]) => arr.length > 0)
    .sort((a, b) => b[1].length - a[1].length);

  const starCounts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    if (r.stars >= 1 && r.stars <= 5) starCounts[r.stars - 1]++;
  }
  const maxStarCount = Math.max(...starCounts, 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <CRCard>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white truncate tracking-[-0.02em]">{product.title}</h3>
            <p className="text-[11px] text-[#7d7d7d]">{product.company_title} &middot; {product.category}</p>
          </div>
          <div className={`text-[22px] font-bold font-display ${
            product.avg_stars! < 2 ? "text-red-400" : product.avg_stars! < 3 ? "text-orange-400" : "text-yellow-400"
          }`}>
            {product.avg_stars?.toFixed(1) ?? "-"} *
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Members", value: fmtNum(product.member_count) },
            { label: "Reviews", value: product.total_reviews.toString() },
            { label: "1-Star %", value: reviews.length > 0 ? (oneStarReviews.length / reviews.length * 100).toFixed(0) + "%" : "-", danger: true },
            { label: "Rate", value: product.payout_rate_per_1k ? `$${product.payout_rate_per_1k}/1K` : "-" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-[16px] font-bold font-display ${s.danger ? "text-red-400" : "text-white"}`}>{s.value}</div>
              <div className="text-[10px] text-[#7d7d7d]">{s.label}</div>
            </div>
          ))}
        </div>
      </CRCard>

      {/* Star histogram */}
      <CRCard>
        <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
          Rating Breakdown
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star - 1];
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            const barColor = star >= 4 ? "bg-green-500" : star === 3 ? "bg-yellow-500" : star === 2 ? "bg-orange-500" : "bg-red-500";
            return (
              <div key={star} className="flex items-center gap-2.5">
                <span className="text-[11px] text-zinc-400 w-6 text-right shrink-0">{star} *</span>
                <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${(count / maxStarCount) * 100}%` }} />
                </div>
                <span className="text-[11px] text-[#7d7d7d] w-14 text-right shrink-0 font-mono">
                  {count} <span className="text-zinc-700">({pct.toFixed(0)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </CRCard>

      {/* Complaint breakdown */}
      {complaintEntries.length > 0 && (
        <CRCard>
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
            Complaint Analysis &middot; {oneStarReviews.length} negative reviews
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {complaintEntries.map(([cat, arr]) => {
              const meta = COMPLAINT_LABELS[cat];
              return (
                <span key={cat} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${meta.color}`}>
                  {meta.label}
                  <span className="opacity-60">{arr.length}</span>
                </span>
              );
            })}
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {oneStarReviews.sort((a, b) => a.stars - b.stars).map((r) => {
              const cat = categorizeComplaint(r.description);
              const meta = COMPLAINT_LABELS[cat];
              return (
                <div key={r.id} className="py-2.5 px-3 rounded-xl bg-black/30 border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-zinc-400">@{r.user.username}</span>
                    <span className="text-red-400 text-[11px]">{"*".repeat(r.stars)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
                  </div>
                  <p className="text-[12px] text-zinc-300 leading-relaxed">
                    {r.description || <span className="text-zinc-600 italic">No description</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </CRCard>
      )}

      {/* Shelby Resolution Protocol */}
      {oneStarReviews.length > 0 && (
        <CRCardHero>
          <div className="flex items-center gap-2 mb-4">
            <ShieldIcon className="w-4 h-4 text-[#FA4616]" />
            <h3 className="text-[11px] font-display font-semibold text-[#FA4616] uppercase tracking-wider">
              Shelby Resolution Protocol
            </h3>
          </div>

          <p className="text-[12px] text-zinc-400 mb-4 leading-relaxed">
            With Shelby, each of these {oneStarReviews.length} disputes would generate cryptographic evidence packs.
            LP reviewers in the insurance vault adjudicate claims using immutable proof.
          </p>

          {/* Evidence pack samples for this campaign's disputes */}
          <div className="space-y-2 mb-4">
            {complaintEntries.slice(0, 3).map(([cat, arr], i) => {
              const meta = COMPLAINT_LABELS[cat];
              const hash = mockEvidenceHash(route + cat, i);
              const prevHash = i > 0 ? mockEvidenceHash(route + cat, i - 1) : null;
              return (
                <div key={cat} className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {arr.length} case{arr.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#FA4616] font-medium">Evidence Ready</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#7d7d7d] space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-600">hash</span>
                      <span className="truncate text-zinc-400">{hash}</span>
                    </div>
                    {prevHash && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-600">prev</span>
                        <span className="truncate">{prevHash}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-orange-400">blob</span>
                      <span className="truncate text-orange-300">shelby://evidence/{route}/{cat}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vault coverage for this campaign */}
          {vault && (
            <div className="cr-stat p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-white">Insurance Vault Coverage</div>
                  <div className="text-[10px] text-[#7d7d7d]">
                    {fmtUsd(vault.tvl)} TVL &middot; {vault.coverage.toFixed(1)}x coverage &middot; {vault.totalStakers} stakers
                  </div>
                </div>
                <div className={`text-[11px] font-medium px-2 py-1 rounded-lg ${RISK_COLORS[vault.riskTier]}`}>
                  {vault.riskTier.charAt(0).toUpperCase() + vault.riskTier.slice(1)} Risk
                </div>
              </div>
            </div>
          )}
        </CRCardHero>
      )}

      {/* Positive reviews */}
      {fiveStarReviews.length > 0 && (
        <CRCard>
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
            Positive Reviews &middot; {fiveStarReviews.length}
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {fiveStarReviews.slice(0, 10).map((r) => (
              <div key={r.id} className="py-2 px-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-zinc-400">@{r.user.username}</span>
                  <span className="text-green-400 text-[11px]">{"*".repeat(r.stars)}</span>
                </div>
                <p className="text-[12px] text-zinc-300 leading-relaxed">
                  {r.description || <span className="text-zinc-600 italic">No description</span>}
                </p>
              </div>
            ))}
          </div>
        </CRCard>
      )}
    </div>
  );
}

/* ── sub-view: insurance vaults ───────────────────────────────── */

function VaultsOverview({
  vaults,
  onSelectVault,
}: {
  vaults: InsuranceVault[];
  onSelectVault: (id: string) => void;
}) {
  const totalTvl = vaults.reduce((s, v) => s + v.tvl, 0);
  const avgApy = vaults.length > 0 ? vaults.reduce((s, v) => s + v.apy, 0) / vaults.length : 0;
  const totalStakers = vaults.reduce((s, v) => s + v.totalStakers, 0);
  const totalDisputes = vaults.reduce((s, v) => s + v.disputes, 0);
  const lowRisk = vaults.filter((v) => v.riskTier === "low");
  const medRisk = vaults.filter((v) => v.riskTier === "medium");
  const highRisk = vaults.filter((v) => v.riskTier === "high");

  return (
    <div className="space-y-5">
      {/* How it works */}
      <CRCardHero>
        <div className="flex items-center gap-2 mb-3">
          <LockIcon className="w-5 h-5 text-[#FA4616]" />
          <h3 className="text-[16px] font-semibold text-white tracking-[-0.02em]">Content Rewards Insurance</h3>
        </div>
        <p className="text-[13px] text-[#7d7d7d] leading-relaxed mb-5 tracking-[-0.01em]">
          Deposit USDT into campaign insurance vaults. Earn yield from brand premiums while providing
          dispute coverage. Review Shelby evidence packs to adjudicate claims.
        </p>
        <div className="grid grid-cols-3 gap-3 text-[11px]">
          {[
            { step: "1", title: "Deposit", desc: "LP into a campaign vault" },
            { step: "2", title: "Earn", desc: "Yield from brand premiums" },
            { step: "3", title: "Review", desc: "Vote on dispute evidence" },
          ].map((s) => (
            <div key={s.step} className="text-center px-3 py-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-[20px] font-bold text-[#FA4616] font-display mb-1">{s.step}</div>
              <div className="font-semibold text-white text-[12px] tracking-[-0.01em]">{s.title}</div>
              <div className="text-[#7d7d7d] text-[11px]">{s.desc}</div>
            </div>
          ))}
        </div>
      </CRCardHero>

      {/* Ecosystem stats */}
      <CRCard>
        <div className="flex items-center gap-4 divide-x divide-white/[0.06]">
          {[
            { label: "Total TVL", value: fmtUsd(totalTvl), color: "text-[#FA4616]" },
            { label: "Avg APY", value: avgApy.toFixed(1) + "%", color: "text-green-400" },
            { label: "Stakers", value: fmtNum(totalStakers), color: "text-white" },
            { label: "Open Disputes", value: fmtNum(totalDisputes), color: "text-red-400" },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 text-center ${i > 0 ? "pl-4" : ""}`}>
              <div className={`text-[24px] font-bold font-display tracking-[-0.02em] ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#7d7d7d] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </CRCard>

      {/* Risk distribution */}
      <CRCard>
        <h3 className="text-[11px] font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
          Vault Risk Distribution
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { tier: "Low Risk", count: lowRisk.length, tvl: lowRisk.reduce((s, v) => s + v.tvl, 0), apy: "6-10%", color: "bg-green-500", textColor: "text-green-400" },
            { tier: "Medium Risk", count: medRisk.length, tvl: medRisk.reduce((s, v) => s + v.tvl, 0), apy: "12-16%", color: "bg-yellow-500", textColor: "text-yellow-400" },
            { tier: "High Risk", count: highRisk.length, tvl: highRisk.reduce((s, v) => s + v.tvl, 0), apy: "20-25%", color: "bg-red-500", textColor: "text-red-400" },
          ].map((t) => (
            <div key={t.tier} className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-center">
              <div className={`w-2 h-2 rounded-full ${t.color} mx-auto mb-2`} />
              <div className={`text-[16px] font-bold font-display ${t.textColor}`}>{t.count}</div>
              <div className="text-[10px] text-[#7d7d7d] mt-0.5">{t.tier}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{fmtUsd(t.tvl)} TVL</div>
              <div className="text-[10px] text-zinc-600">{t.apy} APY</div>
            </div>
          ))}
        </div>
      </CRCard>

      {/* Vault list */}
      <CRCard>
        <h3 className="text-[11px] font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
          Insurance Vaults &middot; {vaults.length} Active
        </h3>
        <div className="space-y-1.5">
          {vaults.slice(0, 20).map((v) => (
            <button
              key={v.id}
              onClick={() => onSelectVault(v.id)}
              className="w-full flex items-center gap-3 py-3 px-3.5 rounded-xl bg-black/30 border border-white/[0.06] hover:bg-white/[0.05] transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                v.riskTier === "low" ? "bg-green-500/10" : v.riskTier === "medium" ? "bg-yellow-500/10" : "bg-red-500/10"
              }`}>
                <ShieldIcon className={`w-5 h-5 ${
                  v.riskTier === "low" ? "text-green-400" : v.riskTier === "medium" ? "text-yellow-400" : "text-red-400"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white truncate">{v.campaignTitle}</div>
                <div className="text-[10px] text-[#7d7d7d] truncate">
                  {v.brandName} &middot; {fmtNum(v.members)} members &middot; {v.approvalRating.toFixed(1)}*
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-bold text-green-400 font-mono">{v.apy}%</div>
                <div className="text-[10px] text-[#7d7d7d]">{fmtUsd(v.tvl)} TVL</div>
              </div>
            </button>
          ))}
        </div>
      </CRCard>
    </div>
  );
}

/* ── sub-view: vault detail ───────────────────────────────────── */

function VaultDetail({
  vault,
  onBack,
}: {
  vault: InsuranceVault;
  onBack: () => void;
}) {
  const [depositAmount, setDepositAmount] = useState("");
  const [activeSection, setActiveSection] = useState<"deposit" | "evidence" | "history">("deposit");

  const depositNum = parseFloat(depositAmount) || 0;
  const projectedDaily = (depositNum * vault.apy) / 100 / 365;
  const projectedMonthly = projectedDaily * 30;
  const projectedYearly = depositNum * vault.apy / 100;

  // Generate mock evidence queue for this vault
  const evidenceQueue = Array.from({ length: Math.min(vault.disputes, 5) }, (_, i) => ({
    id: `ev_${vault.id.slice(0, 6)}_${i}`,
    type: (["scam", "no_payment", "rejection", "no_response", "billing"] as ComplaintCategory[])[i % 5],
    hash: mockEvidenceHash(vault.id, i),
    prevHash: i > 0 ? mockEvidenceHash(vault.id, i - 1) : null,
    shelbyBlob: `shelby://evidence/${vault.route}/case_${i}`,
    amount: Math.round(20 + seededRand(vault.id + i) * 200),
    submittedAgo: Math.floor(seededRand(vault.id + i + "t") * 48) + 1,
    votes: { approve: Math.floor(seededRand(vault.id + i + "a") * 8), reject: Math.floor(seededRand(vault.id + i + "r") * 3) },
  }));

  // Mock resolution history
  const resolutionHistory = Array.from({ length: 3 }, (_, i) => ({
    id: `res_${i}`,
    outcome: i === 1 ? "Brand penalized" : "Clipper refunded",
    amount: Math.round(50 + seededRand(vault.id + "res" + i) * 300),
    daysAgo: Math.floor(seededRand(vault.id + "d" + i) * 30) + 1,
    evidenceHash: mockEvidenceHash(vault.id + "res", i),
    reviewers: Math.floor(seededRand(vault.id + "rv" + i) * 12) + 3,
  }));

  const SECTIONS = [
    { id: "deposit" as const, label: "Deposit" },
    { id: "evidence" as const, label: "Evidence Queue" },
    { id: "history" as const, label: "Resolutions" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <CRCard>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white truncate tracking-[-0.02em]">{vault.campaignTitle}</h3>
            <p className="text-[11px] text-[#7d7d7d]">{vault.brandName} &middot; Insurance Vault</p>
          </div>
          <div className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${RISK_COLORS[vault.riskTier]}`}>
            {vault.riskTier.charAt(0).toUpperCase() + vault.riskTier.slice(1)} Risk
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "TVL", value: fmtUsd(vault.tvl), color: "text-[#FA4616]" },
            { label: "APY", value: vault.apy + "%", color: "text-green-400" },
            { label: "Coverage", value: vault.coverage.toFixed(1) + "x", color: "text-white" },
            { label: "Stakers", value: vault.totalStakers.toString(), color: "text-white" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-[16px] font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#7d7d7d]">{s.label}</div>
            </div>
          ))}
        </div>
      </CRCard>

      {/* Approval trend */}
      <CRCard>
        <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-3">
          Approval Rating
        </h3>
        <div className="flex items-center gap-4">
          <div className={`text-[32px] font-bold font-display ${
            vault.approvalRating >= 4 ? "text-green-400" : vault.approvalRating >= 3 ? "text-yellow-400" : "text-red-400"
          }`}>
            {vault.approvalRating.toFixed(1)}
          </div>
          <div className="flex-1">
            <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  vault.approvalRating >= 4 ? "bg-green-500" : vault.approvalRating >= 3 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${(vault.approvalRating / 5) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-medium ${
                vault.approvalTrend === "up" ? "text-green-400" : vault.approvalTrend === "down" ? "text-red-400" : "text-zinc-500"
              }`}>
                {vault.approvalTrend === "up" ? "Trending up" : vault.approvalTrend === "down" ? "Trending down" : "Stable"}
              </span>
              <span className="text-[10px] text-zinc-600">
                &middot; {vault.disputes} open dispute{vault.disputes !== 1 ? "s" : ""}
                &middot; {vault.premium}% monthly premium
              </span>
            </div>
          </div>
        </div>
      </CRCard>

      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--background)] border border-[#212121]">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeSection === s.id ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {s.label}
            {s.id === "evidence" && vault.disputes > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FA4616]/20 text-[#FA4616] text-[9px] font-bold">
                {Math.min(vault.disputes, 5)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deposit section */}
      {activeSection === "deposit" && (
        <CRCard>
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
            Deposit USDT
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white placeholder-zinc-600 outline-none focus:border-[#FA4616]/40 transition-colors font-mono"
            />
            <button className="px-5 py-3 rounded-xl bg-[#FA4616] text-white text-[13px] font-semibold hover:bg-[#e03d12] transition-colors shrink-0">
              Deposit
            </button>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mb-5">
            {["100", "500", "1000", "5000"].map((amt) => (
              <button
                key={amt}
                onClick={() => setDepositAmount(amt)}
                className="flex-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors font-mono"
              >
                ${parseInt(amt).toLocaleString()}
              </button>
            ))}
          </div>

          {/* Yield projections */}
          {depositNum > 0 && (
            <div className="rounded-xl bg-green-500/[0.06] border border-green-500/15 p-4 animate-enter">
              <div className="text-[10px] text-green-400/70 uppercase tracking-wider mb-3 font-semibold">
                Projected Yield at {vault.apy}% APY
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { period: "Daily", value: projectedDaily },
                  { period: "Monthly", value: projectedMonthly },
                  { period: "Yearly", value: projectedYearly },
                ].map((p) => (
                  <div key={p.period} className="text-center">
                    <div className="text-[16px] font-bold text-green-400 font-mono">
                      +${p.value.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#7d7d7d]">{p.period}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yield sources breakdown */}
          <div className="mt-4 space-y-2">
            <div className="text-[10px] text-[#7d7d7d] uppercase tracking-wider font-semibold">Yield Sources</div>
            {[
              { source: "Brand premium", pct: vault.premium, desc: "Monthly fee paid by campaign owner" },
              { source: "Dispute fees", pct: 1.5, desc: "Collected from resolved disputes" },
              { source: "Protocol incentives", pct: vault.apy - vault.premium - 1.5, desc: "Aptos staking rewards + Shelby incentives" },
            ].map((y) => (
              <div key={y.source} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/30 border border-white/[0.06]">
                <div>
                  <div className="text-[12px] text-white">{y.source}</div>
                  <div className="text-[10px] text-zinc-600">{y.desc}</div>
                </div>
                <span className="text-[12px] font-mono text-green-400 font-medium">{y.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </CRCard>
      )}

      {/* Evidence review queue */}
      {activeSection === "evidence" && (
        <CRCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider">
              Evidence Review Queue
            </h3>
            <span className="text-[10px] text-zinc-600">
              Review evidence to earn bonus yield
            </span>
          </div>

          {evidenceQueue.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-[13px]">
              No disputes pending review
            </div>
          ) : (
            <div className="space-y-2">
              {evidenceQueue.map((ev) => {
                const meta = COMPLAINT_LABELS[ev.type];
                return (
                  <div key={ev.id} className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-white">{ev.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
                      </div>
                      <span className="text-[10px] text-[#7d7d7d]">{ev.submittedAgo}h ago</span>
                    </div>

                    {/* Evidence hash chain */}
                    <div className="font-mono text-[10px] text-[#7d7d7d] space-y-0.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-600">hash</span>
                        <span className="truncate text-zinc-400">{ev.hash}</span>
                      </div>
                      {ev.prevHash && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-600">prev</span>
                          <span className="truncate">{ev.prevHash}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-orange-400">blob</span>
                        <span className="truncate text-orange-300">{ev.shelbyBlob}</span>
                      </div>
                    </div>

                    {/* Dispute amount + vote buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-white font-medium">${ev.amount}</span>
                        <span className="text-[10px] text-zinc-600">
                          {ev.votes.approve} approve &middot; {ev.votes.reject} reject
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[11px] font-medium hover:bg-green-500/20 transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-medium hover:bg-red-500/20 transition-colors">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CRCard>
      )}

      {/* Resolution history */}
      {activeSection === "history" && (
        <CRCard>
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
            Recent Resolutions
          </h3>
          <div className="space-y-2">
            {resolutionHistory.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      r.outcome.includes("Brand") ? "bg-red-500/10" : "bg-green-500/10"
                    }`}>
                      <ShieldIcon className={`w-3.5 h-3.5 ${
                        r.outcome.includes("Brand") ? "text-red-400" : "text-green-400"
                      }`} />
                    </div>
                    <span className="text-[12px] font-medium text-white">{r.outcome}</span>
                  </div>
                  <span className="text-[10px] text-[#7d7d7d]">{r.daysAgo}d ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] text-[#7d7d7d] truncate flex-1">
                    {r.evidenceHash.slice(0, 32)}...
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#7d7d7d]">{r.reviewers} reviewers</span>
                    <span className="text-[12px] font-mono font-medium text-white">${r.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CRCard>
      )}
    </div>
  );
}

/* ── sub-view: leaderboard ─────────────────────────────────────── */

function Leaderboard({
  creators,
  trending,
}: {
  creators: Creator[];
  trending: TrendingItem[];
}) {
  return (
    <div className="space-y-5">
      <CRCard>
        <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
          Top Earners
        </h3>
        <div className="space-y-1.5">
          {creators.slice(0, 15).map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-black/30 border border-white/[0.06]">
              <span className="text-[12px] text-zinc-600 w-5 text-right font-mono shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white truncate">@{c.username}</div>
                <div className="text-[10px] text-[#7d7d7d]">{c.name} &middot; {c.whops_count} products</div>
              </div>
              <div className="text-[13px] font-bold text-green-400 font-mono shrink-0">
                {c.total_earnings ? fmtUsd(c.total_earnings) : "-"}
              </div>
            </div>
          ))}
        </div>
      </CRCard>

      {trending.length > 0 && (
        <CRCard>
          <h3 className="text-[11px] font-display font-semibold text-[#7d7d7d] uppercase tracking-wider mb-4">
            Trending &middot; 7 Day Growth
          </h3>
          <div className="space-y-1.5">
            {trending.slice(0, 10).map((t) => (
              <div key={t.rank} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <span className="text-[12px] text-zinc-600 w-5 text-right font-mono shrink-0">#{t.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">{t.product_name}</div>
                  <div className="text-[10px] text-[#7d7d7d]">
                    {t.company_name || "-"} &middot; {t.users?.toLocaleString() ?? "-"} users
                  </div>
                </div>
                <span className="text-[13px] font-bold text-green-400 font-mono shrink-0">
                  +{t.growth_pct?.toLocaleString() ?? 0}%
                </span>
              </div>
            ))}
          </div>
        </CRCard>
      )}
    </div>
  );
}

/* ── main component ────────────────────────────────────────────── */

type SubView = "overview" | "disputes" | "vaults" | "leaderboard";

export function MarketTab() {
  const [subView, setSubView] = useState<SubView>("overview");
  const [campaigns, setCampaigns] = useState<Product[]>([]);
  const [ecosystem, setEcosystem] = useState<Ecosystem | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/whop/content-rewards?limit=100&sort=total_reviews&order=desc").then((r) => r.json()),
      fetch("/api/whop/creators?sort=total_earnings&limit=15").then((r) => r.json()),
      fetch("/api/whop/trending").then((r) => r.json()),
    ]).then(([crData, creatorsData, trendingData]) => {
      setCampaigns(crData.data || []);
      setEcosystem(crData.ecosystem || null);
      setCreators(creatorsData.data || []);
      setTrending(trendingData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const vaults = generateVaults(campaigns);

  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <CRCard key={i} padding="p-6">
            <div className="animate-pulse">
            <div className="h-3 w-32 bg-white/[0.06] rounded mb-4" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-5 w-12 bg-white/[0.06] rounded mb-1 mx-auto" />
                  <div className="h-2 w-16 bg-white/[0.04] rounded mx-auto" />
                </div>
              ))}
            </div>
            </div>
          </CRCard>
        ))}
      </div>
    );
  }

  // Vault detail drill-down
  if (selectedVaultId) {
    const vault = vaults.find((v) => v.id === selectedVaultId);
    if (vault) {
      return (
        <div className="animate-enter">
          <VaultDetail vault={vault} onBack={() => setSelectedVaultId(null)} />
        </div>
      );
    }
  }

  // Campaign detail drill-down
  if (selectedRoute) {
    const matchingVault = vaults.find((v) => v.route === selectedRoute) || null;
    return (
      <div className="animate-enter">
        <CampaignDetail route={selectedRoute} onBack={() => setSelectedRoute(null)} vault={matchingVault} />
      </div>
    );
  }

  const SUB_TABS: { id: SubView; label: string }[] = [
    { id: "overview", label: "Health" },
    { id: "disputes", label: "Disputes" },
    { id: "vaults", label: "Vaults" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="space-y-5 animate-enter">
      {/* Sub-nav */}
      <div className="flex gap-1 p-1.5 rounded-2xl bg-[var(--background)] border border-[#212121]">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubView(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-all tracking-[-0.01em] ${
              subView === t.id
                ? "bg-[#FA4616]/15 text-[#FA4616] border border-[#FA4616]/20"
                : "text-[#7d7d7d] hover:text-zinc-300 border border-transparent"
            }`}
          >
            {t.label}
            {t.id === "disputes" && (() => {
              const n = campaigns.filter((p) => p.avg_stars !== null && p.avg_stars < 3.5 && p.total_reviews >= 3).length;
              return n > 0 ? (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold">
                  {n}
                </span>
              ) : null;
            })()}
            {t.id === "vaults" && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FA4616]/20 text-[#FA4616] text-[9px] font-bold">
                {vaults.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {subView === "overview" && <HealthOverview campaigns={campaigns} ecosystem={ecosystem} vaults={vaults} />}
      {subView === "disputes" && <DisputeList campaigns={campaigns} onSelect={setSelectedRoute} />}
      {subView === "vaults" && <VaultsOverview vaults={vaults} onSelectVault={setSelectedVaultId} />}
      {subView === "leaderboard" && <Leaderboard creators={creators} trending={trending} />}
    </div>
  );
}
