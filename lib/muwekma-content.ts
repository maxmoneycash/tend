export type Evidence = "documented" | "reported" | "oral-history" | "analysis";

type SourcedEntry = {
  sourceName: string;
  sourceUrl: string;
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
    body: "The Muwekma recognition history quotes a 1996 Bureau of Indian Affairs finding that the Pleasanton or Verona Band was previously acknowledged during this period.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    date: "1995",
    title: "A recognition petition reaches the White House",
    body: "The Muwekma Tribal Council delivered its federal acknowledgment petition during a White House meeting on January 25.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    date: "2002",
    title: "The federal petition is denied",
    body: "The Tribe’s account records the Bureau of Indian Affairs final determination and explains which acknowledgment criteria the agency found satisfied.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
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
  {
    date: "Today",
    title: "Chochenyo language work continues",
    body: "The Muwekma Language Committee teaches Chochenyo and publishes language materials under the Tribe’s authority.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/language-revitalization.html",
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
    subtitle: "Ohlone cooking hearths show human presence before Spanish colonization",
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
    detail: "The official history names San Francisco, San Mateo, most of Santa Clara, Alameda, and Contra Costa, with portions of four other counties.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/history.html",
  },
  {
    date: "Recognition",
    title: "The Tribe documents the federal process",
    detail: "The official recognition page collects the petition history, agency findings, court decisions, and the Tribe’s position.",
    evidence: "documented",
    sourceName: "Muwekma Ohlone Tribe",
    sourceUrl: "https://www.muwekma.org/recognition-process.html",
  },
  {
    date: "Research",
    title: "The 2022 study was built with tribal participation",
    detail: "Stanford describes a collaboration involving Muwekma leadership from the research request through publication.",
    evidence: "documented",
    sourceName: "Stanford Report",
    sourceUrl:
      "https://news.stanford.edu/stories/2022/03/genomic-analysis-supports-ancient-muwekma-ohlone-connection",
  },
];

export const tribeFacts = [
  {
    label: "Previous acknowledgment",
    value: "1914–1927",
    note: "period quoted in the Tribe’s recognition record",
  },
  {
    label: "Petition delivered",
    value: "1995",
    note: "federal acknowledgment petition",
  },
  {
    label: "Genomic study",
    value: "2022",
    note: "published in PNAS",
  },
  {
    label: "Core counties named",
    value: "5",
    note: "plus portions of four others",
  },
];

export const languageFacts = {
  headline: "Chochenyo language work",
  body: "The Muwekma Language Committee began its revitalization program in 2002. Tribal members continue to teach, speak, and publish Chochenyo language materials.",
  evidence: "documented" as Evidence,
  sourceName: "Muwekma Ohlone Tribe",
  sourceUrl: "https://www.muwekma.org/language-revitalization.html",
};
