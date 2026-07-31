import { NextResponse } from "next/server";
import { campaigns } from "@/lib/campaigns";

/** Discover feed for the landing — the two live programs, in the
 * campaign shape LandingClient merges with locally created ones. */
export function GET() {
  return NextResponse.json(campaigns);
}
