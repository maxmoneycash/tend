export type Evidence = "documented" | "reported" | "oral-history" | "analysis";

type SourcedEntry = {
  sourceName: string;
  sourceUrl: string;
  sourceAction?: string;
};

export interface TimelineEntry extends SourcedEntry {
  date: string;
  title: string;
  body: string;
  evidence: Evidence;
}

export const timeline: TimelineEntry[] = [
  {
    date: "Before 1776",
    title: "Home of the Yelamu",
    body: "The National Park Service maps Petlenuc near the Presidio, with Sitlintac and Chutchui farther south on the San Francisco Peninsula.",
    evidence: "documented",
    sourceName: "National Park Service",
    sourceUrl: "https://www.nps.gov/places/000/8-home-of-the-yelamu.htm",
  },
  {
    date: "1914 to 1927",
    title: "The Verona Band in federal records",
    body: "The Tribe’s recognition page quotes a May 24, 1996 preliminary finding by the Bureau of Indian Affairs (BIA) that the Pleasanton or Verona Band of Alameda County was previously acknowledged between 1914 and 1927.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    date: "1995",
    title: "A recognition petition reaches the White House",
    body: "The Tribe says its historical petition was submitted during a White House meeting of California Indian leaders on January 25, 1995.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    date: "2002",
    title: "The federal petition is denied",
    body: "The Tribe’s recognition page says the BIA issued its Final Determination on September 6, 2002. The BIA considered the Tribe previously recognized. The page says no act of Congress or executive order legally terminated the Tribe.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    date: "2002 and 2004",
    title: "The Tribe records Chochenyo language work",
    body: "The Tribe says it established its Language Committee in 2002. Its language page records a March 2004 workshop and lists a Let’s Speak Chochenyo series and a Let’s Listen to Chochenyo lesson.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/language-revitalization.html",
  },
  {
    date: "2022",
    title: "Genomic research finds an ancient connection",
    body: "A collaborative PNAS study found shared ancestry between present-day Muwekma participants and people buried at nearby sites more than 1,900 years ago.",
    evidence: "documented",
    sourceName: "Stanford Report",
    sourceUrl:
      "https://news.stanford.edu/stories/2022/03/genomic-analysis-supports-ancient-muwekma-ohlone-connection",
  },
];

export interface OhloneSite extends SourcedEntry {
  name: string;
  subtitle: string;
  evidence: Evidence;
}

export const presidioSites: OhloneSite[] = [
  {
    name: "Petlenuc",
    subtitle: "A Yelamu village in the area now known as the Presidio",
    evidence: "documented",
    sourceName: "National Park Service",
    sourceUrl: "https://www.nps.gov/places/000/8-home-of-the-yelamu.htm",
  },
  {
    name: "El Polín Spring",
    subtitle: "A spring where Yelamu Ohlone people and their ancestors lived for thousands of years",
    evidence: "documented",
    sourceName: "National Park Service",
    sourceUrl: "https://www.nps.gov/places/000/el-pol-n-spring.htm",
  },
  {
    name: "Fort Mason",
    subtitle: "Cooking-hearth remains near the fort predate the Spanish arrival in 1776",
    evidence: "documented",
    sourceName: "National Park Service",
    sourceUrl:
      "https://www.nps.gov/places/000/3-fort-mason-historic-district.htm",
  },
];

export interface Signal extends SourcedEntry {
  date: string;
  title: string;
  detail: string;
  evidence: Evidence;
}

export const signals: Signal[] = [
  {
    date: "Territory",
    title: "The Tribe publishes its own Bay Area description",
    detail: "The official history names San Francisco, San Mateo, most of Santa Clara, Alameda, and Contra Costa, with portions of Napa, Santa Cruz, Solano, and San Joaquin.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/history.html",
  },
  {
    date: "Recognition",
    title: "The Tribe documents the federal process",
    detail: "The page quotes agency findings and court decisions. Tend links to this page; the underlying records are outside this guide.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
    sourceAction: "Read the Tribe’s federal recognition page",
  },
  {
    date: "Research",
    title: "The 2022 study was built with tribal participation",
    detail: "Stanford describes a collaboration with Muwekma leadership from the Tribe’s first research request through publication.",
    evidence: "documented",
    sourceName: "Stanford Report",
    sourceUrl:
      "https://news.stanford.edu/stories/2022/03/genomic-analysis-supports-ancient-muwekma-ohlone-connection",
  },
];

interface TribeFact extends SourcedEntry {
  label: string;
  value: string;
  note: string;
}

export const tribeFacts: TribeFact[] = [
  {
    label: "Previous acknowledgment",
    value: "1914–1927",
    note: "period quoted in the Tribe’s recognition record",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    label: "Petition delivered",
    value: "1995",
    note: "federal acknowledgment petition",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    label: "Genomic study",
    value: "2022",
    note: "published in PNAS",
    sourceName: "Stanford Report",
    sourceUrl:
      "https://news.stanford.edu/stories/2022/03/genomic-analysis-supports-ancient-muwekma-ohlone-connection",
  },
  {
    label: "Published territory",
    value: "9 counties",
    note: "Most of Santa Clara and portions of four others",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/history.html",
    sourceAction: "Read the Tribe’s Bay Area history page",
  },
];

export const languageFacts = {
  headline: "Chochenyo language work",
  body: "The Tribe says it established its Language Committee in 2002 and spoke Chochenyo after the language had been silent for more than 65 years. Its page records a March 2004 workshop at San Jose State University and lists workshop and listening-lesson material.",
  evidence: "documented" as Evidence,
  sourceName: "Muwekma Ohlone Tribe",
  sourceUrl: "https://www.muwekma.org/language-revitalization.html",
};
