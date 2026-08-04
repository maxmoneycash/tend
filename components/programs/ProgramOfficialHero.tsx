import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Tribe, TribeId } from "@/lib/tribes";

const HERO_MEDIA: Record<
  TribeId,
  { alt: string; src: string; sourceUrl: string }
> = {
  ramaytush: {
    alt: "A bee on a red and orange flower.",
    src: "/programs/ramaytush-hero.jpg",
    sourceUrl: "https://www.ramaytush.org/donate.html",
  },
  muwekma: {
    alt: "Amaranth plants around a sign reading On Indigenous land, Give Shuumi.",
    src: "/programs/muwekma-hero.webp",
    sourceUrl: "https://www.muwekmafoundation.org/shuumi",
  },
};

export function ProgramOfficialHero({
  counties,
  program,
}: {
  counties: string[];
  program: Tribe;
}) {
  const isYunakinKindfulCampaign = program.id === "ramaytush";
  const shortDescription = isYunakinKindfulCampaign
    ? "A voluntary contribution for people living in San Francisco, San Mateo, and part of Santa Clara County."
    : "A voluntary annual contribution supporting Muwekma Ohlone culture, education, and land access.";
  const media = HERO_MEDIA[program.id];

  return (
    <section className={`program-official-hero program-official-hero--${program.id}`}>
      <div className="program-official-copy">
        <p className="program-organization-name">{program.name}</p>
        <h1>{program.taxName}</h1>
        <p className="program-hero-description">{shortDescription}</p>

        <div className="program-hero-counties" aria-label="Published counties">
          {counties.map((county) => (
            <span key={county}>
              {county}
            </span>
          ))}
        </div>

        <div className="program-hero-actions">
          <a
            className="program-hero-primary"
            href="#tend-test-checkout"
          >
            Start donation
            <ArrowDown aria-hidden="true" size={15} />
          </a>
          <Link className="program-hero-location" href="/pledge">
            Check my location
            <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </div>

      <figure className="program-hero-photo">
        <Image
          alt={media.alt}
          className="program-hero-photo-image"
          fill
          priority
          sizes="(min-width: 64rem) 42vw, 100vw"
          src={media.src}
        />
        <figcaption>
          Photo from the{" "}
          <a href={media.sourceUrl} rel="noreferrer" target="_blank">
            official program page
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
