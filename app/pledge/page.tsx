import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PledgeFlow } from "@/components/PledgeFlow";
import { demoMode } from "@/lib/demo";
import { tribes } from "@/lib/tribes";
import "@/styles/content-rewards.css";

export default function PledgePage() {
  const demo = demoMode();
  const programs = Object.values(tribes).map(
    ({ id, name, taxName, region, blurb, siteUrl }) => ({
      id,
      name,
      taxName,
      region,
      blurb,
      siteUrl,
    }),
  );

  return (
    <div className="cr-pledge-page">
      <Navbar />
      <div
        style={{
          paddingTop: "calc(108px + env(safe-area-inset-top, 0px))",
        }}
      />

      <div className="cr-pledge-content">
        <section className="cr-pledge-hero">
          <div>
            <div className="cr-pill-badge">Program finder</div>
            <h1>Give to the program that serves your location.</h1>
            <p>
              Enter an address or choose a county. When published coverage
              overlaps, every matching program stays visible.
            </p>
          </div>
          <aside>
            <strong>How matching works</strong>
            <p>Results follow each organization’s published service area. You make the final choice.</p>
          </aside>
        </section>

        <section className="cr-pledge-workbench">
          <div className="cr-pledge-workbench-heading">
            <span>{demo ? "Demo preview" : "Stripe test mode"}</span>
            <h2>Find your program</h2>
          </div>
          <div>
            <PledgeFlow demo={demo} programs={programs} />
          </div>
        </section>

        <section className="cr-pledge-fallback">
          <div>
            <div>
              <h2 className="text-[16px] font-semibold text-[#111111]">
                Prefer the organization’s current checkout?
              </h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#555555]">
                Each program page keeps the official donation link available
                beside the {demo ? "preview" : "test checkout"}.
              </p>
            </div>
            <Link
              href="/programs"
              className="cr-related-action"
            >
              View program pages
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
