import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import {
  countyTribes,
  relatedGivingPrograms,
  tribes,
  type TribeId,
} from "@/lib/tribes";

const COVER: Record<TribeId, string> = {
  ramaytush: "cover-orange",
  muwekma: "cover-purple",
};
const BADGE: Record<TribeId, string> = {
  ramaytush: "text-[#FA4616] bg-[#FA4616]/10",
  muwekma: "text-[#8B5CF6] bg-[#8B5CF6]/10",
};

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
        <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8 animate-enter">
            <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
              Programs
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] mb-2 tracking-[-0.02em]">
              Indigenous-led contribution programs
            </h1>
            <p className="text-[13px] sm:text-[14px] font-sans text-[#7d7d7d] max-w-xl text-pretty leading-relaxed tracking-[-0.01em]">
              Demonstration listings based on public information. These
              organizations have not onboarded to Tend, and no real
              contributions are accepted here.
            </p>
          </div>

          <div className="animate-enter animate-enter-delay-1 grid gap-4 md:grid-cols-2">
            {orgs.map((t) => (
              <Link
                key={t.id}
                href={`/programs/${t.id}`}
                className="group block bg-white border border-black/[0.08] rounded-[16px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:border-black/[0.14] active:scale-[0.99]"
              >
                <div className={`h-36 ${COVER[t.id]} relative overflow-hidden`}>
                  <video
                    src={`/videos/${t.id}.mp4`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    className={`absolute top-3 left-3 z-10 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur ${BADGE[t.id]}`}
                  >
                    {t.region}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-semibold text-[#111111] group-hover:text-[#ff7a4a] transition-colors">
                    {t.taxName}
                  </h3>
                  <p className="text-[12px] text-[#6b6b6b] mt-0.5">{t.name}</p>
                  <p className="text-[12px] text-[#555555] leading-relaxed mt-3 line-clamp-2">
                    {t.blurb}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {counties(t.id).map((c) => (
                      <span
                        key={c}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.03] text-[#6b6b6b] border border-black/[0.08]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-700">
                      Demonstration program
                    </span>
                    <span className="text-[11px] text-[#8a8a8a] font-mono">
                      Stripe test mode
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-10 border-t border-black/[0.08] pt-8">
            <p className="text-[11px] font-semibold uppercase text-[#6b6b6b]">
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
