import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  FileText,
  MapPinned,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { countyNotes, countyTribes, getTribe } from "@/lib/tribes";
import { StreamPanel } from "@/components/stream/StreamPanel";
import { ProgramCampaignHeader } from "@/components/content-rewards/ProgramCampaignHeader";
import { demoMode } from "@/lib/demo";
import "@/styles/content-rewards-product.css";

export default async function ProgramDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tribe = getTribe(id);
  if (!tribe) notFound();
  const demo = demoMode();

  const tribeCounties = Object.entries(countyTribes)
    .filter(([, ids]) => ids.includes(tribe.id))
    .map(([county]) => county);
  const notes = tribeCounties
    .map((c) => countyNotes[c])
    .filter((n, i, arr) => n && arr.indexOf(n) === i);
  return (
    <div className="cr-product-page min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div className="cr-product-nav-spacer" />
      <main className="cr-product-shell cr-product-campaign-detail">
        <Link href="/programs" className="cr-product-back-link">← All programs</Link>
        <ProgramCampaignHeader counties={tribeCounties} program={tribe} />

        <div className="cr-product-campaign-workspace">
          <section className="cr-product-donation-panel scroll-mt-28" id="donate">
            <StreamPanel demo={demo} tribeId={tribe.id} tribeName={tribe.name} />
          </section>

          <aside className="cr-product-campaign-sidebar">
            <section className="cr-product-section-card">
              <h2>Why use this checkout</h2>
              <ul className="cr-product-requirements">
                <li><MapPinned aria-hidden="true" size={17} /><span><strong>Choose the right program</strong>Published coverage stays visible before payment.</span></li>
                <li><Check aria-hidden="true" size={17} /><span><strong>Keep the proof</strong>The payment and settlement links share one receipt.</span></li>
                <li><FileText aria-hidden="true" size={17} /><span><strong>Reduce reconciliation</strong>The program reference remains attached after checkout.</span></li>
              </ul>
            </section>

            <section className="cr-product-section-card">
              <h2>Program sources</h2>
              <div className="cr-product-resources">
                <a href={tribe.officialProgramUrl} rel="noreferrer" target="_blank">Official program page <ArrowUpRight aria-hidden="true" size={14} /></a>
                <a href={tribe.officialDonationUrl} rel="noreferrer" target="_blank">Organization donation page <ArrowUpRight aria-hidden="true" size={14} /></a>
              </div>
            </section>
          </aside>
        </div>

        <section className="cr-product-program-record">
          <header><p>Published program record</p><h2>About {tribe.taxName}</h2></header>
          <div>
            <p>{tribe.blurb}</p>
            {notes.map((note) => <p className="cr-product-record-note" key={note}>{note}</p>)}
          </div>
        </section>

        <details className="cr-product-technical">
          <summary>Machine payment endpoint</summary>
          <pre>{`POST /api/mpp/land-tax?tribe=${tribe.id}`}</pre>
        </details>
      </main>
    </div>
  );
}
