/* ─── Content Rewards — shared types ─────────────── */

export interface Submission {
  id: string;
  handle: string;
  platform: "youtube" | "tiktok" | "instagram" | "x";
  views: number;
  prevViews: number;
  botScore: number;
  earned: number;
  status: "processing" | "approved" | "flagged" | "claimable" | "paid";
  evidenceHash: string;
  txHash: string;
  shelbyBlob: string;
  lastUpdate: number;
  url?: string;
  videoTitle?: string;
  walletAddress?: string;
  campaignName?: string;
  submittedAt?: number;
  approvedAt?: number;
}

export interface BotSignal {
  score: number;
  weight: number;
  detail: string;
  flag: boolean;
}

export interface EvidenceReport {
  reportId: number;
  hash: string;
  prevHash: string;
  views: number;
  viewDelta: number;
  botScore: number;
  timestamp: number;
  blobName: string;
  blobSize: number;
  apiResponseHash: string;
  oracleAddress: string;
  txHash: string;
}

export interface TimelineEvent {
  type: string;
  label: string;
  ts: number;
  icon: string;
  color: string;
}

export interface PayoutCalc {
  totalViews: number;
  cpmRate: number;
  grossPayout: number;
  flatFeeBonus: number;
  platformFee: number;
  netPayout: number;
  minPayout: number;
  maxPayout: number;
  currency: string;
  payoutTx?: string;
}

export interface SubmissionDetail extends Submission {
  botSignals: Record<string, BotSignal>;
  payout: PayoutCalc;
  evidenceChain: EvidenceReport[];
  timeline: TimelineEvent[];
  platformLabel: string;
  cpmRate: number;
}

export interface Campaign {
  id?: number;
  name: string;
  type: number;
  category: string;
  platforms: number[];
  cpm: number;
  perPlat: boolean;
  cpmRates: number[];
  min: number;
  max: number;
  flat: number;
  budget: number;
  reqs: string[];
  contentLinks: { type: string; url: string }[];
  reqApp: boolean;
  reqDemo: boolean;
  showDisc: boolean;
  reqSound: boolean;
  product: string;
  // Set after creation
  createdAt?: string;
  status?: string;
  paid?: number;
  views?: number;
  subsCount?: number;
}

export interface KeeperLog {
  type: string;
  msg: string;
  color: string;
  id: number;
  ts: string;
}

export interface KeeperState {
  polling: boolean;
  cycle: number;
  reports: number;
}

export interface Clipper {
  name: string;
  handle: string;
  avatar: string;
  views: number;
  clips: number;
  earned: number;
  paid: boolean;
  wallet: string;
}

export interface PayoutTx {
  id: string;
  clipper: string;
  amount: number;
  txHash: string;
  timestamp: number;
  status: "confirmed" | "pending";
}

export type TabId = "dashboard" | "keeper" | "shelby" | "earn" | "market";

export const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
};

export const PLATFORM_ICONS: Record<string, string> = {
  youtube: "\u25B6",
  tiktok: "\u266A",
  instagram: "\u25C9",
  x: "\uD835\uDD4F",
};

export const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  tiktok: "#00F2EA",
  instagram: "#E1306C",
  x: "#ffffff",
};
