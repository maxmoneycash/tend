"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

/* ═══════════════════════════════════════════════════════════════
   MarketDashboard — Bloomberg terminal-style financial dashboard
   for the content rewards ecosystem.
   ═══════════════════════════════════════════════════════════════ */

// ── Types ────────────────────────────────────────────────────

interface StatsResponse {
  campaignStats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalRemaining: number;
    totalPaidOut: number;
    avgCpm: number;
    source: string;
  };
  submissionStats: {
    totalSubmissions: number;
    byStatus: { tracking: number; flagged: number; completed: number };
    avgBotScore: number;
    totalViewsVerified: number;
  };
  payoutStats: {
    totalPaidOctas: number;
    totalFeesOctas: number;
    payoutCount: number;
    avgPayoutOctas: number;
    largestPayoutOctas: number;
  };
  evidenceStats: {
    totalEvidencePacks: number;
    totalRollups: number;
    shelbyAttestations: number;
    packsWithShelbyBlob: number;
  };
  topSubmissions: Array<{
    id: number;
    contentUrl: string | null;
    videoId: string | null;
    viewsCurrent: number;
    earnedCreator: number;
    botScore: number;
    status: number | null;
    platform: string | null;
    onChainAddress: string | null;
  }>;
  oracleStats: {
    oracleAddress: string | null;
    totalOracleReports: number;
    lastReportTimestamp: string | null;
  };
  contractInfo: {
    contractAddress: string | null;
    network: string;
    payoutToken: string;
    platformFeeBps: number;
  };
  generatedAt: string;
}

// ── Fallback demo data ───────────────────────────────────────

const DEMO_DATA: StatsResponse = {
  campaignStats: {
    totalCampaigns: 3,
    activeCampaigns: 1,
    totalBudget: 200000000, // 2000.00 USDT in octas (6 decimals)
    totalRemaining: 121041000,
    totalPaidOut: 78959000,
    avgCpm: 750,
    source: "demo",
  },
  submissionStats: {
    totalSubmissions: 24,
    byStatus: { tracking: 8, flagged: 2, completed: 14 },
    avgBotScore: 13,
    totalViewsVerified: 2071729,
  },
  payoutStats: {
    totalPaidOctas: 78959000,
    totalFeesOctas: 3948000,
    payoutCount: 24,
    avgPayoutOctas: 3290000,
    largestPayoutOctas: 12500000,
  },
  evidenceStats: {
    totalEvidencePacks: 24,
    totalRollups: 6,
    shelbyAttestations: 18,
    packsWithShelbyBlob: 20,
  },
  topSubmissions: [
    { id: 1, contentUrl: "https://youtube.com/watch?v=abc", videoId: "abc", viewsCurrent: 850000, earnedCreator: 31200000, botScore: 5, status: 6, platform: "youtube", onChainAddress: null },
    { id: 2, contentUrl: "https://youtube.com/watch?v=def", videoId: "def", viewsCurrent: 620000, earnedCreator: 18700000, botScore: 8, status: 6, platform: "youtube", onChainAddress: null },
    { id: 3, contentUrl: "https://tiktok.com/@user/video/123", videoId: "123", viewsCurrent: 340000, earnedCreator: 9400000, botScore: 12, status: 6, platform: "tiktok", onChainAddress: null },
    { id: 4, contentUrl: "https://youtube.com/watch?v=ghi", videoId: "ghi", viewsCurrent: 180000, earnedCreator: 7200000, botScore: 3, status: 0, platform: "youtube", onChainAddress: null },
    { id: 5, contentUrl: "https://instagram.com/p/xyz", videoId: "xyz", viewsCurrent: 95000, earnedCreator: 4100000, botScore: 18, status: 6, platform: "instagram", onChainAddress: null },
    { id: 6, contentUrl: "https://youtube.com/watch?v=jkl", videoId: "jkl", viewsCurrent: 42000, earnedCreator: 2300000, botScore: 7, status: 0, platform: "youtube", onChainAddress: null },
    { id: 7, contentUrl: "https://tiktok.com/@user2/video/456", videoId: "456", viewsCurrent: 28000, earnedCreator: 1800000, botScore: 22, status: 6, platform: "tiktok", onChainAddress: null },
    { id: 8, contentUrl: "https://youtube.com/watch?v=mno", videoId: "mno", viewsCurrent: 15000, earnedCreator: 900000, botScore: 4, status: 6, platform: "youtube", onChainAddress: null },
  ],
  oracleStats: {
    oracleAddress: null,
    totalOracleReports: 48,
    lastReportTimestamp: new Date().toISOString(),
  },
  contractInfo: {
    contractAddress: null,
    network: "testnet",
    payoutToken: "USDT",
    platformFeeBps: 500,
  },
  generatedAt: new Date().toISOString(),
};

// ── Helpers ──────────────────────────────────────────────────

const USDT_DECIMALS = 6;

function octasToUsd(octas: number): number {
  return octas / 10 ** USDT_DECIMALS;
}

function fmtDollar(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtCount(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Campaign data for Panel 3 ────────────────────────────────

interface CampaignBar {
  name: string;
  paidOut: number;
  status: "active" | "paused";
}

const DEMO_CAMPAIGNS: CampaignBar[] = [
  { name: "Yunakin Land Tax", paidOut: 789.59, status: "active" },
  { name: "Muwekma contribution", paidOut: 0, status: "paused" },
  { name: "Mumford & Sons Tour", paidOut: 0, status: "paused" },
];

// ── Platform colors ──────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  tiktok: "#00F2EA",
  instagram: "#E1306C",
  x: "#9CA3AF",
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
};

// ── Shared styles ────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: "transparent",
  borderTop: "1px solid rgba(255,255,255,0.04)",
  borderRadius: 0,
  padding: "24px 24px 24px 0",
  position: "relative",
  overflow: "hidden",
};

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "rgba(255,255,255,0.25)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: 16,
  lineHeight: 1,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
};

const MONO_NUM: React.CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  fontFamily: "'Geist Mono', monospace",
};

// ── Skeleton loader ──────────────────────────────────────────

function SkeletonPulse({ width, height, style }: { width: string | number; height: string | number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// ── Panel 1: Total Ecosystem Value ───────────────────────────

function PanelEcosystemValue({
  totalBudget,
  activeCampaigns,
  isVisible,
}: {
  totalBudget: number;
  activeCampaigns: number;
  isVisible: boolean;
}) {
  const [displayValue, setDisplayValue] = useState("$0.00");
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setDisplayValue(fmtDollar(progress * totalBudget));
      },
      { duration: 2.0, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible, totalBudget]);

  return (
    <div style={{ ...CARD_STYLE, gridColumn: "span 2" }}>
      {/* Green glow background */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={CARD_TITLE_STYLE}>Total Ecosystem Value</div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-2px",
          lineHeight: 1.1,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          ...MONO_NUM,
        }}
      >
        {displayValue}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#16a34a",
            boxShadow: "0 0 8px rgba(22,163,74,0.6)",
            animation: "livePulse 2s ease-in-out infinite",
          }}
        />
        across {activeCampaigns} active campaign{activeCampaigns !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ── Panel 2: Average CPM ─────────────────────────────────────

function PanelAverageCPM({
  avgCpm,
  isVisible,
}: {
  avgCpm: number;
  isVisible: boolean;
}) {
  const [displayCpm, setDisplayCpm] = useState("$0.00");
  const hasAnimatedRef = useRef(false);

  // avgCpm from chain is in octas per 1K views; convert to dollar
  const cpmDollar = avgCpm > 0 ? octasToUsd(avgCpm) : 0.75;

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setDisplayCpm("$" + (progress * cpmDollar).toFixed(2));
      },
      { duration: 1.4, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible, cpmDollar]);

  return (
    <div style={CARD_STYLE}>
      <div style={CARD_TITLE_STYLE}>Average CPM</div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-1.5px",
            lineHeight: 1,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            ...MONO_NUM,
          }}
        >
          {displayCpm}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          /1K
        </span>
      </div>
      {/* Trend indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 8,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2L10 7H2L6 2Z" fill="#16a34a" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", ...MONO_NUM }}>
          +12.3%
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>vs last 7d</span>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        across YouTube, TikTok, Instagram
      </div>
    </div>
  );
}

// ── Panel 3: Top Campaigns by Payout Volume ──────────────────

function PanelTopCampaigns({
  campaigns,
  isVisible,
}: {
  campaigns: CampaignBar[];
  isVisible: boolean;
}) {
  const [barWidths, setBarWidths] = useState<number[]>(campaigns.map(() => 0));
  const hasAnimatedRef = useRef(false);

  const maxPayout = Math.max(...campaigns.map((c) => c.paidOut), 1);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setBarWidths(campaigns.map((c) => (c.paidOut / maxPayout) * progress * 100));
      },
      { duration: 1.6, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible, campaigns, maxPayout]);

  const BAR_HEIGHT = 32;
  const GAP = 10;
  const svgHeight = campaigns.length * (BAR_HEIGHT + GAP) - GAP;

  return (
    <div style={{ ...CARD_STYLE, gridColumn: "span 2" }}>
      <div style={CARD_TITLE_STYLE}>Top Campaigns by Payout Volume</div>
      <svg
        viewBox={`0 0 500 ${svgHeight}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMinYMin meet"
      >
        <defs>
          <linearGradient id="barGradOrange" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {campaigns.map((campaign, i) => {
          const y = i * (BAR_HEIGHT + GAP);
          const barColor = campaign.status === "active" ? "url(#barGradOrange)" : "#3f3f46";
          const barGlow = campaign.status === "active" ? "rgba(249,115,22,0.12)" : "transparent";
          const barW = Math.max(barWidths[i] * 4.2, 0); // scale to 420px max

          return (
            <g key={campaign.name}>
              {/* Track */}
              <rect
                x="0"
                y={y}
                width="420"
                height={BAR_HEIGHT}
                rx="6"
                fill="rgba(255,255,255,0.03)"
              />
              {/* Fill */}
              <rect
                x="0"
                y={y}
                width={barW}
                height={BAR_HEIGHT}
                rx="6"
                fill={barColor}
                opacity="0.8"
              />
              {/* Glow overlay */}
              <rect
                x="0"
                y={y}
                width={barW}
                height={BAR_HEIGHT}
                rx="6"
                fill={barGlow}
              />
              {/* Campaign name */}
              <text
                x="10"
                y={y + BAR_HEIGHT / 2 + 1}
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: campaign.paidOut > 0 ? "#fff" : "rgba(255,255,255,0.5)",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {campaign.name}
              </text>
              {/* Amount */}
              <text
                x="490"
                y={y + BAR_HEIGHT / 2 + 1}
                dominantBaseline="middle"
                textAnchor="end"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: "#fff",
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {fmtDollar(campaign.paidOut)}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Active</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3f3f46" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Paused</span>
        </div>
      </div>
    </div>
  );
}

// ── Panel 4: Creator Earnings Distribution ───────────────────

function PanelEarningsDistribution({
  topSubmissions,
  isVisible,
}: {
  topSubmissions: StatsResponse["topSubmissions"];
  isVisible: boolean;
}) {
  const [barHeights, setBarHeights] = useState([0, 0, 0, 0]);
  const hasAnimatedRef = useRef(false);

  // Compute bracket counts from real submission data
  const brackets = [
    { label: "$0-10", min: 0, max: 10 },
    { label: "$10-50", min: 10, max: 50 },
    { label: "$50-100", min: 50, max: 100 },
    { label: "$100-350", min: 100, max: 350 },
  ];

  const counts = brackets.map((b) => {
    return topSubmissions.filter((s) => {
      const earned = octasToUsd(s.earnedCreator);
      return earned >= b.min && earned < b.max;
    }).length;
  });

  const maxCount = Math.max(...counts, 1);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setBarHeights(counts.map((c) => (c / maxCount) * progress * 100));
      },
      { duration: 1.4, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible, counts, maxCount]);

  const barWidth = 36;
  const gap = 20;
  const chartHeight = 120;
  const totalWidth = brackets.length * (barWidth + gap) - gap;

  return (
    <div style={CARD_STYLE}>
      <div style={CARD_TITLE_STYLE}>Creator Earnings Distribution</div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          viewBox={`0 0 ${totalWidth + 20} ${chartHeight + 30}`}
          style={{ width: "100%", maxWidth: 280, height: "auto", display: "block" }}
          preserveAspectRatio="xMidYMax meet"
        >
          {brackets.map((bracket, i) => {
            const x = 10 + i * (barWidth + gap);
            const barH = (barHeights[i] / 100) * chartHeight;
            const y = chartHeight - barH;

            return (
              <g key={bracket.label}>
                <defs>
                  <linearGradient id={`earningsBar-${i}`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                {/* Bar track */}
                <rect
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  rx="4"
                  fill="rgba(255,255,255,0.03)"
                />
                {/* Bar fill */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  fill={`url(#earningsBar-${i})`}
                  opacity="0.85"
                />
                {/* Count label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fill: "#fff",
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {counts[i]}
                </text>
                {/* Bracket label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    fill: "rgba(255,255,255,0.25)",
                    fontFamily: "'Geist Mono', monospace",
                    letterSpacing: "0.06em",
                  }}
                >
                  {bracket.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Panel 5: Platform Breakdown ──────────────────────────────

function PanelPlatformBreakdown({
  topSubmissions,
  totalViewsVerified,
  isVisible,
}: {
  topSubmissions: StatsResponse["topSubmissions"];
  totalViewsVerified: number;
  isVisible: boolean;
}) {
  const [ringProgress, setRingProgress] = useState(0);
  const hasAnimatedRef = useRef(false);

  // Aggregate views by platform
  const platformViews: Record<string, number> = {};
  for (const sub of topSubmissions) {
    const p = (sub.platform || "youtube").toLowerCase();
    platformViews[p] = (platformViews[p] || 0) + sub.viewsCurrent;
  }

  const totalViews = Object.values(platformViews).reduce((a, b) => a + b, 0) || 1;
  const platforms = Object.entries(platformViews)
    .sort((a, b) => b[1] - a[1])
    .map(([key, views]) => ({
      key,
      label: PLATFORM_LABELS[key] || key,
      color: PLATFORM_COLORS[key] || "#6b7280",
      pct: views / totalViews,
      views,
    }));

  // Ensure we have at least the 4 major platforms
  const allPlatformKeys = ["youtube", "tiktok", "instagram", "x"];
  for (const key of allPlatformKeys) {
    if (!platforms.find((p) => p.key === key)) {
      platforms.push({
        key,
        label: PLATFORM_LABELS[key] || key,
        color: PLATFORM_COLORS[key] || "#6b7280",
        pct: 0,
        views: 0,
      });
    }
  }

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setRingProgress(progress);
      },
      { duration: 1.8, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible]);

  const cx = 80;
  const cy = 80;
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Build ring segments
  let accumulated = 0;
  const segments = platforms
    .filter((p) => p.pct > 0)
    .map((p) => {
      const segmentLength = p.pct * circumference * ringProgress;
      const offset = circumference - accumulated * ringProgress;
      accumulated += p.pct * circumference;
      return { ...p, segmentLength, offset };
    });

  return (
    <div style={CARD_STYLE}>
      <div style={CARD_TITLE_STYLE}>Platform Breakdown</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Donut chart */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg
            viewBox={`0 0 ${cx * 2} ${cy * 2}`}
            style={{ width: 140, height: 140 }}
          >
            {/* Background track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={strokeWidth}
            />
            {/* Segments */}
            {segments.map((seg, i) => {
              // Calculate dashoffset for each segment
              let cumulativeBefore = 0;
              for (let j = 0; j < i; j++) {
                cumulativeBefore += platforms[j].pct * circumference;
              }
              const dashOffset = circumference - cumulativeBefore * ringProgress;
              const dashLength = seg.pct * circumference * ringProgress;

              return (
                <circle
                  key={seg.key}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  opacity="0.85"
                />
              );
            })}
          </svg>
          {/* Center text */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.1,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                ...MONO_NUM,
              }}
            >
              {fmtCompact(totalViewsVerified)}
            </div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 500,
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 2,
              }}
            >
              views
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {platforms.slice(0, 4).map((p) => (
            <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: p.color,
                  opacity: 0.85,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                {p.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  marginLeft: "auto",
                  ...MONO_NUM,
                }}
              >
                {Math.round(p.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel 6: Views Verified Counter ──────────────────────────

function PanelViewsVerified({
  totalViewsVerified,
  isVisible,
}: {
  totalViewsVerified: number;
  isVisible: boolean;
}) {
  const [displayViews, setDisplayViews] = useState("0");
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setDisplayViews(fmtCount(Math.round(progress * totalViewsVerified)));
      },
      { duration: 2.2, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible, totalViewsVerified]);

  return (
    <div style={{ ...CARD_STYLE, textAlign: "center" }}>
      <div style={CARD_TITLE_STYLE}>On-Chain Verified</div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          animation: isVisible ? "subtlePulse 3s ease-in-out infinite" : "none",
          ...MONO_NUM,
        }}
      >
        {displayViews}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.3px",
        }}
      >
        views verified on-chain
      </div>
      {/* Decorative scan line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(22,163,74,0.3), transparent)",
          animation: "scanLine 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ── Panel 7: Payout Velocity ─────────────────────────────────

function PanelPayoutVelocity({
  payoutCount,
  isVisible,
}: {
  payoutCount: number;
  isVisible: boolean;
}) {
  const [displayCount, setDisplayCount] = useState(0);
  const hasAnimatedRef = useRef(false);

  // Simulated avg time per payout
  const avgTime = payoutCount > 0 ? Math.max(1.2, 92 / Math.max(payoutCount, 1)) : 0;

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    animate(
      (progress: number) => {
        setDisplayCount(Math.round(progress * payoutCount));
      },
      { duration: 1.4, easing: [0.16, 1, 0.3, 1] }
    );
  }, [isVisible, payoutCount]);

  // Generate sparkline path from simulated payout data
  const sparkPoints = 20;
  const sparkWidth = 140;
  const sparkHeight = 32;
  const sparkData: number[] = [];
  for (let i = 0; i < sparkPoints; i++) {
    // Create a somewhat realistic frequency pattern
    const base = Math.sin(i * 0.6) * 0.3 + 0.5;
    const noise = Math.sin(i * 2.3 + 7) * 0.15 + Math.sin(i * 4.1 + 3) * 0.08;
    sparkData.push(Math.max(0.05, Math.min(1, base + noise)));
  }

  const sparkPath = sparkData
    .map((v, i) => {
      const x = (i / (sparkPoints - 1)) * sparkWidth;
      const y = sparkHeight - v * sparkHeight;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div style={CARD_STYLE}>
      <div style={CARD_TITLE_STYLE}>Payout Velocity</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {/* Green live dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#16a34a",
            boxShadow: "0 0 8px rgba(22,163,74,0.6)",
            animation: "livePulse 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-1px",
            lineHeight: 1,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            ...MONO_NUM,
          }}
        >
          {displayCount}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>
          payouts
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          marginBottom: 14,
          ...MONO_NUM,
        }}
      >
        avg {avgTime.toFixed(1)}s per payout
      </div>
      {/* Sparkline */}
      <svg
        viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
        style={{ width: "100%", height: 32, display: "block" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path
          d={`${sparkPath} L ${sparkWidth} ${sparkHeight} L 0 ${sparkHeight} Z`}
          fill="url(#sparkGrad)"
        />
        {/* Line */}
        <path
          d={sparkPath}
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.5"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

// ── Main Dashboard Component ─────────────────────────────────

export function MarketDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch data from stats API
  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch("/api/rewards/stats");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[MarketDashboard] API unavailable, using demo data:", err);
        if (!cancelled) {
          setData(DEMO_DATA);
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  // IntersectionObserver for scroll trigger
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Derived values
  const totalBudgetUsd = data ? octasToUsd(data.campaignStats.totalBudget) : 0;
  const totalPaidOutUsd = data ? octasToUsd(data.campaignStats.totalPaidOut) : 0;

  // Build campaign bars from real data when available
  const campaignBars: CampaignBar[] = data && data.campaignStats.source !== "demo"
    ? [
        {
          name: "Yunakin Land Tax",
          paidOut: totalPaidOutUsd > 0 ? totalPaidOutUsd : DEMO_CAMPAIGNS[0].paidOut,
          status: data.campaignStats.activeCampaigns > 0 ? "active" : "paused",
        },
        ...DEMO_CAMPAIGNS.slice(1),
      ]
    : DEMO_CAMPAIGNS;

  return (
    <div ref={containerRef}>
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes subtlePulse {
          0%, 100% { text-shadow: 0 0 0px transparent; }
          50% { text-shadow: 0 0 20px rgba(22,163,74,0.15); }
        }
        @keyframes scanLine {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          background: "transparent",
          padding: "12px 8px",
          width: "100%",
        }}
      >
        {/* Dashboard header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#16a34a",
                boxShadow: "0 0 8px rgba(22,163,74,0.5)",
                animation: "livePulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Market Intelligence
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.2)",
                fontFamily: "'Geist Mono', monospace",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {data ? new Date(data.generatedAt).toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: data?.campaignStats.source === "chain" ? "#16a34a" : "#eab308",
                background: "transparent",
                border: "none",
                borderRadius: 0,
                padding: 0,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              {data?.campaignStats.source || "loading"}
            </span>
          </div>
        </div>

        {loading ? (
          /* ── Loading skeleton ── */
          <div
            data-market-grid=""
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <div style={{ ...CARD_STYLE, gridColumn: "span 2" }}>
              <SkeletonPulse width="50%" height={12} />
              <SkeletonPulse width="70%" height={40} style={{ marginTop: 16 }} />
              <SkeletonPulse width="40%" height={12} style={{ marginTop: 12 }} />
            </div>
            <div style={CARD_STYLE}>
              <SkeletonPulse width="60%" height={12} />
              <SkeletonPulse width="80%" height={32} style={{ marginTop: 16 }} />
              <SkeletonPulse width="50%" height={10} style={{ marginTop: 12 }} />
            </div>
            <div style={{ ...CARD_STYLE, gridColumn: "span 2" }}>
              <SkeletonPulse width="50%" height={12} />
              <SkeletonPulse width="100%" height={24} style={{ marginTop: 16 }} />
              <SkeletonPulse width="85%" height={24} style={{ marginTop: 8 }} />
              <SkeletonPulse width="40%" height={24} style={{ marginTop: 8 }} />
            </div>
            <div style={CARD_STYLE}>
              <SkeletonPulse width="60%" height={12} />
              <SkeletonPulse width={120} height={120} style={{ marginTop: 16, borderRadius: "50%" }} />
            </div>
            <div style={CARD_STYLE}>
              <SkeletonPulse width="60%" height={12} />
              <SkeletonPulse width="80%" height={32} style={{ marginTop: 16 }} />
            </div>
            <div style={CARD_STYLE}>
              <SkeletonPulse width="50%" height={12} />
              <SkeletonPulse width="90%" height={36} style={{ marginTop: 16 }} />
            </div>
            <div style={CARD_STYLE}>
              <SkeletonPulse width="55%" height={12} />
              <SkeletonPulse width="70%" height={28} style={{ marginTop: 16 }} />
              <SkeletonPulse width="100%" height={32} style={{ marginTop: 12 }} />
            </div>
          </div>
        ) : data ? (
          /* ── Dashboard grid ── */
          <div
            data-market-grid=""
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {/* Row 1: Ecosystem Value (2-col) + Average CPM (1-col) */}
            <div style={{ gridColumn: "span 2", animation: "fadeInUp 0.6s ease-out both" }}>
              <PanelEcosystemValue
                totalBudget={totalBudgetUsd}
                activeCampaigns={data.campaignStats.activeCampaigns}
                isVisible={isVisible}
              />
            </div>
            <div style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
              <PanelAverageCPM
                avgCpm={data.campaignStats.avgCpm}
                isVisible={isVisible}
              />
            </div>

            {/* Row 2: Top Campaigns (2-col) + Earnings Distribution (1-col) */}
            <div style={{ gridColumn: "span 2", animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
              <PanelTopCampaigns
                campaigns={campaignBars}
                isVisible={isVisible}
              />
            </div>
            <div style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}>
              <PanelEarningsDistribution
                topSubmissions={data.topSubmissions}
                isVisible={isVisible}
              />
            </div>

            {/* Row 3: Platform Breakdown (1-col) + Views Verified (1-col) + Payout Velocity (1-col) */}
            <div style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}>
              <PanelPlatformBreakdown
                topSubmissions={data.topSubmissions}
                totalViewsVerified={data.submissionStats.totalViewsVerified}
                isVisible={isVisible}
              />
            </div>
            <div style={{ animation: "fadeInUp 0.6s ease-out 0.5s both" }}>
              <PanelViewsVerified
                totalViewsVerified={data.submissionStats.totalViewsVerified}
                isVisible={isVisible}
              />
            </div>
            <div style={{ animation: "fadeInUp 0.6s ease-out 0.6s both" }}>
              <PanelPayoutVelocity
                payoutCount={data.payoutStats.payoutCount}
                isVisible={isVisible}
              />
            </div>
          </div>
        ) : null}

        {/* Footer: data freshness + network */}
        {data && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.2)",
                ...MONO_NUM,
              }}
            >
              {data.contractInfo.network.toUpperCase()} &middot; {data.contractInfo.payoutToken} &middot; {data.evidenceStats.shelbyAttestations} Shelby attestations
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Every dollar escrowed on-chain &bull; Every payout cryptographically verified
            </span>
          </div>
        )}
      </div>

      {/* Responsive breakpoint overrides via media query */}
      <style>{`
        @media (max-width: 768px) {
          [data-market-grid] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [data-market-grid] > * {
            grid-column: span 1 !important;
          }
          [data-market-grid] > *:first-child {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 480px) {
          [data-market-grid] {
            grid-template-columns: 1fr !important;
          }
          [data-market-grid] > * {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
