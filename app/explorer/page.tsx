import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import {
  languageFacts,
  presidioSites,
  signals,
  timeline,
  tribeFacts,
  type Evidence,
} from "@/lib/muwekma-content";

function EvidenceBadge({ tier }: { tier: Evidence }) {
  const styles: Record<Evidence, string> = {
    documented: "bg-green-500/10 text-green-700",
    reported: "bg-blue-500/10 text-blue-400",
    "oral-history": "bg-[#8B5CF6]/10 text-[#A78BFA]",
    analysis: "bg-black/[0.05] text-[#555555]",
  };
  return (
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${styles[tier]}`}>
      {tier}
    </span>
  );
}

function SourceLink({ name, url }: { name: string; url: string }) {
  const host = new URL(url).host.replace(/^www\./, "");
  return (
    <a
      className="mt-3 inline-flex min-h-11 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-[9px] border border-black/10 bg-black/[0.03] px-3 py-2 text-[12px] font-medium leading-snug text-[#3a3a3a] transition-colors hover:border-black/20 hover:bg-black/[0.05] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span>Source: {name}</span>
      <span className="font-mono text-[12px] text-[#666666]">{host} ↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function PartHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5 mt-12">
      <h2 className="text-[18px] sm:text-[22px] font-bold text-[#111111] mb-1 tracking-[-0.02em]">
        {title}
      </h2>
      {sub && (
        <p className="text-[12px] sm:text-[13px] text-[#6b6b6b] max-w-xl leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          {/* Hero */}
          <div className="mb-8 animate-enter">
            <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
              Sourced research guide
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] mb-2 tracking-[-0.02em]">
              The Land Beneath the Bay
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#7d7d7d] max-w-xl text-pretty leading-relaxed">
              This guide follows Muwekma history through the Tribe’s records
              and other official sources. A “documented” badge means the linked
              page supports the entry.
            </p>
          </div>

          {/* Fact row */}
          <div className="animate-enter animate-enter-delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {tribeFacts.map((f) => (
              <div key={f.label} className="surface-1 rounded-[16px] p-4">
                <p className="text-[9px] text-[#6b6b6b] uppercase tracking-wider">{f.label}</p>
                <p className="font-mono text-[26px] font-bold text-[#111111] tracking-tight">{f.value}</p>
                <p className="text-[10px] text-[#8a8a8a] mt-0.5">{f.note}</p>
                <SourceLink name={f.sourceName} url={f.sourceUrl} />
              </div>
            ))}
          </div>

          {/* Sourced timeline */}
          <PartHeader
            title="A short sourced timeline"
            sub="From Yelamu villages to the 2022 Stanford genomics study, each entry names its source."
          />
          <div className="space-y-2">
            {timeline.map((t) => (
              <div
                key={t.title}
                className="surface-1 rounded-[12px] p-4 sm:grid sm:grid-cols-[110px_1fr_auto] sm:items-baseline sm:gap-3"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-0 sm:block">
                  <span className="font-mono text-[11px] text-[#FA4616]">{t.date}</span>
                  <span className="sm:hidden">
                    <EvidenceBadge tier={t.evidence} />
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111111]">{t.title}</p>
                  <p className="text-[12px] text-[#555555] leading-relaxed mt-1">{t.body}</p>
                  <SourceLink name={t.sourceName} url={t.sourceUrl} />
                </div>
                <span className="hidden sm:block">
                  <EvidenceBadge tier={t.evidence} />
                </span>
              </div>
            ))}
          </div>

          {/* Source guide */}
          <PartHeader
            title="Read each claim at its source"
            sub="These cards link to the official pages behind the entries."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {signals.map((s) => (
              <div key={s.title} className="surface-1 rounded-[16px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-[#6b6b6b]">{s.date}</span>
                  <EvidenceBadge tier={s.evidence} />
                </div>
                <p className="text-[13px] font-semibold text-[#111111]">{s.title}</p>
                <p className="text-[12px] text-[#555555] leading-relaxed mt-1.5">{s.detail}</p>
                <SourceLink name={s.sourceName} url={s.sourceUrl} />
              </div>
            ))}
          </div>

          {/* National Park Service places */}
          <PartHeader
            title="Yelamu places in the National Park Service record"
            sub="Federal park pages document villages, hearths, and long habitation around the Presidio."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presidioSites.map((site) => (
              <div key={site.name} className="surface-1 rounded-[12px] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#111111]">{site.name}</p>
                  <EvidenceBadge tier={site.evidence} />
                </div>
                <p className="text-[11px] text-[#6b6b6b] leading-relaxed mt-1">{site.subtitle}</p>
                <SourceLink name={site.sourceName} url={site.sourceUrl} />
              </div>
            ))}
          </div>

          {/* Language source */}
          <PartHeader title={languageFacts.headline} sub="" />
          <div className="surface-1 rounded-[16px] p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[13px] text-[#3a3a3a] leading-relaxed max-w-2xl">
                {languageFacts.body}
              </p>
              <EvidenceBadge tier={languageFacts.evidence} />
            </div>
            <SourceLink name={languageFacts.sourceName} url={languageFacts.sourceUrl} />
          </div>

          {/* CTA */}
          <div className="mt-12 surface-1 rounded-[16px] p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[#111111]">
                Continue with the official program sources.
              </p>
              <p className="text-[12px] text-[#6b6b6b] mt-1">
                Tend explains the programs. Each official organization page
                handles real donations.
              </p>
            </div>
            <Link
              href="/programs"
              className="btn-whop px-5 py-3 rounded-[12px] text-[13px] font-semibold"
            >
              See the programs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
