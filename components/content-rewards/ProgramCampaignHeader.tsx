import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { ProgramVideo } from "@/components/programs/ProgramVideo";
import type { Tribe } from "@/lib/tribes";

export function ProgramCampaignHeader({
  counties,
  program,
}: {
  counties: string[];
  program: Tribe;
}) {
  const description =
    program.id === "ramaytush"
      ? "A voluntary contribution for people living in San Francisco, San Mateo, and part of Santa Clara County."
      : "A voluntary annual contribution supporting Muwekma Ohlone culture, education, and land access.";

  return (
    <>
      <section className="cr-product-campaign-hero">
        <div className="cr-product-campaign-copy">
          <div className="cr-product-brand-row">
            <span aria-hidden="true" className="cr-product-brand-mark">
              {program.name.slice(0, 1)}
            </span>
            <strong>{program.name}</strong>
            <Check aria-label="Published organization" size={13} />
          </div>
          <h1>{program.taxName}</h1>
          <p>{description}</p>
          <div className="cr-product-county-row" aria-label="Published counties">
            {counties.map((county) => (
              <span key={county}>{county}</span>
            ))}
          </div>
          <div className="cr-product-campaign-actions">
            <a className="cr-product-primary" href="#donate">
              Make a donation <ArrowDown aria-hidden="true" size={15} />
            </a>
            <Link className="cr-product-secondary" href="/pledge">
              Check my location <ArrowUpRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </div>

        <div className="cr-product-campaign-media">
          <ProgramVideo
            className="cr-product-campaign-video"
            poster={`/videos/${program.id}-poster.jpg`}
            src={`/videos/${program.id}.mp4`}
          />
        </div>
      </section>

      <dl className="cr-product-campaign-facts" aria-label="Donation page capabilities">
        <div>
          <dt>Frequency</dt>
          <dd>One time, monthly, or yearly</dd>
        </div>
        <div>
          <dt>Checkout</dt>
          <dd>Stripe card or Apple Pay</dd>
        </div>
        <div>
          <dt>After payment</dt>
          <dd>Payment and settlement receipt</dd>
        </div>
      </dl>
    </>
  );
}
