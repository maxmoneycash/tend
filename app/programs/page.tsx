import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { countyTribes, tribes, type TribeId } from "@/lib/tribes";

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
              Each program is a sovereign tenant — its counties, rates, words,
              and Stripe account belong to the tribe. Tend takes no platform
              fee.
            </p>
          </div>

          <div className="animate-enter animate-enter-delay-1 grid gap-4 md:grid-cols-2">
            {orgs.map((t) => (
              <Link
                key={t.id}
                href={`/programs/${t.id}`}
                className="group block bg-white border border-black/[0.08] rounded-[16px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:border-black/[0.14] active:scale-[0.99]"
              >
                <div className={`h-20 ${COVER[t.id]} relative`}>
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded ${BADGE[t.id]}`}
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
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Accepting pledges
                    </span>
                    <span className="text-[11px] text-[#8a8a8a] font-mono">
                      monthly · yearly · MPP
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            <div className="border border-dashed border-black/[0.12] rounded-[16px] p-5 flex flex-col items-start justify-center min-h-[180px] md:col-span-2">
              <p className="text-[14px] font-semibold text-[#3a3a3a]">
                Your program here
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-[#6b6b6b] max-w-xl">
                Tend hosts sovereign tenants for Indigenous-led contribution
                programs. Onboarding is a conversation, on the tribe&apos;s
                terms.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
