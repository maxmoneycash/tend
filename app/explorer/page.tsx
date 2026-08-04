import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, ScanSearch } from "lucide-react";
import { ExplorerAtlas } from "@/components/explorer/ExplorerAtlas";
import { Navbar } from "@/components/layout/Navbar";
import {
  languageFacts,
  presidioSites,
  signals,
  timeline,
  tribeFacts,
  type Evidence,
} from "@/lib/muwekma-content";
import "@/styles/content-rewards-product.css";

function EvidenceBadge({ tier }: { tier: Evidence }) {
  const styles: Record<Evidence, string> = {
    documented: "bg-green-500/10 text-green-700",
    reported: "bg-blue-500/10 text-blue-400",
    "oral-history": "bg-[#8B5CF6]/10 text-[#A78BFA]",
    analysis: "bg-black/[0.05] text-[#555555]",
  };
  return (
    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${styles[tier]}`}>
      {tier}
    </span>
  );
}

function SourceLink({
  name,
  url,
  action,
}: {
  name: string;
  url: string;
  action?: string;
}) {
  const host = new URL(url).host.replace(/^www\./, "");
  return (
    <a
      className="mt-3 inline-flex min-h-11 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-[9px] border border-black/10 bg-black/[0.03] px-3 py-2 text-[12px] font-medium leading-snug text-[#3a3a3a] transition-colors hover:border-black/20 hover:bg-black/[0.05] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span>Source: {name}</span>
      <span className="font-mono text-[12px] text-[#666666]">
        {action && <span className="font-sans">{action} · </span>}
        {host} <span aria-hidden="true">↗</span>
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export default function ExplorerPage() {
  return (
    <div className="cr-product-page min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div className="cr-product-nav-spacer" />
        <main className="cr-product-shell cr-product-explorer">
          <header className="cr-product-page-head">
            <div>
              <p><ScanSearch size={15} aria-hidden="true" /> Explorer</p>
              <h1>Explore the record.</h1>
              <span>Open a place, then follow the source and its evidence limit.</span>
            </div>
          </header>

            <div className="explorer-fact-strip" aria-label="Research record summary">
              {tribeFacts.map((fact) => (
                <a href={fact.sourceUrl} key={fact.label} target="_blank" rel="noopener noreferrer">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                  <small>{fact.note}</small>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          <section className="cr-product-atlas-section" aria-label="Map of documented places">
            <ExplorerAtlas sites={presidioSites} />
          </section>

          <div className="explorer-record-grid">
            <section className="explorer-timeline" aria-labelledby="timeline-heading">
              <header>
                <p>Timeline</p>
                <h2 id="timeline-heading">Follow the record through time</h2>
                <p>Every row names its publisher and states where the evidence stops.</p>
              </header>
              <ol>
                {timeline.map((entry) => (
                  <li key={entry.title}>
                    <time>{entry.date}</time>
                    <div>
                      <span><EvidenceBadge tier={entry.evidence} /></span>
                      <h3>{entry.title}</h3>
                      <p>{entry.body}</p>
                      {entry.evidenceNote && <small>{entry.evidenceNote}</small>}
                      <SourceLink name={entry.sourceName} url={entry.sourceUrl} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <aside className="explorer-source-ledger" aria-labelledby="source-ledger-heading">
              <header>
                <p><BookOpen size={14} aria-hidden="true" /> Source ledger</p>
                <h2 id="source-ledger-heading">What each source supports</h2>
              </header>
              <div className="explorer-signal-list">
                {signals.map((signal) => (
                  <article key={signal.title}>
                    <div><span>{signal.date}</span><EvidenceBadge tier={signal.evidence} /></div>
                    <h3>{signal.title}</h3>
                    <p>{signal.detail}</p>
                    <SourceLink action={signal.sourceAction} name={signal.sourceName} url={signal.sourceUrl} />
                  </article>
                ))}
              </div>
              <article className="explorer-language-note">
                <div><span>Language</span><EvidenceBadge tier={languageFacts.evidence} /></div>
                <h3>{languageFacts.headline}</h3>
                <p>{languageFacts.body}</p>
                <SourceLink action={languageFacts.sourceAction} name={languageFacts.sourceName} url={languageFacts.sourceUrl} />
              </article>
              <Link href="/programs" className="explorer-program-link">
                <span><strong>Go to the giving program directory</strong><small>Research and official giving links stay separate.</small></span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </main>
    </div>
  );
}
