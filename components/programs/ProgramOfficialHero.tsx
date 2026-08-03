import {
  ExternalLink,
  FlaskConical,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { ProgramVideo } from "@/components/programs/ProgramVideo";
import type { Tribe, TribeId } from "@/lib/tribes";

const COVER: Record<TribeId, string> = {
  ramaytush: "cover-orange",
  muwekma: "cover-purple",
};

function host(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function ProgramOfficialHero({
  counties,
  program,
}: {
  counties: string[];
  program: Tribe;
}) {
  const isYunakinKindfulCampaign = program.id === "ramaytush";
  const donationButtonLabel = isYunakinKindfulCampaign
    ? "Continue to Yunakin on Kindful"
    : "Donate on the Foundation’s site";
  const donationHandoff = isYunakinKindfulCampaign
    ? `Opens the ${program.name}’s ${program.taxName} campaign at ${host(program.officialDonationUrl)} in a new tab.`
    : `Opens ${program.name}’s general donation form at ${host(program.officialDonationUrl)} in a new tab.`;

  return (
    <section className="overflow-hidden rounded-[24px] border border-black/[0.1] bg-white shadow-[0_24px_70px_rgba(28,20,14,0.08)] lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2 text-[length:var(--text-caption)] leading-[var(--leading-caption)] font-semibold uppercase tracking-[0.14em] text-[#7a736c]">
          <Landmark aria-hidden="true" size={14} />
          Organization
        </div>
        <p className="mt-2 text-[15px] font-semibold leading-snug text-[#49433e] sm:text-[17px]">
          {program.name}
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a736c]">
          Program
        </p>
        <h1 className="mt-1 max-w-2xl text-balance text-[32px] font-bold leading-[1.04] tracking-[-0.04em] text-[#171411] sm:text-[44px] lg:text-[50px]">
          {program.taxName}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-[13px] leading-relaxed text-[#625c56] sm:text-[14px]">
          {program.blurb}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {counties.map((county) => (
            <span
              className="rounded-full border border-black/[0.08] bg-[#f7f5f2] px-2.5 py-1 text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-[#625c56]"
              key={county}
            >
              {county}
            </span>
          ))}
        </div>

        <p className="mt-5 flex max-w-xl items-start gap-2 text-[12px] leading-relaxed text-[#5d5650]">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={14}
          />
          <span>
            Program page published by{" "}
            <span className="font-semibold text-[#3f3934]">
              {program.name}
            </span>{" "}
            at {host(program.officialProgramUrl)}.
          </span>
        </p>

        <p className="mt-3 flex max-w-xl items-start gap-2 text-[10px] leading-relaxed text-[#777069] sm:text-[11px]">
          <ExternalLink
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={13}
          />
          {donationHandoff}
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#171411] px-5 text-[13px] font-semibold text-white transition hover:bg-[#38322d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171411] focus-visible:ring-offset-2"
            href={program.officialDonationUrl}
            rel="noreferrer"
            target="_blank"
          >
            {donationButtonLabel}
            <ExternalLink aria-hidden="true" size={15} />
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-black/[0.14] bg-white px-5 text-[13px] font-semibold text-[#3f3934] transition hover:border-black/30 hover:bg-[#faf8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171411] focus-visible:ring-offset-2"
            href={program.officialProgramUrl}
            rel="noreferrer"
            target="_blank"
          >
            Read the official {program.taxName} page
            <ExternalLink aria-hidden="true" size={15} />
          </a>
        </div>

        <div className="mt-4 grid max-w-xl gap-2 rounded-[var(--radius-sm)] border border-border bg-[var(--background-tertiary)] p-3 text-[length:var(--text-caption)] leading-[var(--leading-caption)] text-muted-foreground">
          <p className="flex items-start gap-2">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={15}
            />
            {donationHandoff}
          </p>
          <p className="border-t border-border pt-2">
            {program.name} has not onboarded to Tend. These links open the
            organization&apos;s own pages.
          </p>
          <p className="flex items-start gap-2 border-t border-border pt-2 font-semibold text-warning">
            <FlaskConical
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={15}
            />
            Tend checkout below uses test funds only.
          </p>
        </div>
      </div>

      <div
        className={`relative min-h-40 overflow-hidden lg:min-h-full ${COVER[program.id]}`}
      >
        <ProgramVideo
          className="absolute inset-0 h-full w-full object-cover"
          poster={`/videos/${program.id}-poster.jpg`}
          src={`/videos/${program.id}.mp4`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <p className="text-[length:var(--text-caption)] leading-[var(--leading-caption)] font-semibold uppercase tracking-[0.14em] text-white/75">
            Program region
          </p>
          <p className="mt-1 text-[14px] font-semibold">{program.region}</p>
        </div>
      </div>
    </section>
  );
}
