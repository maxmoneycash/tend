import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Tribe, TribeId } from "@/lib/tribes";

const TONE: Record<TribeId, { cover: string; badge: string; accent: string }> = {
  ramaytush: {
    cover: "cover-orange",
    badge: "border-[#fa4616]/25 bg-[#fff4ef] text-[#b72e00]",
    accent: "bg-[#fa4616]",
  },
  muwekma: {
    cover: "cover-purple",
    badge: "border-[#8b5cf6]/25 bg-[#f6f1ff] text-[#6d3bc2]",
    accent: "bg-[#8b5cf6]",
  },
};

function host(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function ProgramCard({
  counties,
  program,
}: {
  counties: string[];
  program: Tribe;
}) {
  const tone = TONE[program.id];

  return (
    <article className="group relative overflow-hidden rounded-[20px] border border-black/[0.1] bg-white shadow-[0_18px_48px_rgba(28,20,14,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_22px_58px_rgba(28,20,14,0.1)]">
      <div className={`relative h-24 overflow-hidden sm:h-32 ${tone.cover}`}>
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          loop
          muted
          playsInline
          preload="metadata"
          src={`/videos/${program.id}.mp4`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <span
          className={`absolute left-4 top-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${tone.badge}`}
        >
          {program.region}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className={`mb-4 h-1 w-10 rounded-full ${tone.accent}`} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#77736f]">
          Organization
        </p>
        <h2 className="mt-1 text-balance text-[17px] font-bold leading-tight tracking-[-0.02em] text-[#171411]">
          {program.name}
        </h2>
        <p className="mt-2 text-[13px] font-semibold text-[#4e4944]">
          {program.taxName}
        </p>

        <p className="mt-4 text-[12px] leading-relaxed text-[#625c56]">
          Opens {host(program.officialDonationUrl)} for {program.name}.
        </p>

        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] bg-[#171411] px-4 text-center text-[12px] font-semibold text-white transition hover:bg-[#38322d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171411] focus-visible:ring-offset-2"
            href={program.officialDonationUrl}
            rel="noreferrer"
            target="_blank"
          >
            Donate on the official site
            <ExternalLink aria-hidden="true" size={14} />
          </a>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-black/[0.12] bg-white px-4 text-[12px] font-semibold text-[#3f3934] transition hover:border-black/25 hover:bg-[#faf8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171411] focus-visible:ring-offset-2"
            href={`/programs/${program.id}`}
          >
            View Tend details
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>

        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#68625c]">
          {program.blurb}
        </p>

        <div
          aria-label="Counties listed for this program"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {counties.map((county) => (
            <span
              className="rounded-full border border-black/[0.08] bg-[#f7f5f2] px-2 py-0.5 text-[10px] text-[#625c56]"
              key={county}
            >
              {county}
            </span>
          ))}
        </div>

        <p className="mt-3 border-t border-black/[0.07] pt-3 text-[10px] leading-relaxed text-[#7c756e]">
          Tend listing: public information and test checkout only.
        </p>
      </div>
    </article>
  );
}
