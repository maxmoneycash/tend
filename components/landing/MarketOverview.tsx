"use client";

import { useState, useEffect } from "react";

/* ── types ─────────────────────────────────────────────── */

interface Ecosystem {
  total_campaigns: number;
  total_members: number;
  with_payout_rates: number;
  avg_payout_per_1k: number | null;
  min_payout: number | null;
  max_payout: number | null;
  by_type: { type: string; count: number }[];
  by_category?: { category: string; count: number }[];
}

interface Product {
  id: string;
  title: string;
  avg_stars: number | null;
  total_reviews: number;
  member_count: number;
  payout_rate_per_1k: number | null;
  verified: boolean;
  company_title: string | null;
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
  users: number | null;
}

/* ── helpers ───────────────────────────────────────────── */

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

/* ── component ─────────────────────────────────────────── */

export function MarketOverview() {
  const [ecosystem, setEcosystem] = useState<Ecosystem | null>(null);
  const [campaigns, setCampaigns] = useState<Product[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderTab, setLeaderTab] = useState<"earners" | "trending">("earners");

  useEffect(() => {
    async function load() {
      try {
        const [crRes, creatorsRes, trendingRes] = await Promise.all([
          fetch("/api/whop/content-rewards?limit=100&sort=total_reviews&order=desc"),
          fetch("/api/whop/creators?sort=total_earnings&limit=10"),
          fetch("/api/whop/trending"),
        ]);

        if (crRes.ok) {
          const d = await crRes.json();
          setCampaigns(d.data || []);
          setEcosystem(d.ecosystem || null);
        }
        if (creatorsRes.ok) {
          const d = await creatorsRes.json();
          setCreators(d.data || []);
        }
        if (trendingRes.ok) {
          const d = await trendingRes.json();
          setTrending(d.data || []);
        }
      } catch (err) {
        console.error("[MarketOverview] fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rated = campaigns.filter((p) => p.avg_stars !== null && p.total_reviews > 0);
  const avgRating = rated.length > 0
    ? rated.reduce((s, p) => s + p.avg_stars!, 0) / rated.length
    : 0;
  const totalReviews = rated.reduce((s, p) => s + p.total_reviews, 0);

  const tiers = [
    { range: "4.5+", count: rated.filter((p) => p.avg_stars! >= 4.5).length, color: "#16a34a" },
    { range: "4.0-4.5", count: rated.filter((p) => p.avg_stars! >= 4.0 && p.avg_stars! < 4.5).length, color: "#059669" },
    { range: "3.0-4.0", count: rated.filter((p) => p.avg_stars! >= 3.0 && p.avg_stars! < 4.0).length, color: "#eab308" },
    { range: "2.0-3.0", count: rated.filter((p) => p.avg_stars! >= 2.0 && p.avg_stars! < 3.0).length, color: "#f97316" },
    { range: "<2.0", count: rated.filter((p) => p.avg_stars! < 2.0).length, color: "#ef4444" },
  ];

  if (loading) {
    return (
      <section className="section section--gray" id="market">
        <div className="section-inner">
          <div className="pill-badge">Ecosystem</div>
          <h2 className="section-h2">Market Overview</h2>
          <p className="section-p" style={{ color: "#6b7280" }}>Loading market data...</p>
          <div className="mko-grid" style={{ marginTop: 32 }}>
            {[1, 2].map((i) => (
              <div key={i} className="mko-card animate-pulse" style={{ height: 200 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!ecosystem) return null;

  return (
    <section className="section section--gray" id="market">
      <div className="section-inner">
        <div className="pill-badge">Ecosystem</div>
        <h2 className="section-h2">Market Overview</h2>
        <p className="section-p" style={{ color: "#6b7280" }}>
          Live data from {ecosystem.total_campaigns.toLocaleString()} campaigns across the Content Rewards ecosystem.
        </p>

        {/* ── Row 1 ── */}
        <div className="mko-grid" style={{ marginTop: 32 }}>

          {/* Card 1: Dashboard Overview */}
          <div className="mko-card">
            <div className="mko-card-inner mko-dash">
              {/* Top stats row */}
              <div className="mko-dash-row">
                <div className="mko-dash-stat">
                  <div className="mko-dash-stat-val">{ecosystem.total_campaigns.toLocaleString()}</div>
                  <div className="mko-dash-stat-lbl">Total Campaigns</div>
                </div>
                <div className="mko-dash-stat">
                  <div className="mko-dash-stat-val">{fmtNum(ecosystem.total_members)}</div>
                  <div className="mko-dash-stat-lbl">Total Members</div>
                </div>
                <div className="mko-dash-stat">
                  <div className="mko-dash-stat-val">{avgRating > 0 ? avgRating.toFixed(1) : "\u2014"}<span className="mko-dash-star">{"\u2605"}</span></div>
                  <div className="mko-dash-stat-lbl">Avg Rating</div>
                </div>
              </div>

              {/* Payout strip */}
              <div className="mko-dash-payout">
                <div className="mko-dash-payout-label">Avg Payout per 1K Views</div>
                <div className="mko-dash-payout-row">
                  <div className="mko-dash-payout-avg">
                    <span className="mko-dash-payout-amt">${ecosystem.avg_payout_per_1k ?? "\u2014"}</span>
                    <span className="mko-dash-payout-note">across {ecosystem.with_payout_rates} campaigns</span>
                  </div>
                  <div className="mko-dash-payout-minmax">
                    <div className="mko-dash-payout-bound">
                      <span className="mko-dash-payout-bound-val">${ecosystem.min_payout ?? "\u2014"}</span>
                      <span className="mko-dash-payout-bound-lbl">Min</span>
                    </div>
                    <div className="mko-dash-payout-bound">
                      <span className="mko-dash-payout-bound-val mko-dash-payout-bound-val--max">${ecosystem.max_payout ?? "\u2014"}</span>
                      <span className="mko-dash-payout-bound-lbl">Max</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category tags */}
              {ecosystem.by_category?.length > 0 && (
                <div className="mko-dash-tags">
                  {ecosystem.by_category.map((c) => (
                    <span key={c.category} className="mko-dash-tag">
                      {c.category}
                      <span className="mko-dash-tag-n">{c.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Approval Distribution */}
          <div className="mko-card">
            <div className="mko-card-inner">
              <div className="mko-section-label">Approval Distribution</div>
              <div className="mko-tiers">
                {tiers.map((t) => {
                  const pct = rated.length > 0 ? (t.count / rated.length) * 100 : 0;
                  return (
                    <div key={t.range} className="mko-tier-row">
                      <div className="mko-tier-range">{t.range}</div>
                      <div className="mko-tier-bar-bg">
                        <div className="mko-tier-bar-fill" style={{ background: t.color, width: `${Math.max(pct, 1)}%` }} />
                      </div>
                      <div className="mko-tier-count">
                        <strong>{t.count}</strong> <span>({pct.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mko-tier-footer">
                {totalReviews.toLocaleString()} reviews across {rated.length} campaigns
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2 ── */}
        <div className="mko-grid" style={{ marginTop: 20 }}>

          {/* Card 3: Leaderboard (tabbed) */}
          <div className="mko-card">
            <div className="mko-card-inner">
              {/* Tab switcher */}
              <div className="mko-tabs">
                {(["earners", "trending"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeaderTab(tab)}
                    className={`mko-tab ${leaderTab === tab ? "mko-tab--active" : ""}`}
                  >
                    {tab === "earners" ? "Top Earners" : "Trending"}
                  </button>
                ))}
              </div>

              {/* Earners */}
              {leaderTab === "earners" && (
                <div className="mko-list">
                  {creators.slice(0, 8).map((c, i) => (
                    <div key={c.id} className="mko-list-row" style={{ background: i < 3 ? "#fefce8" : "#fafafa", borderColor: i < 3 ? "#fef9c3" : "#f3f4f6" }}>
                      <span className="mko-list-rank" style={{ color: i === 0 ? "#eab308" : i === 1 ? "#9ca3af" : i === 2 ? "#c2884e" : "#6b7280" }}>
                        {i + 1}
                      </span>
                      <div className="mko-list-info">
                        <div className="mko-list-name">@{c.username}</div>
                        <div className="mko-list-sub">{c.whops_count} products</div>
                      </div>
                      <div className="mko-list-val" style={{ color: "#16a34a" }}>
                        {c.total_earnings ? fmtUsd(c.total_earnings) : "\u2014"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending */}
              {leaderTab === "trending" && (
                trending.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 12 }}>
                    No trending data available
                  </div>
                ) : (
                  <div className="mko-list">
                    {trending.slice(0, 8).map((t) => (
                      <div key={t.rank} className="mko-list-row">
                        <span className="mko-list-rank" style={{ color: "#9ca3af" }}>#{t.rank}</span>
                        <div className="mko-list-info">
                          <div className="mko-list-name">{t.product_name}</div>
                          <div className="mko-list-sub">{t.company_name || "\u2014"} · {t.users?.toLocaleString() ?? "\u2014"} users</div>
                        </div>
                        <span className="mko-list-val" style={{ color: "#16a34a" }}>
                          +{t.growth_pct?.toLocaleString() ?? 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Card 4: Disputes + Vaults stacked */}
          <div className="mko-stack">
            {/* Disputes */}
            <a href="/market" className="mko-card mko-card--link">
              <div className="mko-card-inner">
                <div className="mko-cta-header">
                  <div className="mko-cta-icon" style={{ background: "#fef2f2" }}>&#9878;</div>
                  <div className="mko-cta-text">
                    <div className="mko-cta-title">Dispute Resolution</div>
                    <div className="mko-cta-sub">Flagged campaigns &amp; evidence</div>
                  </div>
                  <svg className="mko-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
                <div className="mko-cta-stats">
                  <div><span className="mko-cta-num" style={{ color: "#ef4444" }}>{rated.filter(p => p.avg_stars! < 3.5 && p.total_reviews >= 3).length}</span> <span className="mko-cta-label">flagged</span></div>
                  <div><span className="mko-cta-num">{rated.length}</span> <span className="mko-cta-label">reviewed</span></div>
                  <div><span className="mko-cta-num" style={{ color: "#16a34a" }}>{rated.filter(p => p.avg_stars! >= 4.0).length}</span> <span className="mko-cta-label">healthy</span></div>
                </div>
              </div>
            </a>

            {/* Vaults */}
            <a href="/market" className="mko-card mko-card--link">
              <div className="mko-card-inner">
                <div className="mko-cta-header">
                  <div className="mko-cta-icon" style={{ background: "#f0fdf4" }}>&#128737;</div>
                  <div className="mko-cta-text">
                    <div className="mko-cta-title">Insurance Vaults</div>
                    <div className="mko-cta-sub">Stake &amp; earn on campaign health</div>
                  </div>
                  <svg className="mko-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
                <div className="mko-cta-stats">
                  <div><span className="mko-cta-num">{rated.filter(p => p.total_reviews >= 3).length}</span> <span className="mko-cta-label">vaults</span></div>
                  <div><span className="mko-cta-num" style={{ color: "#16a34a" }}>6-20%</span> <span className="mko-cta-label">APY</span></div>
                  <div><span className="mko-cta-num" style={{ color: "#8B5CF6" }}>{ecosystem.total_members > 0 ? fmtNum(Math.round(ecosystem.total_members * 0.12)) : "0"}</span> <span className="mko-cta-label">stakers</span></div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
