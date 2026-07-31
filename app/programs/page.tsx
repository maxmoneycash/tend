import { Info, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { ProgramCard } from "@/components/programs/ProgramCard";
import {
  countyTribes,
  relatedGivingPrograms,
  tribes,
} from "@/lib/tribes";

function counties(id: string) {
  return Object.entries(countyTribes)
    .filter(([, ids]) => ids.includes(id as never))
    .map(([county]) => county);
}

export default function ProgramsPage() {
  const orgs = Object.values(tribes);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <main className="relative z-10 mx-auto max-w-6xl px-5 py-7 sm:px-10 sm:py-10">
          <section className="animate-enter mb-7 grid gap-4 border-b border-black/[0.09] pb-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:items-end lg:gap-10">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#fa4616]/20 bg-[#fff1eb] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b72e00]">
                Official donation links
              </span>
              <h1 className="mt-4 max-w-3xl text-balance text-[32px] font-bold leading-[1.06] tracking-[-0.04em] text-[#171411] sm:text-[42px] lg:text-[48px]">
                Choose the organization you want to support.
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-[13px] leading-relaxed text-[#625c56] sm:text-[14px]">
                Tend gathers public information about Indigenous-led land tax
                programs. Open a program to learn more, or use its official
                link to make a real contribution.
              </p>
            </div>

            <aside
              aria-label="Tend test boundary"
              className="rounded-[18px] border border-[#d99445]/30 bg-[#fff8ed] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#a55a00]"
                  size={18}
                />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f520d]">
                    Tend status
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-[#30271f]">
                    Demonstration only
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#6f5a43]">
                    These organizations have not onboarded. Tend checkout moves
                    test funds only. Real contributions go through each
                    organization&apos;s official link.
                  </p>
                </div>
              </div>
            </aside>
          </section>

          <div className="animate-enter animate-enter-delay-1 grid gap-4 md:grid-cols-2">
            {orgs.map((program) => (
              <ProgramCard
                counties={counties(program.id)}
                key={program.id}
                program={program}
              />
            ))}
          </div>

          <section className="mt-10 border-t border-black/[0.08] pt-8">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase text-[#6b6b6b]">
              <Info aria-hidden="true" size={14} />
              More Ohlone-led giving
            </p>
            <h2 className="mt-2 text-balance text-[20px] font-bold text-[#111111]">
              A separate Shuumi program serves the East Bay
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-[13px] leading-relaxed text-[#666666]">
              Two organizations use the name Shuumi Land Tax. This listing
              links to Sogorea Te’ Land Trust, whose program supports Lisjan
              Ohlone work. Tend does not host its checkout.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center rounded-[16px] border border-black/[0.08] bg-white p-5">
              {relatedGivingPrograms.map((program) => (
                <div className="contents" key={program.programUrl}>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111111]">
                      {program.taxName}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#666666]">
                      {program.name}, {program.people}
                    </p>
                    <p className="mt-3 max-w-2xl text-pretty text-[12px] leading-relaxed text-[#555555]">
                      {program.summary}
                    </p>
                  </div>
                  <a
                    className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#111111] px-4 text-[12px] font-semibold text-white hover:bg-[#333333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    href={program.programUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open the official program
                  </a>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
