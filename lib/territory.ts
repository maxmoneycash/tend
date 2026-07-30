const GEOCODER =
  "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

/**
 * Resolve a free-form address to a county name via the US Census Bureau
 * geocoder (public, keyless). Returns null when nothing matches — the UI
 * falls back to a manual county picker, so the demo never depends on
 * this API being up.
 */
export async function lookupCounty(address: string): Promise<string | null> {
  const url = new URL(GEOCODER);
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("layers", "Counties");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    result?: {
      addressMatches?: Array<{
        geographies?: Record<string, Array<{ BASENAME?: string }>>;
      }>;
    };
  };

  const counties = data.result?.addressMatches?.[0]?.geographies?.["Counties"];
  return counties?.[0]?.BASENAME ?? null;
}
