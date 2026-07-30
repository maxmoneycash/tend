export interface Platform {
  name: string;
  icon: string;
}

export interface EarningTier {
  platform: string;
  icon: string;
  rate: string;
  min: string;
  max: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  handle?: string;
  avatar: string;
  views: string;
  earned: string;
}

export interface Campaign {
  id: string;
  onChainAddress: string;
  title: string;
  brand: string;
  brandVerified: boolean;
  brandAvatar: string;
  thumbnail: string;
  tags: string[];
  timeAgo: string;
  earned: string;
  earnedNum: number;
  budget: string;
  budgetNum: number;
  rate: string;
  rateNum: number;
  approval: string;
  approvalNum: number;
  views: string;
  creators: string;
  creatorsNum: number;
  platforms: Platform[];
  category: string;
  lastUpdated: string;
  description: string;
  requirements: string[];
  earnings: EarningTier[];
  resources: { label: string; url: string }[];
  leaderboard: LeaderboardEntry[];
  totalViews: string;
  totalSubmissions: string;
  similarityThreshold?: number;
}

const cardIcon = "/tend-logo-light.svg";

/* Tend content: each "campaign" is an Indigenous-led contribution program.
 * Semantics — earned: raised to date · budget: monthly goal · rate: suggested
 * monthly pledge · creators: active supporters · views: county residents
 * reachable. Sample figures are demo-mode placeholders. */
export const campaigns: Campaign[] = [
  {
    id: "yunakin-land-tax",
    onChainAddress: "—",
    title: "Yunakin Land Tax",
    brand: "Association of Ramaytush Ohlone",
    brandVerified: true,
    brandAvatar: "https://unavatar.io/ramaytush.org",
    thumbnail: cardIcon,
    tags: ["Land Tax", "Peninsula"],
    timeAgo: "live",
    earned: "$2,340",
    earnedNum: 2340,
    budget: "$5,000",
    budgetNum: 5000,
    rate: "$25",
    rateNum: 25,
    approval: "100%",
    approvalNum: 100,
    views: "1.9M",
    creators: "12",
    creatorsNum: 12,
    platforms: [
      { name: "San Francisco", icon: cardIcon },
      { name: "San Mateo", icon: cardIcon },
      { name: "Santa Clara", icon: cardIcon },
    ],
    category: "Voluntary land tax",
    lastUpdated: "today",
    description:
      "The Ramaytush Ohlone are the original peoples of the San Francisco Peninsula. Yunakin — from the Ramaytush word for village — is their voluntary land tax for people living on the Peninsula. Pledges recur monthly or yearly and land directly on the organization's own account.",
    requirements: [
      "Voluntary, sliding-scale — every amount is welcome.",
      "For residents of San Francisco, San Mateo, and northwest Santa Clara counties.",
      "Recurring monthly or yearly by card; machines can pay annually over Stripe MPP.",
      "Tend takes no platform fee; payment processing fees may apply.",
      "Cancel anytime — the pledge is yours.",
    ],
    earnings: [
      { platform: "Renting", icon: cardIcon, rate: "$15–40 / mo", min: "$1", max: "any" },
      { platform: "Owning", icon: cardIcon, rate: "$30–75 / mo", min: "$1", max: "any" },
      { platform: "Machines", icon: cardIcon, rate: "$25 / yr", min: "$25", max: "$25" },
    ],
    resources: [
      { label: "ramaytush.org", url: "https://www.ramaytush.org" },
      { label: "About the Yunakin Land Tax", url: "https://www.ramaytush.org/donate.html" },
    ],
    leaderboard: [
      { rank: 1, name: "Supporter", avatar: cardIcon, views: "—", earned: "$50/mo" },
      { rank: 2, name: "Supporter", avatar: cardIcon, views: "—", earned: "$25/mo" },
    ],
    totalViews: "1.9M",
    totalSubmissions: "12",
  },
  {
    id: "muwekma-contribution",
    onChainAddress: "—",
    title: "Muwekma Ohlone contribution",
    brand: "Muwekma Ohlone Preservation Foundation",
    brandVerified: true,
    brandAvatar: "https://unavatar.io/muwekmafoundation.org",
    thumbnail: cardIcon,
    tags: ["Contribution", "East & South Bay"],
    timeAgo: "live",
    earned: "$1,180",
    earnedNum: 1180,
    budget: "$5,000",
    budgetNum: 5000,
    rate: "$25",
    rateNum: 25,
    approval: "100%",
    approvalNum: 100,
    views: "2.4M",
    creators: "9",
    creatorsNum: 9,
    platforms: [
      { name: "Santa Clara", icon: cardIcon },
      { name: "Alameda", icon: cardIcon },
      { name: "Contra Costa", icon: cardIcon },
    ],
    category: "Voluntary contribution",
    lastUpdated: "today",
    description:
      "The Muwekma Ohlone Preservation Foundation supports cultural revitalization, community education, land access, and the Tribe's work toward restored federal recognition. Contributions recur monthly or yearly and land directly on the organization's own account.",
    requirements: [
      "Voluntary, sliding-scale — every amount is welcome.",
      "For residents of the East and South Bay.",
      "Recurring monthly or yearly by card; machines can pay annually over Stripe MPP.",
      "Tend takes no platform fee; payment processing fees may apply.",
      "Cancel anytime — the pledge is yours.",
    ],
    earnings: [
      { platform: "Renting", icon: cardIcon, rate: "$15–40 / mo", min: "$1", max: "any" },
      { platform: "Owning", icon: cardIcon, rate: "$30–75 / mo", min: "$1", max: "any" },
      { platform: "Machines", icon: cardIcon, rate: "$25 / yr", min: "$25", max: "$25" },
    ],
    resources: [
      { label: "muwekmafoundation.org", url: "https://www.muwekmafoundation.org/home" },
      { label: "Muwekma Ohlone Tribe", url: "https://muwekma.org" },
    ],
    leaderboard: [
      { rank: 1, name: "Supporter", avatar: cardIcon, views: "—", earned: "$100/mo" },
      { rank: 2, name: "ci-runner @ acme-robotics", avatar: cardIcon, views: "—", earned: "$25/yr" },
    ],
    totalViews: "2.4M",
    totalSubmissions: "9",
  },
];

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}
