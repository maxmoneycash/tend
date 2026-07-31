export type TribeId = "ramaytush" | "muwekma";

export type Tribe = {
  id: TribeId;
  name: string;
  taxName: string;
  region: string;
  /** Short framing drawn from the tribe's own public materials. */
  blurb: string;
  siteUrl: string;
  officialProgramUrl: string;
  officialDonationUrl: string;
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
      'The Association of Ramaytush Ohlone describes Yunakin Land Tax as a financial contribution. The program is for people in San Francisco, San Mateo, and part of Santa Clara County. Its page says Yunakin is the Ramaytush word for "village." Contributions can be one-time or recurring.',
    siteUrl: "https://www.ramaytush.org",
    officialProgramUrl: "https://www.ramaytush.org/donate.html",
    officialDonationUrl:
      "https://ramaytush.kindful.com/?campaign=1199658",
    accountEnv: "TEND_ACCT_RAMAYTUSH",
    annualMachineTaxCents: 2500,
  },
  muwekma: {
    id: "muwekma",
    name: "Muwekma Ohlone Preservation Foundation",
    taxName: "Shuumi Land Tax",
    region: "San Francisco Bay Area",
    blurb:
      'The Shuumi Land Tax page describes a voluntary annual contribution that supports the work of the Muwekma Ohlone Preservation Foundation. The page says Shuumi means "gift" in Chochenyo.',
    siteUrl: "https://www.muwekmafoundation.org/home",
    officialProgramUrl: "https://www.muwekmafoundation.org/shuumi",
    officialDonationUrl: "https://www.muwekmafoundation.org/donate",
    accountEnv: "TEND_ACCT_MUWEKMA",
    annualMachineTaxCents: 2500,
  },
};

export const relatedGivingPrograms = [
  {
    name: "Sogorea Te’ Land Trust",
    taxName: "Shuumi Land Tax",
    people: "Lisjan Ohlone",
    region: "East Bay",
    summary:
      "Sogorea Te’ Land Trust runs a separate Shuumi Land Tax for people who live or do business on Lisjan Ohlone land.",
    programUrl:
      "https://sogoreate-landtrust.org/pay-the-shuumi-land-tax/",
    faqUrl: "https://sogoreate-landtrust.org/shuumi-land-tax-faqs/",
  },
] as const;

/**
 * County → tribes whose published territorial definitions include it.
 * Tend never arbitrates boundaries: where definitions overlap, every
 * matching tribe is shown and the contributor chooses.
 */
export const countyTribes: Record<string, TribeId[]> = {
  "San Francisco": ["ramaytush", "muwekma"],
  "San Mateo": ["ramaytush", "muwekma"],
  "Santa Clara": ["ramaytush", "muwekma"],
  Alameda: ["muwekma"],
  "Contra Costa": ["muwekma"],
};

export const countyNotes: Record<string, string> = {
  "Santa Clara":
    "A county result is not precise enough to resolve Santa Clara's territorial boundaries. Tend shows both possible matches and does not decide between them.",
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
