"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Navbar } from "@/components/layout/Navbar";

import { Skeleton, FadeInSection } from "./shared";
import { SECTION_IDS, FALLBACK_STATS } from "./constants";
import { fmtDollar } from "./helpers";
import type { StatsData, Campaign, Insight, RedditPost, DisputeSummary, PayoutVelocityData } from "./types";

// ─── Section components ──────────────────────────────────────────
import { HeroSection } from "./sections/HeroSection";
import { MarketplaceXRay } from "./sections/MarketplaceXRay";
import { TradingEconomy } from "./sections/TradingEconomy";
import { TradingMarketplaceDeep } from "./sections/TradingMarketplaceDeep";
import { TopTraders } from "./sections/TopTraders";
import { TradingIndicators } from "./sections/TradingIndicators";
import { CROverview } from "./sections/CROverview";
import { RequirementsCliff } from "./sections/RequirementsCliff";
import { KillVsHelp } from "./sections/KillVsHelp";
import { FailureFunnel } from "./sections/FailureFunnel";
import { ViralDna } from "./sections/ViralDna";
import { Economics } from "./sections/Economics";
import { PayoutEconomics } from "./sections/PayoutEconomics";
import { PlatformWars } from "./sections/PlatformWars";
import { TradingCR } from "./sections/TradingCR";
import { ImpossibleCampaigns } from "./sections/ImpossibleCampaigns";
import { ClarityScore } from "./sections/ClarityScore";
import { TitleWords } from "./sections/TitleWords";
import { SuccessPredictors } from "./sections/SuccessPredictors";
import { CreatorDisputes } from "./sections/CreatorDisputes";
import { ManualProblem } from "./sections/ManualProblem";
import { EvidencePacks } from "./sections/EvidencePacks";
import { ManualVsAuto } from "./sections/ManualVsAuto";
import { WhitepaperReality } from "./sections/WhitepaperReality";
import { Takeaways } from "./sections/Takeaways";
import { TraderLTV } from "./sections/TraderLTV";
import { WhopTradeThesis } from "./sections/WhopTradeThesis";

// ─── Helpers ─────────────────────────────────────────────────────

const Divider = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
);

// ─── Component ───────────────────────────────────────────────────

export function CRExplorer() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [, setCampaigns] = useState<Campaign[]>([]);
  const [, setInsights] = useState<Insight[]>([]);
  const [disputes, setDisputes] = useState<RedditPost[]>([]);
  const [disputeSummary, setDisputeSummary] = useState<DisputeSummary | null>(null);
  const [payoutVelocity, setPayoutVelocity] = useState<PayoutVelocityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("hero");
  const [showToc, setShowToc] = useState(false);
  const tocScrollRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ──────────────────────────────────────────────
  useEffect(() => {
    document.title = "Content Rewards Explorer -- Research Report";
    let cancelled = false;

    async function load() {
      const errs: string[] = [];

      const [statsRes, campaignsRes, insightsRes, disputesRes, velocityRes] = await Promise.allSettled([
        fetch("/api/cr/stats"),
        fetch("/api/cr/campaigns?sort=budget&order=desc&limit=10"),
        fetch("/api/cr/insights?actionable=true"),
        fetch("/api/cr/disputes?source=reddit&is_dispute=true&limit=5"),
        fetch("/api/cr/payout-velocity"),
      ]);

      if (!cancelled) {
        if (statsRes.status === "fulfilled" && statsRes.value.ok) {
          const d = await statsRes.value.json();
          setStats(d.data);
        } else {
          errs.push("stats");
          setStats(FALLBACK_STATS);
        }

        if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
          const d = await campaignsRes.value.json();
          setCampaigns(d.data || []);
        } else {
          errs.push("campaigns");
        }

        if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
          const d = await insightsRes.value.json();
          setInsights(d.data || []);
        } else {
          errs.push("insights");
        }

        if (disputesRes.status === "fulfilled" && disputesRes.value.ok) {
          const d = await disputesRes.value.json();
          setDisputes(d.data?.reddit || []);
          setDisputeSummary(d.summary || null);
        } else {
          errs.push("disputes");
        }

        if (velocityRes.status === "fulfilled" && velocityRes.value.ok) {
          const d = await velocityRes.value.json();
          setPayoutVelocity(d.data || null);
        }

        setErrors(errs);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── IntersectionObserver for TOC highlighting ──────────────────
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            window.history.replaceState(null, "", `#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const s of SECTION_IDS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [loading]);

  // ── Scroll to URL hash after content loads ─────────────────────
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    // Longer delay to ensure all sections are painted (FadeInSection animations)
    const timeout = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [loading]);

  // ── Show TOC bar after scrolling past hero ─────────────────────
  useEffect(() => {
    const onScroll = () => {
      const show = window.scrollY > 200;
      setShowToc(show);
      const navCard = document.querySelector(".nav-card");
      if (navCard) {
        if (show) navCard.classList.add("nav-card--toc-open");
        else navCard.classList.remove("nav-card--toc-open");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.querySelector(".nav-card")?.classList.remove("nav-card--toc-open");
    };
  }, []);

  // ── Auto-scroll the TOC bar to keep active item visible ────────
  useEffect(() => {
    if (!tocScrollRef.current || !showToc) return;
    const activeEl = tocScrollRef.current.querySelector(`[data-toc-id="${activeSection}"]`) as HTMLElement | null;
    if (activeEl) {
      const container = tocScrollRef.current;
      const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeSection, showToc]);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <Skeleton />
      </div>
    );
  }

  const s = stats || FALLBACK_STATS;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />

      {/* ── TOC drawer — seamless navbar extension ── */}
      <div className="navbar fixed left-0 right-0 top-0 z-[999] pointer-events-none" style={{ padding: undefined }}>
        <div className="nav-card" style={{ visibility: "hidden", pointerEvents: "none" }}>
          <span style={{ height: "41px", display: "block" }} />
        </div>
        <motion.div
          className="pointer-events-auto"
          initial={false}
          animate={{ height: showToc ? "auto" : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div
            className="relative"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              background: "rgba(20,20,20,0.39)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              borderRadius: "0 0 18px 18px",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ height: 8 }} />
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
            <div
              className="flex items-center overflow-x-auto"
              ref={tocScrollRef}
              style={{ padding: "8px 80px 10px" }}
            >
              {SECTION_IDS.map((sec, i) => (
                <motion.a
                  key={sec.id}
                  href={`#${sec.id}`}
                  data-toc-id={sec.id}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                    window.history.replaceState(null, "", `#${sec.id}`);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: activeSection === sec.id ? 500 : 400,
                    whiteSpace: "nowrap",
                    color: activeSection === sec.id ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                    background: activeSection === sec.id ? "rgba(255,255,255,0.08)" : "transparent",
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== sec.id) {
                      (e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== sec.id) {
                      (e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                    }
                  }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: showToc ? 1 : 0, y: showToc ? 0 : -6 }}
                  transition={{ delay: showToc ? i * 0.02 : 0, duration: 0.25 }}
                >
                  {sec.label}
                </motion.a>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-0 rounded-br-[18px] pointer-events-none" style={{ width: 96, background: "linear-gradient(to left, rgba(20,20,20,0.7) 30%, transparent)" }} />
            <div className="absolute left-0 top-0 bottom-0 rounded-bl-[18px] pointer-events-none" style={{ width: 96, background: "linear-gradient(to right, rgba(20,20,20,0.7) 30%, transparent)" }} />
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-44 space-y-12">

        {/* Nav */}
        <Link href="/rewards" className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Dashboard
        </Link>

        {/* ═══════════════════════════════════════════════════════════
            PART 1: The Land Beneath
            ═══════════════════════════════════════════════════════════ */}
        <FadeInSection>
          <div className="text-center py-8">
            <div className="text-[10px] font-semibold text-[#FA4616] uppercase tracking-[0.25em] mb-1">Part 1</div>
            <div className="text-[18px] sm:text-[22px] font-bold text-white mb-1">The Land Beneath</div>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">Product listings, member counts, revenue estimates, and creator behavior across 27,000+ trading products — sourced from WhopScan and Firecrawl deep scrapes. This is what people are buying and selling on Whop, not what they are promoting.</p>
          </div>
        </FadeInSection>

        <HeroSection stats={s} />
        <Divider />
        <MarketplaceXRay />
        <Divider />
        <TradingEconomy />
        <Divider />
        <TradingMarketplaceDeep />
        <Divider />
        <TopTraders />
        <Divider />
        <TradingIndicators />
        <Divider />

        {/* ═══════════════════════════════════════════════════════════
            PART 2: The Opportunity
            ═══════════════════════════════════════════════════════════ */}
        <FadeInSection>
          <div className="my-12 text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[#FA4616] uppercase tracking-[0.15em]">Part 2</span>
              <span className="w-px h-3 bg-zinc-700" />
              <span className="text-[12px] font-semibold text-white">The Opportunity</span>
            </div>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-3">Industry LTV benchmarks from Robinhood, Coinbase, eToro, and Kalshi public filings — cross-referenced with Whop marketplace data to quantify the revenue gap.</p>
          </div>
        </FadeInSection>

        <TraderLTV />
        <Divider />
        <WhopTradeThesis />
        <Divider />

        {/* ═══════════════════════════════════════════════════════════
            PART 3: Content Rewards Campaigns
            ═══════════════════════════════════════════════════════════ */}
        <FadeInSection>
          <div className="text-center py-8">
            <div className="text-[10px] font-semibold text-[#FA4616] uppercase tracking-[0.25em] mb-1">Part 3</div>
            <div className="text-[18px] sm:text-[22px] font-bold text-white mb-1">Content Rewards Campaigns</div>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">Separate dataset from Parts 1-2 — these are <span className="text-zinc-300">contentrewards.com campaigns</span> where businesses pay creators to promote their products. {s.totals.campaigns.toLocaleString()} campaigns, {fmtDollar(s.totals.budget_usd)} in budgets.</p>
          </div>
        </FadeInSection>

        <CROverview stats={s} />
        <Divider />
        <RequirementsCliff />
        <KillVsHelp />
        <FailureFunnel />
        <ViralDna />
        <Economics />
        <Divider />
        <PayoutEconomics payoutVelocity={payoutVelocity} disputeSummary={disputeSummary} />
        <Divider />
        <PlatformWars />
        <Divider />
        <TradingCR />
        <Divider />
        <ImpossibleCampaigns stats={s} />
        <ClarityScore />
        <Divider />
        <TitleWords />
        <SuccessPredictors />
        <Divider />
        <CreatorDisputes disputes={disputes} disputeSummary={disputeSummary} />
        <Divider />

        {/* ═══════════════════════════════════════════════════════════
            PART 4: The Shelby Solution
            ═══════════════════════════════════════════════════════════ */}
        <FadeInSection>
          <div className="text-center py-8">
            <div className="text-[10px] font-semibold text-[#FA4616] uppercase tracking-[0.25em] mb-1">Part 4</div>
            <div className="text-[18px] sm:text-[22px] font-bold text-white mb-1">The Shelby Solution</div>
            <p className="text-[11px] text-zinc-500 max-w-md mx-auto leading-relaxed">
              Our data reveals a single root cause behind every issue above: manual evaluation.
              Every rejection, every payout dispute, every dead campaign traces back to humans reviewing content
              without standardized evidence.
            </p>
          </div>
        </FadeInSection>

        <ManualProblem />
        <EvidencePacks />
        <ManualVsAuto />
        <Divider />
        <WhitepaperReality />
        <Divider />
        <Takeaways />

        {/* ═══════════════════════════════════════════════════════════
            Data Sources Footer
            ═══════════════════════════════════════════════════════════ */}
        <div className="surface-1 rounded-[14px] p-4">
          <h3 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
            Data Sources &amp; Methodology
          </h3>
          <div className="text-[10px] text-zinc-500 leading-relaxed space-y-1">
            <p>
              Analysis based on{" "}
              <span className="text-zinc-300">{s.totals.campaigns.toLocaleString()} campaigns</span> from contentrewards.com API,{" "}
              <span className="text-zinc-300">246 scraped Whop campaign pages</span>,{" "}
              <span className="text-zinc-300">291 Reddit posts</span> (57 dispute-flagged),{" "}
              <span className="text-zinc-300">5 Trustpilot reviews</span>
            </p>
            <p className="text-zinc-600">
              Statistical methods: decision tree feature importance, Gini coefficient, correlation analysis,
              funnel analysis, NLP-based title/description analysis, astroturfing detection via account age + posting pattern analysis
            </p>
            <p className="text-zinc-600">
              Report generated March 2026. Data refreshed daily.
            </p>
          </div>

          {errors.length > 0 && (
            <div className="mt-2 text-[9px] text-yellow-500/60">
              Some data loaded from cached analysis: {errors.join(", ")}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Stats API", href: "/api/cr/stats" },
              { label: "Campaigns API", href: "/api/cr/campaigns" },
              { label: "Insights API", href: "/api/cr/insights" },
              { label: "Disputes API", href: "/api/cr/disputes" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-600 text-[9px] font-mono hover:text-zinc-400 hover:bg-white/[0.06] transition-colors"
              >
                {link.label} &#x2197;
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
