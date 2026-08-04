import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ReceiptText,
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
            <StreamPanel
              demo={demo}
              programName={tribe.taxName}
              tribeId={tribe.id}
              tribeName={tribe.name}
            />
          </section>

          <aside className="cr-product-campaign-sidebar">
            <section className="cr-product-record-preview">
              <header>
                <span>After checkout</span>
                <ReceiptText aria-hidden="true" size={17} />
              </header>
              <h2>Your donation record</h2>
              <p>The receipt keeps the program and payment together.</p>
              <dl>
                <div><dt>Program</dt><dd>{tribe.taxName}</dd></div>
                <div><dt>Organization</dt><dd>{tribe.name}</dd></div>
                <div><dt>Payment</dt><dd>Stripe Checkout</dd></div>
                <div><dt>Schedule</dt><dd>Chosen at checkout</dd></div>
              </dl>
              <footer>Created after Stripe confirms payment</footer>
            </section>

            <details className="cr-product-section-card cr-product-source-card">
              <summary>Program sources</summary>
              <div className="cr-product-resources">
                <a href={tribe.officialProgramUrl} rel="noreferrer" target="_blank">Official program page <ArrowUpRight aria-hidden="true" size={14} /></a>
                <a href={tribe.officialDonationUrl} rel="noreferrer" target="_blank">Organization donation page <ArrowUpRight aria-hidden="true" size={14} /></a>
              </div>
            </details>
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
