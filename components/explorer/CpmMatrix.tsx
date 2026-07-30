"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { animate } from "motion";

/* ── Campaign Data ──────────────────────────────────── */

interface CampaignData {
  name: string;
  shortName: string;
  status: "active" | "paused";
  cpmRates: Record<string, number>;
  budget: number;
  maxPayout: number;
  minPayout: number;
}

const CAMPAIGNS: CampaignData[] = [
  {
    name: "Yunakin Land Tax",
    shortName: "Yunakin",
    status: "active",
    cpmRates: { youtube: 0.75, tiktok: 0.75, instagram: 0.75, x: 0 },
    budget: 2000,
    maxPayout: 350,
    minPayout: 1,
  },
  {
    name: "Muwekma Ohlone contribution",
    shortName: "Muwekma",
    status: "active",
    cpmRates: { youtube: 2.5, tiktok: 1.8, instagram: 1.2, x: 0.5 },
    budget: 10000,
    maxPayout: 500,
    minPayout: 5,
  },
  {
    name: "Mumford & Sons Tour",
    shortName: "Mumford & Sons",
    status: "active",
    cpmRates: { youtube: 1.5, tiktok: 2.0, instagram: 1.5, x: 0.75 },
    budget: 5000,
    maxPayout: 250,
    minPayout: 2,
  },
  {
    name: "Polymarket Election Coverage",
    shortName: "Polymarket",
    status: "paused",
    cpmRates: { youtube: 3.0, tiktok: 2.5, instagram: 2.0, x: 3.5 },
    budget: 15000,
    maxPayout: 1000,
    minPayout: 10,
  },
];

const PLATFORMS = ["youtube", "tiktok", "instagram", "x"] as const;
type PlatformKey = (typeof PLATFORMS)[number];

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X (Twitter)",
};

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  youtube: "#ff0000",
  tiktok: "#00f2ea",
  instagram: "#e4405f",
  x: "#1da1f2",
};

const PLATFORM_ICONS: Record<PlatformKey, string> = {
  youtube: "\u25B6",
  tiktok: "\u266B",
  instagram: "\u25CB",
  x: "\u2715",
};

/* ── Helpers ─────────────────────────────────────────── */

const MAX_CPM = 3.5;

function cpmToIntensity(cpm: number): number {
  if (cpm <= 0) return 0;
  return Math.min(cpm / MAX_CPM, 1);
}

function cpmToCellBg(cpm: number, hovered: boolean): string {
  if (cpm <= 0)
    return hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)";
  const intensity = cpmToIntensity(cpm);
  const alpha = 0.06 + intensity * 0.22;
  const alphaHover = alpha + 0.06;
  return `rgba(34,197,94,${hovered ? alphaHover : alpha})`;
}

function cpmToGlow(cpm: number): string {
  if (cpm <= 0) return "none";
  const intensity = cpmToIntensity(cpm);
  const blur = 8 + intensity * 16;
  const alpha = 0.08 + intensity * 0.18;
  return `0 0 ${blur}px rgba(34,197,94,${alpha})`;
}

function cpmToTextColor(cpm: number): string {
  if (cpm <= 0) return "rgba(255,255,255,0.2)";
  const intensity = cpmToIntensity(cpm);
  const r = Math.round(180 + intensity * 75);
  const g = Math.round(220 + intensity * 35);
  const b = Math.round(180 + intensity * 75);
  return `rgb(${r},${g},${b})`;
}

function fmtDollar(n: number): string {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtViewCount(views: number): string {
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(0) + "M";
  if (views >= 1_000) return (views / 1_000).toFixed(0) + "K";
  return views.toString();
}

function calcEarnings(
  cpm: number,
  views: number,
  maxPayout: number
): { amount: number; capped: boolean } {
  if (cpm <= 0) return { amount: 0, capped: false };
  const raw = (cpm * views) / 1000;
  const capped = raw > maxPayout;
  return { amount: capped ? maxPayout : raw, capped };
}

/* ── Insights ────────────────────────────────────────── */

function computeInsights(): {
  bestOverall: string;
  bestYoutube: string;
  mostAccessible: string;
} {
  let bestCpm = 0;
  let bestOverallLabel = "";
  let bestYtCpm = 0;
  let bestYtLabel = "";
  let lowestMin = Infinity;
  let lowestMinLabel = "";

  for (const c of CAMPAIGNS) {
    for (const p of PLATFORMS) {
      const rate = c.cpmRates[p] ?? 0;
      if (rate > bestCpm) {
        bestCpm = rate;
        bestOverallLabel = `${c.shortName} on ${PLATFORM_LABELS[p]} (${fmtDollar(rate)}/1K)`;
      }
      if (p === "youtube" && rate > bestYtCpm) {
        bestYtCpm = rate;
        bestYtLabel = `${c.shortName} (${fmtDollar(rate)}/1K)`;
      }
    }
    if (c.minPayout < lowestMin) {
      lowestMin = c.minPayout;
      lowestMinLabel = `${c.shortName} (${fmtDollar(c.minPayout)} minimum)`;
    }
  }

  return {
    bestOverall: bestOverallLabel,
    bestYoutube: bestYtLabel,
    mostAccessible: lowestMinLabel,
  };
}

/* ── Cell Component ──────────────────────────────────── */

interface CellProps {
  cpm: number;
  maxPayout: number;
  viewCount: number;
  isHovered: boolean;
  isCrossRow: boolean;
  isCrossCol: boolean;
  animDelay: number;
  hasAnimated: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MatrixCell({
  cpm,
  maxPayout,
  viewCount,
  isHovered,
  isCrossRow,
  isCrossCol,
  animDelay,
  hasAnimated,
  onMouseEnter,
  onMouseLeave,
}: CellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [displayCpm, setDisplayCpm] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const hasCountedRef = useRef(false);

  useEffect(() => {
    if (!hasAnimated || hasCountedRef.current) return;
    hasCountedRef.current = true;

    const timer = setTimeout(() => {
      animate(
        (progress: number) => {
          setOpacity(progress);
        },
        { duration: 0.5, easing: [0.16, 1, 0.3, 1] }
      );

      if (cpm > 0) {
        animate(
          (progress: number) => {
            setDisplayCpm(Math.round(progress * cpm * 100) / 100);
          },
          { duration: 0.9, easing: [0.16, 1, 0.3, 1] }
        );
      }
    }, animDelay);

    return () => clearTimeout(timer);
  }, [hasAnimated, animDelay, cpm]);

  const { amount: earnings, capped } = calcEarnings(cpm, viewCount, maxPayout);
  const isCrossHighlight = (isCrossRow || isCrossCol) && !isHovered;

  return (
    <div
      ref={cellRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "relative",
        padding: isHovered ? "12px 10px" : "14px 10px",
        borderRadius: 10,
        background: isHovered
          ? cpmToCellBg(cpm, true)
          : isCrossHighlight
            ? `rgba(255,255,255,0.03)`
            : cpmToCellBg(cpm, false),
        border: isHovered
          ? "1px solid rgba(34,197,94,0.4)"
          : "none",
        cursor: "default",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: isHovered ? cpmToGlow(cpm) : "none",
        opacity: opacity,
        transform: isHovered ? "scale(1.04)" : "scale(1)",
        zIndex: isHovered ? 10 : 1,
        minHeight: isHovered ? 120 : 72,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isHovered ? 6 : 2,
        overflow: "hidden",
      }}
    >
      {/* CPM rate */}
      <span
        style={{
          fontSize: isHovered ? 22 : 20,
          fontWeight: 800,
          color: cpmToTextColor(displayCpm),
          letterSpacing: "-0.5px",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          fontFamily: "'Geist Mono', monospace",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {cpm <= 0 ? "\u2014" : `$${displayCpm.toFixed(2)}`}
      </span>

      {cpm > 0 && !isHovered && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.3px",
          }}
        >
          /1K views
        </span>
      )}

      {/* Hover expansion: earnings projection */}
      {isHovered && cpm > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 2,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            Est. Earnings
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: cpmToTextColor(cpm),
              fontVariantNumeric: "tabular-nums",
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {fmtViewCount(viewCount)} views{" "}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>&rarr;</span>{" "}
            <span style={{ fontWeight: 800 }}>{fmtDollar(earnings)}</span>
          </span>
          {capped && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#eab308",
                background: "rgba(234,179,8,0.1)",
                border: "1px solid rgba(234,179,8,0.2)",
                borderRadius: 4,
                padding: "1px 6px",
                letterSpacing: "0.3px",
              }}
            >
              capped at {fmtDollar(maxPayout)}
            </span>
          )}
        </div>
      )}

      {isHovered && cpm <= 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "rgba(255,255,255,0.25)",
            marginTop: 2,
          }}
        >
          Not available
        </span>
      )}
    </div>
  );
}

/* ── Row Header ──────────────────────────────────────── */

interface RowHeaderProps {
  campaign: CampaignData;
  isExpanded: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}

function RowHeader({
  campaign,
  isExpanded,
  isHighlighted,
  onClick,
}: RowHeaderProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "12px 16px 12px 0",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        background: isHighlighted
          ? "rgba(255,255,255,0.03)"
          : "transparent",
        borderRadius: "10px 0 0 10px",
        position: "sticky",
        left: 0,
        zIndex: 5,
        minWidth: 160,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        {/* Status dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background:
              campaign.status === "active" ? "#16a34a" : "#6b7280",
            boxShadow:
              campaign.status === "active"
                ? "0 0 6px rgba(22,163,74,0.5)"
                : "none",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.2px",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          {campaign.shortName}
        </span>
        {/* Expand chevron */}
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            transition: "transform 0.25s ease",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            marginLeft: "auto",
          }}
        >
          {"\u25BC"}
        </span>
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          paddingLeft: 15,
        }}
      >
        {fmtDollar(campaign.budget)} budget
      </span>

      {/* Expanded details */}
      {isExpanded && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            paddingLeft: 15,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.25)" }}>{"\u25B8"}</span>
            Max payout:{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {fmtDollar(campaign.maxPayout)}
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.25)" }}>{"\u25B8"}</span>
            Min payout:{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {fmtDollar(campaign.minPayout)}
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.25)" }}>{"\u25B8"}</span>
            Status:{" "}
            <span
              style={{
                color:
                  campaign.status === "active" ? "#16a34a" : "#6b7280",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {campaign.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── View Count Slider ───────────────────────────────── */

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
}

const SLIDER_STOPS = [
  1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000,
  2_500_000, 5_000_000, 10_000_000,
];

function ViewSlider({ value, onChange }: SliderProps) {
  const idx = SLIDER_STOPS.indexOf(value);
  const sliderIdx = idx >= 0 ? idx : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        background: "transparent",
        borderRadius: 0,
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}
      >
        Estimate earnings at
      </span>
      <div
        style={{
          position: "relative",
          flex: 1,
          minWidth: 140,
          height: 24,
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="range"
          min={0}
          max={SLIDER_STOPS.length - 1}
          step={1}
          value={sliderIdx}
          onChange={(e) => {
            const i = parseInt(e.target.value, 10);
            onChange(SLIDER_STOPS[i]);
          }}
          style={{
            width: "100%",
            height: 4,
            WebkitAppearance: "none",
            appearance: "none",
            background: `linear-gradient(to right, rgba(34,197,94,0.5) ${(sliderIdx / (SLIDER_STOPS.length - 1)) * 100}%, rgba(255,255,255,0.1) ${(sliderIdx / (SLIDER_STOPS.length - 1)) * 100}%)`,
            borderRadius: 2,
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#22c55e",
          fontVariantNumeric: "tabular-nums",
          fontFamily: "'Geist Mono', monospace",
          letterSpacing: "-0.5px",
          minWidth: 70,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {fmtViewCount(value)} views
      </span>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */

export function CpmMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [viewCount, setViewCount] = useState(100_000);

  const insights = useMemo(() => computeInsights(), []);

  const triggerAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
  }, [hasAnimated]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          triggerAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerAnimation]);

  return (
    <div
      ref={containerRef}
      style={{
        background: "transparent",
        padding: "16px",
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <div
        style={{
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.5px",
            margin: "0 0 4px",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          CPM Comparison Matrix
        </h3>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}
        >
          Earnings per 1,000 views across campaigns and platforms
        </p>
      </div>

      {/* View Count Slider */}
      <ViewSlider value={viewCount} onChange={setViewCount} />

      {/* Scrollable matrix wrapper */}
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          marginBottom: 20,
          borderRadius: 0,
          border: "none",
        }}
      >
        {/* CSS Grid Matrix */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px, 200px) repeat(4, 1fr)",
            gap: 0,
            minWidth: 600,
          }}
        >
          {/* Top-left corner (empty) */}
          <div
            style={{
              padding: "12px 16px",
              position: "sticky",
              left: 0,
              zIndex: 6,
              background: "transparent",
            }}
          />

          {/* Column headers */}
          {PLATFORMS.map((platform, colIdx) => (
            <div
              key={platform}
              style={{
                padding: "12px 8px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background:
                  hoveredCell?.col === colIdx
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
                transition: "background 0.25s ease",
              }}
            >
              {/* Platform icon circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${PLATFORM_COLORS[platform]}18`,
                  border: `1px solid ${PLATFORM_COLORS[platform]}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: PLATFORM_COLORS[platform],
                }}
              >
                {PLATFORM_ICONS[platform]}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color:
                    hoveredCell?.col === colIdx
                      ? PLATFORM_COLORS[platform]
                      : "rgba(255,255,255,0.7)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "color 0.25s ease",
                  whiteSpace: "nowrap",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {PLATFORM_LABELS[platform]}
              </span>
            </div>
          ))}

          {/* Rows */}
          {CAMPAIGNS.map((campaign, rowIdx) => (
            <div
              key={campaign.shortName}
              style={{
                display: "contents",
              }}
            >
              {/* Row header */}
              <div
                style={{
                  borderBottom:
                    rowIdx < CAMPAIGNS.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  background: "transparent",
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                }}
              >
                <RowHeader
                  campaign={campaign}
                  isExpanded={expandedRow === rowIdx}
                  isHighlighted={hoveredCell?.row === rowIdx}
                  onClick={() =>
                    setExpandedRow(expandedRow === rowIdx ? null : rowIdx)
                  }
                />
              </div>

              {/* Data cells */}
              {PLATFORMS.map((platform, colIdx) => {
                const cpm = campaign.cpmRates[platform] ?? 0;
                const delay = (rowIdx * PLATFORMS.length + colIdx) * 70;
                const isThisHovered =
                  hoveredCell?.row === rowIdx &&
                  hoveredCell?.col === colIdx;
                const isCrossRow = hoveredCell?.row === rowIdx;
                const isCrossCol = hoveredCell?.col === colIdx;

                return (
                  <div
                    key={`${campaign.shortName}-${platform}`}
                    style={{
                      padding: 4,
                      borderBottom:
                        rowIdx < CAMPAIGNS.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                      background:
                        isCrossRow || isCrossCol
                          ? isThisHovered
                            ? "transparent"
                            : "rgba(255,255,255,0.015)"
                          : "transparent",
                      transition: "background 0.25s ease",
                    }}
                  >
                    <MatrixCell
                      cpm={cpm}
                      maxPayout={campaign.maxPayout}
                      viewCount={viewCount}
                      isHovered={isThisHovered}
                      isCrossRow={isCrossRow ?? false}
                      isCrossCol={isCrossCol ?? false}
                      animDelay={delay}
                      hasAnimated={hasAnimated}
                      onMouseEnter={() =>
                        setHoveredCell({ row: rowIdx, col: colIdx })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Insight Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {[
          {
            icon: "\uD83C\uDFC6",
            label: "Best CPM",
            value: insights.bestOverall,
            color: "#22c55e",
          },
          {
            icon: "\u25B6",
            label: "Best for YouTube",
            value: insights.bestYoutube,
            color: "#ff0000",
          },
          {
            icon: "\u2713",
            label: "Most Accessible",
            value: insights.mostAccessible,
            color: "#60a5fa",
          },
        ].map((insight, i) => (
          <div
            key={insight.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: "transparent",
              borderRadius: 0,
              border: "none",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              flex: "1 1 220px",
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>
              {insight.icon}
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: insight.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {insight.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.6)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {insight.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Slider thumb styling */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid transparent;
          box-shadow: 0 0 8px rgba(34,197,94,0.4), 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 14px rgba(34,197,94,0.6), 0 2px 8px rgba(0,0,0,0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid transparent;
          box-shadow: 0 0 8px rgba(34,197,94,0.4), 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
