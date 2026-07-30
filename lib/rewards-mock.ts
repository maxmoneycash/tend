import type {
  Submission,
  KeeperLog,
  Clipper,
  SubmissionDetail,
  BotSignal,
  EvidenceReport,
  TimelineEvent,
  PayoutCalc,
} from "./rewards-types";

/* ─── Helpers ─────────────────────────────────── */

const HANDLES = [
  "@clipmaster_99",
  "@viralvince",
  "@reels_queen",
  "@tiktok_sarah",
  "@yt_danny",
  "@x_trends",
];
const PLATFORMS = ["youtube", "tiktok", "instagram", "x"] as const;

function rh() {
  return HANDLES[Math.floor(Math.random() * HANDLES.length)];
}
function rp() {
  return PLATFORMS[Math.floor(Math.random() * 4)];
}
export function sh() {
  return Array.from(
    { length: 12 },
    () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
}
export function generateTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

/* ─── Formatters ──────────────────────────────── */

export function fmtViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

export function fmtUSD(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function fmtExact(n: number) {
  return n.toLocaleString();
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function fmtTime(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function shortHash(h: string) {
  return h.length > 20 ? h.slice(0, 10) + "\u2026" + h.slice(-6) : h;
}

export function shortAddr(a: string) {
  return a.slice(0, 8) + "\u2026" + a.slice(-6);
}

/* ─── Submission generator ────────────────────── */

export function mkSub(id: number): Submission {
  const v = Math.floor(Math.random() * 200000) + 5000;
  const b = Math.floor(Math.random() * 100);
  const e = (v / 1000) * 2;
  return {
    id: `s${id}`,
    handle: rh(),
    platform: rp(),
    views: v,
    prevViews: v - Math.floor(Math.random() * 5000),
    botScore: b,
    earned: +e.toFixed(2),
    status: b >= 85 ? "flagged" : v > 50000 ? "approved" : "processing",
    evidenceHash: "sha256:" + sh(),
    txHash: generateTxHash(),
    shelbyBlob: `cr/evidence/${sh().slice(0, 8)}/${Date.now()}.json`,
    lastUpdate: Date.now(),
  };
}

/* ─── Keeper log generator ────────────────────── */

export function mkLogs(sub: Submission): Omit<KeeperLog, "id" | "ts">[] {
  return [
    {
      type: "fetch",
      msg: `\u{1F4E1} Fetching ${sub.platform} API \u2192 ${sub.handle}`,
      color: "text-blue-400",
    },
    {
      type: "views",
      msg: `\u{1F441} ${sub.views.toLocaleString()} views (+${(sub.views - sub.prevViews).toLocaleString()})`,
      color: "text-zinc-400",
    },
    {
      type: "bot",
      msg: `\u{1F916} Bot: ${sub.botScore}/100 ${sub.botScore >= 85 ? "\u26A0\uFE0F FLAGGED" : "\u2713"}`,
      color: sub.botScore >= 85 ? "text-orange-500" : "text-green-500",
    },
    {
      type: "hash",
      msg: `\u{1F510} Evidence: ${sub.evidenceHash}`,
      color: "text-zinc-500",
    },
    {
      type: "shelby",
      msg: `\u{1F4E6} Shelby: ${sub.shelbyBlob.slice(0, 36)}\u2026`,
      color: "text-purple-400",
    },
    {
      type: "tx",
      msg: `\u26D3 Tx: ${sub.txHash.slice(0, 18)}\u2026`,
      color: "text-zinc-600",
    },
    {
      type: "pay",
      msg: `\u{1F4B0} ${sub.handle} +$${sub.earned.toFixed(2)}`,
      color: "text-green-500",
    },
  ];
}

/* ─── Mock clippers ───────────────────────────── */

export const MOCK_CLIPPERS: Clipper[] = [
  {
    name: "Alex Rivera",
    handle: "@alexcuts",
    avatar: "https://unavatar.io/x/alexwatsonj",
    views: 842_000,
    clips: 47,
    earned: 1684.0,
    paid: false,
    wallet: "0x8a2f...c4e1",
  },
  {
    name: "Sarah Kim",
    handle: "@sarahclips",
    avatar: "https://unavatar.io/x/sarahkimm",
    views: 631_000,
    clips: 32,
    earned: 1262.0,
    paid: false,
    wallet: "0x3b7d...a920",
  },
  {
    name: "Marcus Chen",
    handle: "@marcusc",
    avatar: "https://unavatar.io/x/marcusaurelius",
    views: 418_000,
    clips: 24,
    earned: 836.0,
    paid: false,
    wallet: "0xf1e8...6d3b",
  },
  {
    name: "Jada Thompson",
    handle: "@jadaT",
    avatar: "https://unavatar.io/x/jadathompson",
    views: 295_000,
    clips: 19,
    earned: 590.0,
    paid: true,
    wallet: "0x5c44...b8f7",
  },
  {
    name: "Omar Hassan",
    handle: "@omarH",
    avatar: "https://unavatar.io/x/omarhassan",
    views: 187_000,
    clips: 12,
    earned: 374.0,
    paid: true,
    wallet: "0x9e21...d045",
  },
];

export const MOCK_CAMPAIGN = {
  name: "Yunakin Land Tax",
  creator: "Association of Ramaytush Ohlone",
  creatorAvatar: "https://unavatar.io/ramaytush.org",
  budget: 5000,
  spent: 2340,
  rate: 25.0,
  totalViews: 2_373_000,
  totalClips: 87,
  activeClippers: 12,
  period: "July 2026",
};

/* ─── Mock submission detail ──────────────────── */

export function getMockSubmissionDetail(id: string): SubmissionDetail {
  const now = Date.now();

  const botSignals: Record<string, BotSignal> = {
    view_velocity: {
      score: 8,
      weight: 0.25,
      detail: "4,200 views/hr peak — normal for 142K total",
      flag: false,
    },
    engagement_ratio: {
      score: 15,
      weight: 0.3,
      detail: "3.2% like ratio, 0.8% comment ratio — healthy",
      flag: false,
    },
    account_age: {
      score: 5,
      weight: 0.15,
      detail: "Account created 2.4 years ago, 89 prior uploads",
      flag: false,
    },
    view_follower_ratio: {
      score: 18,
      weight: 0.15,
      detail: "142K views / 12.4K subs = 11.5x — slightly high but within range",
      flag: false,
    },
    share_ratio: {
      score: 22,
      weight: 0.15,
      detail: "0.2% share rate — below average, minor flag",
      flag: true,
    },
  };

  const evidenceChain: EvidenceReport[] = [
    {
      reportId: 1,
      hash: "sha256:0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
      prevHash: "sha256:0000000000000000000000000000000000000000",
      views: 12400,
      viewDelta: 12400,
      botScore: 10,
      timestamp: now - 86400000 * 3,
      blobName: "cr/evidence/s1/0a1b2c3d-1709900000.json",
      blobSize: 2847,
      apiResponseHash: "sha256:ff1234567890abcdef1234567890abcdef12345678",
      oracleAddress: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      txHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    },
    {
      reportId: 2,
      hash: "sha256:1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
      prevHash: "sha256:0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
      views: 58300,
      viewDelta: 45900,
      botScore: 11,
      timestamp: now - 86400000 * 2,
      blobName: "cr/evidence/s1/1b2c3d4e-1709986400.json",
      blobSize: 3102,
      apiResponseHash: "sha256:aa9876543210fedcba9876543210fedcba987654",
      oracleAddress: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      txHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    },
    {
      reportId: 3,
      hash: "sha256:2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
      prevHash: "sha256:1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
      views: 118600,
      viewDelta: 60300,
      botScore: 12,
      timestamp: now - 86400000 * 1,
      blobName: "cr/evidence/s1/2c3d4e5f-1710072800.json",
      blobSize: 3244,
      apiResponseHash: "sha256:bb5678901234abcdef5678901234abcdef567890",
      oracleAddress: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      txHash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    },
    {
      reportId: 4,
      hash: "sha256:3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
      prevHash: "sha256:2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
      views: 142800,
      viewDelta: 24200,
      botScore: 12,
      timestamp: now - 3600000,
      blobName: "cr/evidence/s1/3d4e5f6a-1710159200.json",
      blobSize: 3189,
      apiResponseHash: "sha256:cc1234abcdef567890123456abcdef1234567890",
      oracleAddress: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      txHash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    },
  ];

  const timeline: TimelineEvent[] = [
    { type: "submitted", label: "Content submitted", ts: now - 86400000 * 3.2, icon: "\u{1F4E4}", color: "text-blue-400" },
    { type: "oracle", label: "Oracle report #1 \u2014 12.4K views", ts: now - 86400000 * 3, icon: "\u{1F4E1}", color: "text-zinc-400" },
    { type: "bot_pass", label: "Bot check passed \u2014 score 10/100", ts: now - 86400000 * 3, icon: "\u2713", color: "text-green-400" },
    { type: "evidence", label: "Evidence pack \u2192 Shelby", ts: now - 86400000 * 3, icon: "\u25C6", color: "text-purple-400" },
    { type: "oracle", label: "Oracle report #2 \u2014 58.3K views", ts: now - 86400000 * 2, icon: "\u{1F4E1}", color: "text-zinc-400" },
    { type: "evidence", label: "Evidence pack \u2192 Shelby", ts: now - 86400000 * 2, icon: "\u25C6", color: "text-purple-400" },
    { type: "auto_approve", label: "Auto-approved (48hr, no brand rejection)", ts: now - 86400000 * 1.1, icon: "\u23F1", color: "text-green-400" },
    { type: "oracle", label: "Oracle report #3 \u2014 118.6K views", ts: now - 86400000 * 1, icon: "\u{1F4E1}", color: "text-zinc-400" },
    { type: "evidence", label: "Evidence pack \u2192 Shelby", ts: now - 86400000 * 1, icon: "\u25C6", color: "text-purple-400" },
    { type: "payout", label: "Payout: $276.07 USDT", ts: now - 86400000 * 0.8, icon: "\u{1F4B0}", color: "text-green-400" },
    { type: "oracle", label: "Oracle report #4 \u2014 142.8K views (latest)", ts: now - 3600000, icon: "\u{1F4E1}", color: "text-blue-400" },
    { type: "evidence", label: "Evidence pack \u2192 Shelby", ts: now - 3600000, icon: "\u25C6", color: "text-purple-400" },
  ];

  const payout: PayoutCalc = {
    totalViews: 142800,
    cpmRate: 2.0,
    grossPayout: 285.6,
    flatFeeBonus: 5.0,
    platformFee: 14.53,
    netPayout: 276.07,
    minPayout: 0.5,
    maxPayout: 500.0,
    currency: "USDT",
    payoutTx: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
  };

  return {
    id: id || "s1",
    handle: "@clipmaster_99",
    platform: "youtube",
    url: "https://youtube.com/watch?v=xR7q_2dK9aE",
    videoTitle: "How Shelby Protocol Fixes Creator Payouts Forever",
    campaignName: "Shelby Fixes Creator Payouts",
    status: "approved",
    submittedAt: now - 86400000 * 3.2,
    approvedAt: now - 86400000 * 1.1,
    views: 142800,
    prevViews: 118600,
    cpmRate: 2.0,
    platformLabel: "YouTube",
    walletAddress: "0x42a9f1b7e04c8d2a5f6b3e9d1c7a0f8e2d4b6a8c",
    botScore: 12,
    earned: 276.07,
    evidenceHash: "sha256:3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
    txHash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    shelbyBlob: "cr/evidence/s1/3d4e5f6a-1710159200.json",
    lastUpdate: now - 3600000,
    botSignals,
    payout,
    evidenceChain,
    timeline,
  };
}
