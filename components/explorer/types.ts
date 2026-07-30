// ─── Types ────────────────────────────────────────────────────────

export interface StatsData {
  totals: {
    campaigns: number;
    budget_usd: number;
    spent_usd: number;
    remaining_usd: number;
    pct_unspent: number;
    creators: number;
    submissions: number;
    views: number;
    avg_success_rate: number;
  };
  economics: {
    avg_cpm: number;
    median_creator_earnings: number;
  };
  by_category: Array<{
    category: string;
    count: number;
    total_budget: number;
  }>;
  by_type: Array<{
    type: string;
    count: number;
    total_budget: number;
  }>;
  platform_distribution: Array<{
    platform: string;
    campaigns: number;
    avg_rate_per_1k: number;
  }>;
}

export interface Campaign {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  campaignType: string | null;
  budgetUsd: number | null;
  budgetSpentUsd: number | null;
  budgetRemainingUsd: number | null;
  ratePerKViews: number | null;
  creatorCount: number | null;
  submissionCount: number | null;
  viewCount: number | null;
  successRate: number | null;
  spend_rate: number;
  earning_per_creator: number;
}

export interface Insight {
  id: string;
  category: string;
  type: string | null;
  priority: number | null;
  title: string;
  description: string | null;
  actionable: boolean | null;
  dataPoints: Record<string, unknown> | null;
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string | null;
  author: string | null;
  subreddit: string | null;
  score: number | null;
  numComments: number | null;
  permalink: string | null;
  isDispute: boolean | null;
  isPayout: boolean | null;
  postedAt: string | null;
}

export interface DisputeSummary {
  reddit: {
    total_posts: number;
    dispute_posts: number;
    payout_mentions: number;
    avg_score: number;
  };
  trustpilot: {
    total_reviews: number;
    avg_stars: number;
    one_star_count: number;
    five_star_count: number;
  };
}

export interface PayoutVelocityData {
  dailyVelocity: number;
  weeklyVelocity: number;
  monthlyVelocity: number;
  annualVelocity: number;
  confidence: "low" | "medium" | "high";
  source: string;
  snapshotDays: number;
  trend: { pctChange: number; direction: string } | null;
  trendDirection: string | null;
  platformBreakdown: Record<string, {
    campaigns?: number;
    spendShare: number;
    estimatedMonthly: number;
  }>;
  note: string;
}
