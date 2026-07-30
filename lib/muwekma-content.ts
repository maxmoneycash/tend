/* Muwekma & Ohlone content for Tend — drawn from the Muwekma Atlas
 * (presidio-atlas), the user's evidence-tiered research app. Every entry
 * keeps the Atlas's discipline: documented / reported / oral-history /
 * analysis, and summaries stay short with the Atlas as the deep record. */

export type Evidence = "documented" | "reported" | "oral-history" | "analysis";

export interface TimelineEntry {
  date: string;
  title: string;
  body: string;
  evidence: Evidence;
}

export const timeline: TimelineEntry[] = [
  {
    date: "c. 8000 BCE",
    title: "First peoples of the Bay",
    body: "Human presence around San Francisco Bay reaches back at least ten thousand years; the Presidio's own archaeology records 5,000–10,000 years of use across 450+ documented sites.",
    evidence: "documented",
  },
  {
    date: "Deep time",
    title: "The world begins at Tuyshtak",
    body: "Ohlone and Bay Miwok creation narratives place the world's origin on the twin peaks of Mount Diablo — Tuyshtak — where the First People were made after the flood waters receded.",
    evidence: "oral-history",
  },
  {
    date: "c. 3000 BCE",
    title: "Shellmounds rise around the Bay",
    body: "The oldest strata of the West Berkeley Shellmound are roughly five thousand years old — older than the pyramids — first of 425+ mounds mapped around the Bay: burial grounds, ceremonial platforms, village monuments.",
    evidence: "documented",
  },
  {
    date: "c. 100 CE",
    title: "The genomic through-line",
    body: "People buried at Bay Area sites nearly two thousand years ago were shown by a 2022 Stanford/PNAS study to be genetically continuous with living Muwekma Ohlone members.",
    evidence: "documented",
  },
  {
    date: "c. 1500",
    title: "The Yelamu villages",
    body: "Petlenuc near the future Presidio, with Sitlintac and Chutchui by Mission Creek, anchored a Ramaytush Ohlone tribelet tied by trade and marriage to some fifty Ohlone polities around the Bay.",
    evidence: "documented",
  },
  {
    date: "1769–1776",
    title: "Colonization reaches the Bay",
    body: "Portolá's expedition sights the Bay in 1769; the Presidio and Mission Dolores follow in 1776, opening the forty-year unraveling of Bay Area tribal society that scholars call the time of little choice.",
    evidence: "documented",
  },
  {
    date: "1910–1914",
    title: "The Verona Band, federally recognized",
    body: "The ancestors of today's Muwekma are officially designated the Verona Band of Alameda County — a recognition Congress never terminated.",
    evidence: "documented",
  },
  {
    date: "1927",
    title: "Dropped, not dissolved",
    body: "A federal agent's report simply stops dealing with the Verona Band. No act of Congress ended the relationship; the tribe continued while the paperwork went silent.",
    evidence: "documented",
  },
  {
    date: "1995–2002",
    title: "Petition #111",
    body: "Muwekma petitions for restored recognition in 1995 and receives a positive preliminary finding in 1996 — then a denial in 2002, even as the government concedes the tribe descends from the never-terminated Verona Band.",
    evidence: "documented",
  },
  {
    date: "2013",
    title: "Muwekma v. Salazar",
    body: "The D.C. Circuit affirms the denial, holding that previously recognized tribes can 'fade away' — the ruling the tribe has contested ever since.",
    evidence: "documented",
  },
  {
    date: "2022",
    title: "The Stanford genomics study",
    body: "Published in PNAS: living Muwekma members are genetically continuous with ancestors buried around the Bay for two millennia — the strongest new evidence in the recognition record.",
    evidence: "documented",
  },
  {
    date: "2025–2030",
    title: "The re-petition window",
    body: "A January 2025 federal rule allows denied petitioners to seek re-petition until February 2030. The tribe also petitions for a Presidio land base, invoking the Secretary's authority to proclaim new reservations.",
    evidence: "documented",
  },
];

export interface OhloneSite {
  name: string;
  subtitle: string;
  evidence: Evidence;
}

export const presidioSites: OhloneSite[] = [
  { name: "Petlenuc", subtitle: "Yelamu village near the northern Presidio", evidence: "documented" },
  { name: "El Polín Spring", subtitle: "Freshwater spring with thousands of years of Ohlone habitation", evidence: "documented" },
  { name: "Tennessee Hollow", subtitle: "Watershed with documented shell midden deposits", evidence: "documented" },
  { name: "Officers' Club dig", subtitle: "Ohlone artifacts beneath San Francisco's oldest building", evidence: "documented" },
  { name: "Lobos Creek", subtitle: "Western creek drainage with Yelamu village evidence", evidence: "documented" },
  { name: "Sitlintac & Chutchui", subtitle: "Principal Yelamu villages near Mission Creek", evidence: "documented" },
];

export interface Signal {
  date: string;
  title: string;
  detail: string;
  evidence: Evidence;
}

export const signals: Signal[] = [
  {
    date: "Jul 2026",
    title: "Quarterly lobbying filings watched",
    detail: "The public record shows whether the tribe's federal advocacy continued into the anniversary quarter — disclosures are the campaign's heartbeat.",
    evidence: "documented",
  },
  {
    date: "Apr 2026",
    title: "The lobbying target is Interior",
    detail: "Disclosed filings name the Interior Department and 'tribal recognition' — recognition first, land second.",
    evidence: "documented",
  },
  {
    date: "Sep 17, 2026",
    title: "The Presidio's 250th anniversary",
    detail: "A quarter-millennium since the Presidio's founding on Yelamu land — the campaign's most visible date on the calendar.",
    evidence: "documented",
  },
];

export const tribeFacts = [
  { label: "Years on this land", value: "10,000+", note: "documented archaeology around the Bay" },
  { label: "Enrolled members", value: "~600", note: "documented descendants of the Verona Band" },
  { label: "Acres held today", value: "0", note: "no land base in their ancestral territory" },
  { label: "Re-petition window", value: "2030", note: "the federal door open until February 2030" },
];

export const languageFacts = {
  headline: "A language coming home",
  body: "Chochenyo — the Muwekma Ohlone language — is being reawakened from wax cylinders, field notebooks, and community teaching. The Muwekma Atlas language workspace indexes nearly two thousand dictionary entries and over a hundred archival recordings across eight documented Ohlone varieties, with the tribal language community as the authority over spelling, pronunciation, and use.",
  evidence: "documented" as Evidence,
};
