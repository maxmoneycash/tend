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

function PartHeader({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="mb-5 mt-12">
      <span className="inline-block text-[10px] font-display font-semibold px-2 py-0.5 rounded bg-[#FA4616]/10 text-[#FA4616] uppercase tracking-wider mb-2">
        Part {n}
      </span>
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
        <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          {/* Hero */}
          <div className="mb-8 animate-enter">
            <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
              Research Report · from the Muwekma Atlas
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] mb-2 tracking-[-0.02em]">
              The Land Beneath the Bay
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#7d7d7d] max-w-xl text-pretty leading-relaxed">
              Ten thousand years of Ohlone presence, a recognition the United
              States never lawfully ended, and the campaign to come home —
              every claim carries its evidence tier, with the Muwekma Atlas as
              the deep record.
            </p>
          </div>

          {/* Fact row */}
          <div className="animate-enter animate-enter-delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {tribeFacts.map((f) => (
              <div key={f.label} className="surface-1 rounded-[16px] p-4">
                <p className="text-[9px] text-[#6b6b6b] uppercase tracking-wider">{f.label}</p>
                <p className="font-mono text-[26px] font-bold text-[#111111] tracking-tight">{f.value}</p>
                <p className="text-[10px] text-[#8a8a8a] mt-0.5">{f.note}</p>
              </div>
            ))}
          </div>

          {/* Part 1 — deep time to now */}
          <PartHeader
            n={1}
            title="Ten thousand years, in twelve moments"
            sub="From the first peoples of the Bay to the re-petition window open until 2030 — the through-line the 2022 Stanford genomics study made unbreakable."
          />
          <div className="space-y-2">
            {timeline.map((t) => (
              <div
                key={t.title}
                className="surface-1 rounded-[12px] p-4 grid grid-cols-[92px_1fr_auto] gap-3 items-baseline"
              >
                <span className="font-mono text-[11px] text-[#FA4616]">{t.date}</span>
                <div>
                  <p className="text-[13px] font-semibold text-[#111111]">{t.title}</p>
                  <p className="text-[12px] text-[#555555] leading-relaxed mt-1">{t.body}</p>
                </div>
                <EvidenceBadge tier={t.evidence} />
              </div>
            ))}
          </div>

          {/* Part 2 — the campaign signals */}
          <PartHeader
            n={2}
            title="The recognition fight, live"
            sub="Petition #111 was denied in 2002 even as the government conceded the tribe's descent from the never-terminated Verona Band. These are the current signals."
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
              </div>
            ))}
          </div>

          {/* Part 3 — the Presidio sites */}
          <PartHeader
            n={3}
            title="The Presidio is Yelamu land"
            sub="Under the former Army post: village sites, shell middens, a freshwater spring with millennia of habitation. The Presidio's own archaeology documents it."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presidioSites.map((site) => (
              <div key={site.name} className="surface-1 rounded-[12px] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#111111]">{site.name}</p>
                  <EvidenceBadge tier={site.evidence} />
                </div>
                <p className="text-[11px] text-[#6b6b6b] leading-relaxed mt-1">{site.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Part 4 — language */}
          <PartHeader n={4} title={languageFacts.headline} sub="" />
          <div className="surface-1 rounded-[16px] p-5 flex items-start justify-between gap-4">
            <p className="text-[13px] text-[#3a3a3a] leading-relaxed max-w-2xl">
              {languageFacts.body}
            </p>
            <EvidenceBadge tier={languageFacts.evidence} />
          </div>

          {/* CTA */}
          <div className="mt-12 surface-1 rounded-[16px] p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[#111111]">
                The history is the reason. The programs are the response.
              </p>
              <p className="text-[12px] text-[#6b6b6b] mt-1">
                A voluntary land tax turns acknowledgment into standing support
                — direct to the tribe, no platform fee.
              </p>
            </div>
            <Link
              href="/programs"
              className="btn-whop px-5 py-3 rounded-[12px] text-[13px] font-semibold"
            >
              See the programs
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
