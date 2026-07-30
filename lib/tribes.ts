export type TribeId = "ramaytush" | "muwekma";

export type Tribe = {
  id: TribeId;
  name: string;
  taxName: string;
  region: string;
  /** Short framing drawn from the tribe's own public materials. */
  blurb: string;
  siteUrl: string;
  /** Env var that holds this tribe's Stripe connected account id. */
  accountEnv: string;
  /** One-time annual land tax for machine (MPP) payers, in cents. */
  annualMachineTaxCents: number;
};

export const tribes: Record<TribeId, Tribe> = {
  ramaytush: {
    id: "ramaytush",
    name: "Association of Ramaytush Ohlone",
    taxName: "Yunakin Land Tax",
    region: "San Francisco Peninsula",
    blurb:
      "The Ramaytush Ohlone are the original peoples of the San Francisco Peninsula. Yunakin — from the Ramaytush word for village — is their voluntary land tax for people living on the Peninsula.",
    siteUrl: "https://www.ramaytush.org",
    accountEnv: "TEND_ACCT_RAMAYTUSH",
    annualMachineTaxCents: 2500,
  },
  muwekma: {
    id: "muwekma",
    name: "Muwekma Ohlone Tribe",
    taxName: "Ohlone Land Tax",
    region: "East & South San Francisco Bay",
    blurb:
      "The Muwekma Ohlone Tribe comprises documented descendants of the Verona Band of Alameda County, with ancestral ties across the East and South Bay. This voluntary land tax supports the tribe's work toward restored federal recognition and land return.",
    siteUrl: "https://muwekma.org",
    accountEnv: "TEND_ACCT_MUWEKMA",
    annualMachineTaxCents: 2500,
  },
};

/**
 * County → tribes whose published territorial definitions include it.
 * Tend never arbitrates boundaries: where definitions overlap, every
 * matching tribe is shown and the contributor chooses.
 */
export const countyTribes: Record<string, TribeId[]> = {
  "San Francisco": ["ramaytush"],
  "San Mateo": ["ramaytush"],
  "Santa Clara": ["ramaytush", "muwekma"],
  Alameda: ["muwekma"],
  "Contra Costa": ["muwekma"],
};

export const countyNotes: Record<string, string> = {
  "Santa Clara":
    "Santa Clara County appears in both tribes' published definitions — the Ramaytush description reaches northwest from Cupertino, and Muwekma ancestral territory covers the South Bay. Both are shown; the choice is yours, and splitting a pledge across both is welcome.",
  Alameda:
    "Sogorea Te' Land Trust's Shuumi Land Tax also serves the East Bay (Lisjan Ohlone). Tend shows the tribes it hosts; Shuumi lives at sogoreate-landtrust.org.",
  "Contra Costa":
    "Sogorea Te' Land Trust's Shuumi Land Tax also serves the East Bay (Lisjan Ohlone). Tend shows the tribes it hosts; Shuumi lives at sogoreate-landtrust.org.",
};

export const coveredCounties = Object.keys(countyTribes);

export function tribesForCounty(county: string): Tribe[] {
  return (countyTribes[county] ?? []).map((id) => tribes[id]);
}

export function getTribe(id: string): Tribe | undefined {
  return (tribes as Record<string, Tribe>)[id];
}

/** Connected account id for a tribe, if provisioned. */
export function getTribeAccount(id: TribeId): string | undefined {
  return process.env[tribes[id].accountEnv] || undefined;
}
