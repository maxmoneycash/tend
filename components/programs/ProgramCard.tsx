import { ArrowRight, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProgramVideo } from "@/components/programs/ProgramVideo";
import type { Tribe, TribeId } from "@/lib/tribes";

const TONE: Record<TribeId, { cover: string; badge: string }> = {
  ramaytush: {
    cover: "cover-orange",
    badge: "cr-campaign-tag--orange",
  },
  muwekma: {
    cover: "cover-purple",
    badge: "cr-campaign-tag--purple",
  },
};

export function ProgramCard({
  counties,
  program,
}: {
  counties: string[];
  program: Tribe;
}) {
  const tone = TONE[program.id];
  const shortDescription =
    program.id === "ramaytush"
      ? "A voluntary contribution for people living on the San Francisco Peninsula."
      : "A voluntary annual contribution supporting culture, education, and land access.";
  return (
    <article className="cr-product-campaign-card">
      <Link className={`cr-product-campaign-thumb ${tone.cover}`} href={`/programs/${program.id}`}>
        <ProgramVideo
          className="cr-product-campaign-card-media"
          poster={`/videos/${program.id}-poster.jpg`}
          src={`/videos/${program.id}.mp4`}
        />
        <span className={`cr-product-campaign-tag ${tone.badge}`}>
          {program.region}
        </span>
      </Link>

      <div className="cr-product-campaign-card-body">
        <div className="cr-product-card-brand">
          <span aria-hidden="true">{program.name.slice(0, 1)}</span>
          <p>{program.name}</p>
          <Check aria-label="Published organization" size={12} />
        </div>
        <h2>{program.taxName}</h2>
        <p className="cr-product-campaign-description">{shortDescription}</p>

        <dl className="cr-product-campaign-card-stats">
          <div><dt>Counties</dt><dd>{counties.length}</dd></div>
          <div><dt>Cadence</dt><dd>1× · recurring</dd></div>
          <div><dt>Receipt</dt><dd>Payment + proof</dd></div>
        </dl>

        <div className="cr-product-county-row" aria-label="Published counties">
          {counties.map((county) => <span key={county}>{county}</span>)}
        </div>

        <div className="cr-product-campaign-card-actions">
          <Link
            className="cr-product-primary"
            href={`/programs/${program.id}#donate`}
          >
            View program
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
          <a
            className="cr-product-text-link"
            href={program.officialDonationUrl}
            rel="noreferrer"
            target="_blank"
          >
            Official site
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        </div>
      </div>
    </article>
  );
}
