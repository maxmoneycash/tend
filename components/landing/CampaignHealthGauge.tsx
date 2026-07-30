"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { animate } from "motion";

/* ── Campaign data (Yunakin Land Tax) ─────────── */
const CAMPAIGN = {
  name: "Yunakin Land Tax",
  budgetUsed: 789.59,
  budgetTotal: 2000.0,
  status: "ACTIVE" as const,
  views: 2_070_000,
  submissions: 8,
  avgBotScore: 13,
  cpmRate: 0.75,
};

const BUDGET_PCT = (CAMPAIGN.budgetUsed / CAMPAIGN.budgetTotal) * 100; // 39.5%

/* ── Helpers ─────────────────────────────────────────── */

function fmtViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtDollar(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Returns a color on the green-yellow-red gradient for 0-100% */
function gaugeColor(pct: number): string {
  if (pct <= 40) return "#16a34a";
  if (pct <= 60) return "#eab308";
  if (pct <= 80) return "#f97316";
  return "#ef4444";
}

/* ── Stat Pod ────────────────────────────────────────── */

interface StatPodProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
}

function StatPod({ icon, value, label, color }: StatPodProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minWidth: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color || "rgba(255,255,255,0.7)",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.3px",
          lineHeight: 1.2,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────── */

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

/* ── Main Component ──────────────────────────────────── */

export function CampaignHealthGauge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayPct, setDisplayPct] = useState(0);
  const [displayViews, setDisplayViews] = useState("0");
  const [displaySubs, setDisplaySubs] = useState("0");
  const [displayBot, setDisplayBot] = useState("0");
  const [displayCpm, setDisplayCpm] = useState("$0.00");
  const [displayBudget, setDisplayBudget] = useState("$0.00");

  const runAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    // Arc animation
    const radius = 90;
    const circumference = Math.PI * radius; // half-circle
    const target = (BUDGET_PCT / 100) * circumference;

    if (arcRef.current) {
      animate(
        (progress: number) => {
          const current = progress * target;
          arcRef.current!.style.strokeDashoffset = String(circumference - current);
        },
        { duration: 1.6, easing: [0.16, 1, 0.3, 1] }
      );
    }

    // Counter: percentage
    animate(
      (progress: number) => {
        setDisplayPct(Math.round(progress * BUDGET_PCT * 10) / 10);
      },
      { duration: 1.6, easing: [0.16, 1, 0.3, 1] }
    );

    // Counter: views
    animate(
      (progress: number) => {
        setDisplayViews(fmtViews(Math.round(progress * CAMPAIGN.views)));
      },
      { duration: 1.4, easing: [0.16, 1, 0.3, 1] }
    );

    // Counter: submissions
    animate(
      (progress: number) => {
        setDisplaySubs(String(Math.round(progress * CAMPAIGN.submissions)));
      },
      { duration: 1.2, easing: [0.16, 1, 0.3, 1] }
    );

    // Counter: bot score
    animate(
      (progress: number) => {
        setDisplayBot(String(Math.round(progress * CAMPAIGN.avgBotScore)));
      },
      { duration: 1.2, easing: [0.16, 1, 0.3, 1] }
    );

    // Counter: CPM
    animate(
      (progress: number) => {
        setDisplayCpm("$" + (progress * CAMPAIGN.cpmRate).toFixed(2));
      },
      { duration: 1.3, easing: [0.16, 1, 0.3, 1] }
    );

    // Counter: budget used
    animate(
      (progress: number) => {
        setDisplayBudget(fmtDollar(progress * CAMPAIGN.budgetUsed));
      },
      { duration: 1.5, easing: [0.16, 1, 0.3, 1] }
    );
  }, [hasAnimated]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runAnimation]);

  const radius = 90;
  const circumference = Math.PI * radius;
  const currentColor = gaugeColor(displayPct);

  return (
    <div
      ref={containerRef}
      style={{
        background: "transparent",
        padding: "0 8px",
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      {/* SVG Gauge */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          marginBottom: 8,
        }}
      >
        <svg
          viewBox="0 0 220 130"
          style={{ width: "100%", maxWidth: 320, overflow: "visible" }}
        >
          {/* Background arc (track) */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored gradient arc */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <circle
            ref={arcRef}
            cx="110"
            cy="120"
            r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform="rotate(180 110 120)"
            style={{ transition: "none" }}
          />

          {/* Glow effect at current position */}
          <circle
            cx="110"
            cy="120"
            r={radius}
            fill="none"
            stroke={currentColor}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={circumference - (displayPct / 100) * circumference}
            transform="rotate(180 110 120)"
            opacity="0.35"
            style={{ filter: "blur(6px)" }}
          />
        </svg>

        {/* Center text overlay */}
        <div
          style={{
            position: "absolute",
            top: "36%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: currentColor,
              letterSpacing: "-1px",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            {displayPct.toFixed(1)}%
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Budget Used
          </span>
        </div>
      </div>

      {/* Campaign info */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.3px",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            {CAMPAIGN.name}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#16a34a",
              background: "rgba(22,163,74,0.12)",
              border: "1px solid rgba(22,163,74,0.25)",
              borderRadius: 6,
              padding: "2px 8px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {CAMPAIGN.status}
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,255,255,0.5)",
            fontVariantNumeric: "tabular-nums",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          {displayBudget} / {fmtDollar(CAMPAIGN.budgetTotal)}
        </span>
      </div>

      {/* Stat pods */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 28,
        }}
      >
        <StatPod
          icon={<EyeIcon />}
          value={displayViews}
          label="Views"
          color="#60a5fa"
        />
        <StatPod
          icon={<DocIcon />}
          value={displaySubs}
          label="Submissions"
          color="#f97316"
        />
        <StatPod
          icon={<ShieldIcon />}
          value={displayBot}
          label="Bot Score"
          color="#16a34a"
        />
        <StatPod
          icon={<DollarIcon />}
          value={displayCpm}
          label="CPM Rate"
          color="#eab308"
        />
      </div>

      {/* Bottom tagline */}
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.3)",
          margin: 0,
          lineHeight: 1.5,
          letterSpacing: "0.2px",
        }}
      >
        Every dollar escrowed on-chain &bull; Every payout cryptographically verified
      </p>
    </div>
  );
}
