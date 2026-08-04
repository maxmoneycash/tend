import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ProgramCard } from "@/components/programs/ProgramCard";
import {
  countyTribes,
  relatedGivingPrograms,
  tribes,
} from "@/lib/tribes";
import "@/styles/content-rewards-product.css";

function counties(id: string) {
  return Object.entries(countyTribes)
    .filter(([, ids]) => ids.includes(id as never))
    .map(([county]) => county);
}

export default function ProgramsPage() {
  const orgs = Object.values(tribes);

  return (
    <div className="cr-product-page min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div className="cr-product-nav-spacer" />
      <main className="cr-product-shell cr-product-directory">
        <header className="cr-product-page-head">
          <div>
            <p>Programs</p>
            <h1>Choose where to give.</h1>
            <span>Compare the published area, payment options, and receipt before checkout.</span>
          </div>
          <Link className="cr-product-secondary" href="/pledge">
            Match my location <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </header>

        <div className="cr-product-directory-toolbar">
          <strong>{orgs.length} contribution programs</strong>
          <span>Card, Apple Pay, and receipt preview</span>
        </div>

        <section className="cr-product-campaign-grid" aria-label="Contribution programs">
            {orgs.map((program) => (
              <ProgramCard
                counties={counties(program.id)}
                key={program.id}
                program={program}
              />
            ))}
        </section>

        <section className="cr-product-related-program">
            <p>
              <Info aria-hidden="true" size={14} />
              More published giving
            </p>
            <div className="cr-related-row">
              {relatedGivingPrograms.map((program) => (
                <div className="contents" key={program.programUrl}>
                  <div>
                    <small>{program.region}</small>
                    <strong>{program.taxName}</strong>
                    <p>{program.name}</p>
                  </div>
                  <a
                    className="cr-product-text-link"
                    href={program.programUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {program.programAction}
                  </a>
                </div>
              ))}
            </div>
          </section>
      </main>
    </div>
  );
}
