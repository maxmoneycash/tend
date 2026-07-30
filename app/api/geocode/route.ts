import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupCounty } from "@/lib/territory";
import { countyNotes, coveredCounties, tribesForCounty } from "@/lib/tribes";

const Body = z.object({
  address: z.string().min(3).max(300).optional(),
  county: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success || (!parsed.data.address && !parsed.data.county)) {
    return NextResponse.json({ error: "Provide an address or county" }, { status: 400 });
  }

  let county = parsed.data.county ?? null;
  let geocoded = false;

  if (!county && parsed.data.address) {
    try {
      county = await lookupCounty(parsed.data.address);
      geocoded = county !== null;
    } catch {
      county = null;
    }
  }

  if (!county) {
    return NextResponse.json({
      county: null,
      geocoded: false,
      tribes: [],
      note: "We couldn't place that address — choose your county below.",
      coveredCounties,
    });
  }

  const matched = tribesForCounty(county);
  return NextResponse.json({
    county,
    geocoded,
    tribes: matched.map((t) => ({
      id: t.id,
      name: t.name,
      taxName: t.taxName,
      region: t.region,
      blurb: t.blurb,
      siteUrl: t.siteUrl,
    })),
    note:
      countyNotes[county] ??
      (matched.length === 0
        ? `${county} County is outside the territories Tend currently hosts. The Native Land map at native-land.ca shows whose land you're on.`
        : null),
    coveredCounties,
  });
}
