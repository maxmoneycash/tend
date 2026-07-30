import type { StatsData } from "./types";

// ─── Hardcoded analysis data (real data from our analysis) ───────

export const REQUIREMENTS_CLIFF = [
  { reqs: "0", conversion: 4.39, spendRate: 34.63, count: 145 },
  { reqs: "1", conversion: 4.98, spendRate: 29.15, count: 124 },
  { reqs: "2", conversion: 5.13, spendRate: 20.92, count: 45 },
  { reqs: "3", conversion: 1.05, spendRate: 34.92, count: 21 },
  { reqs: "4", conversion: 0.25, spendRate: 19.54, count: 5 },
  { reqs: "5+", conversion: 1.54, spendRate: 22.05, count: 17 },
];

export const REQUIREMENTS_THAT_KILL = [
  { name: "exact_caption", delta: -20.2, spendRate: 5.0 },
  { name: "link_in_bio", delta: -11.5, spendRate: 13.7 },
  { name: "video_length", delta: -9.8, spendRate: 15.3 },
  { name: "google_doc", delta: -9.8, spendRate: 15.4 },
  { name: "logo_required", delta: -8.9, spendRate: 16.2 },
];

export const REQUIREMENTS_THAT_HELP = [
  { name: "auto_reject", delta: 21.1, spendRate: 46.3 },
  { name: "google_drive", delta: 12.2, spendRate: 37.4 },
  { name: "specific_content_source", delta: 7.0, spendRate: 32.1 },
];

export const FUNNEL_STAGES = [
  { label: "Total campaigns", count: 419, pct: 100, dropoff: 0, isRed: false },
  { label: "Has creators (>0)", count: 357, pct: 85.2, dropoff: 14.8, isRed: false },
  { label: "Has submissions (>0)", count: 296, pct: 70.6, dropoff: 17.1, isRed: false },
  { label: "Has spend (>$0)", count: 279, pct: 66.6, dropoff: 5.7, isRed: false },
  { label: "Spent >25%", count: 160, pct: 38.2, dropoff: 42.7, isRed: true },
  { label: "Spent >50%", count: 103, pct: 24.6, dropoff: 35.6, isRed: false },
  { label: "Spent >90%", count: 18, pct: 4.3, dropoff: 82.5, isRed: false },
];

export const DISPUTE_CATEGORIES = [
  { name: "Payout Delays / Payment Issues", count: 22, color: "#EF4444" },
  { name: "Unfair Rejections / Unjustified Bans", count: 11, color: "#F59E0B" },
  { name: "Unclear Requirements / Confusing Rules", count: 8, color: "#3B82F6" },
  { name: "Account Suspensions", count: 5, color: "#8B5CF6" },
  { name: "Campaign Pausing / Platform Changes", count: 5, color: "#06B6D4" },
  { name: "Communication Failures", count: 5, color: "#6B7280" },
  { name: "Bot Detection False Positives", count: 4, color: "#10B981" },
  { name: "ID Verification / Compliance", count: 4, color: "#F97316" },
];

export const PLATFORM_DATA = [
  { name: "TikTok", pct: 85, cpm: 1.85, campaigns: 358, submissions: 178, color: "#00F2EA" },
  { name: "Instagram", pct: 81, cpm: 2.08, campaigns: 339, submissions: 189, color: "#E1306C" },
  { name: "YouTube", pct: 47, cpm: 1.46, campaigns: 197, submissions: 248, color: "#FF0000" },
  { name: "X/Twitter", pct: 16, cpm: 2.76, campaigns: 66, submissions: 76, color: "#1DA1F2" },
];

export const SUCCESS_WORDS = [
  { word: "promo", spendRate: 50.6, delta: "+24.9%" },
  { word: "sound", spendRate: 43.1, delta: "+17.4%" },
  { word: "official", spendRate: 40.3, delta: "+14.6%" },
  { word: "fan", spendRate: 40.2, delta: "+14.5%" },
  { word: "movie", spendRate: 38.5, delta: "+12.8%" },
];

export const FAILURE_WORDS = [
  { word: "test", spendRate: 1.4, delta: "-24.3%" },
  { word: "logo", spendRate: 12.2, delta: "-13.5%" },
  { word: "viral", spendRate: 13.0, delta: "-12.7%" },
  { word: "app", spendRate: 9.6, delta: "-16.1%" },
  { word: "videos", spendRate: 13.2, delta: "-12.5%" },
];

export const DECISION_TREE = [
  { feature: "Creator count >15", above: 57.0, below: 15.3, gain: 0.0858 },
  { feature: "Budget >$1,070", above: 51.5, below: 29.5, gain: 0.0231 },
  { feature: "Campaign age <156h", above: 42.3, below: 14.5, gain: 0.0195 },
  { feature: "Min views >12,917", above: 19.6, below: 40.5, gain: 0.0086 },
  { feature: "Rate >$0.30/1K", above: 40.2, below: 19.5, gain: 0.0076 },
];

// ─── Evidence pack data ──────────────────────────────────────────

export const EVIDENCE_GRID = [
  {
    problem: "Unfair rejection",
    evidence: "Oracle view count + engagement ratio stored on-chain",
    solution: "Creator can prove their clip had 508K verified views",
    problemColor: "text-red-400",
    solutionColor: "text-green-400",
  },
  {
    problem: "Bot accusation",
    evidence: "5-signal bot detection score with Merkle proof",
    solution: "Bot score of 0.12 (legitimate) is cryptographically verifiable",
    problemColor: "text-red-400",
    solutionColor: "text-green-400",
  },
  {
    problem: "Payout dispute",
    evidence: "CPM rate x views = payout, signed by oracle",
    solution: "Every dollar is traceable from view count to wallet",
    problemColor: "text-red-400",
    solutionColor: "text-green-400",
  },
  {
    problem: "Campaign changed terms",
    evidence: "Campaign requirements hashed at creation",
    solution: "Original terms are immutable — can't change retroactively",
    problemColor: "text-red-400",
    solutionColor: "text-green-400",
  },
  {
    problem: "No appeal process",
    evidence: "Full evidence rollup on Shelby blob storage",
    solution: "Independent arbitration using verifiable data",
    problemColor: "text-red-400",
    solutionColor: "text-green-400",
  },
];

export const IMPOSSIBLE_CAMPAIGNS = [
  {
    pattern: "High views, low budget",
    count: 7,
    detail: "Min views >= 10K but budget < $500",
    example: "Budget: $200, Min views: 100,000",
    color: "#EF4444",
  },
  {
    pattern: "High views, low payout",
    count: 5,
    detail: "Min views >= 10K but max payout < $20",
    example: "100K min views, $10 max payout",
    color: "#F59E0B",
  },
  {
    pattern: "Google Doc, no link",
    count: 2,
    detail: "References a Google Doc but provides no URL",
    example: "\"See Google Doc for details\" — no link",
    color: "#8B5CF6",
  },
  {
    pattern: "Overloaded requirements",
    count: 2,
    detail: "8-9 stacked requirements per campaign",
    example: "logo + audio + caption + 3 platforms + doc + views",
    color: "#3B82F6",
  },
];

export const CLARITY_BUCKETS = [
  {
    label: "Wall of text",
    grade: "F",
    conversion: 0.62,
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/[0.04]",
    gradeColor: "text-red-400",
    tagColor: "bg-red-500/10 text-red-400",
    example: "Campaign Description: We are running a logo promotion campaign for Celeste M. Mo... [continues for 800+ chars with no formatting, mixed instructions, multiple platform rules, audio requirements, and Google Doc references all in one paragraph]",
  },
  {
    label: "No description",
    grade: "C",
    conversion: 5.17,
    borderColor: "border-zinc-500/30",
    bgColor: "bg-white/[0.02]",
    gradeColor: "text-zinc-400",
    tagColor: "bg-zinc-500/10 text-zinc-400",
    example: "[No description provided — creators self-select based on title, rate, and platform alone]",
  },
  {
    label: "Structured bullets",
    grade: "A",
    conversion: 8.29,
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/[0.04]",
    gradeColor: "text-green-400",
    tagColor: "bg-green-500/10 text-green-400",
    example: "1. Clip podcast highlights (30-90s)\n2. Post on TikTok + Instagram\n3. Use original audio\n4. Min 10K views to qualify",
  },
];

export const FALLBACK_STATS: StatsData = {
  totals: {
    campaigns: 429,
    budget_usd: 1115772.66,
    spent_usd: 460908.43,
    remaining_usd: 654864.23,
    pct_unspent: 58.7,
    creators: 31247,
    submissions: 89431,
    views: 2147483647,
    avg_success_rate: 42.3,
  },
  economics: {
    avg_cpm: 1.60,
    median_creator_earnings: 7.09,
  },
  by_category: [
    { category: "Personal Brand", count: 146, total_budget: 490200 },
    { category: "Music", count: 69, total_budget: 107176 },
    { category: "Entertainment", count: 57, total_budget: 191677 },
    { category: "Product", count: 64, total_budget: 134889 },
    { category: "Logo", count: 31, total_budget: 104650 },
    { category: "Technology", count: 23, total_budget: 31341 },
    { category: "Other", count: 14, total_budget: 38738 },
  ],
  by_type: [
    { type: "clipping", count: 312, total_budget: 820000 },
    { type: "ugc", count: 87, total_budget: 215000 },
    { type: "both", count: 30, total_budget: 80247.50 },
  ],
  platform_distribution: [
    { platform: "tiktok", campaigns: 358, avg_rate_per_1k: 1.85 },
    { platform: "instagram", campaigns: 339, avg_rate_per_1k: 2.08 },
    { platform: "youtube", campaigns: 197, avg_rate_per_1k: 1.46 },
  ],
};

// ─── Section TOC data ────────────────────────────────────────────

export const SECTION_IDS = [
  // Part 1: Whop Marketplace
  { id: "hero", label: "Overview" },
  { id: "marketplace-xray", label: "Marketplace X-Ray" },
  { id: "trading-economy", label: "Trading Economy" },
  { id: "trading-marketplace-deep", label: "Inside Trading" },
  { id: "top-traders", label: "Trading Leaderboard" },
  { id: "trading-indicators", label: "Indicator Economy" },
  // Part 2: The Opportunity
  { id: "trader-ltv", label: "Trader LTV" },
  { id: "whop-trade-thesis", label: "Whop × Aptos" },
  // Part 3: Content Rewards Campaigns
  { id: "cr-overview", label: "CR Campaigns" },
  { id: "requirements-cliff", label: "Requirements Cliff" },
  { id: "kill-vs-help", label: "Kill vs Help" },
  { id: "failure-funnel", label: "Failure Funnel" },
  { id: "viral-dna", label: "Viral vs Dead" },
  { id: "economics", label: "Economics" },
  { id: "payout-economics", label: "Payout Economics" },
  { id: "platforms", label: "Platform Wars" },
  { id: "trading-cr", label: "Trading Gap (CR vs Marketplace)" },
  { id: "impossible", label: "Impossible Campaigns" },
  { id: "clarity", label: "Clarity Score" },
  { id: "title-words", label: "Title Words" },
  { id: "decision-tree", label: "Success Predictors" },
  { id: "disputes", label: "Creator Disputes" },
  // Part 4: Shelby Solution
  { id: "manual-problem", label: "Manual Problem" },
  { id: "evidence-packs", label: "Evidence Packs" },
  { id: "manual-vs-auto", label: "Manual vs Auto" },
  { id: "whitepaper", label: "Whitepaper vs Reality" },
  { id: "takeaways", label: "Takeaways" },
];
