import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Info } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { countyNotes, countyTribes, getTribe } from "@/lib/tribes";
import { StreamPanel } from "@/components/stream/StreamPanel";
import { ProgramOfficialHero } from "@/components/programs/ProgramOfficialHero";
import { demoMode } from "@/lib/demo";

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
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div
        style={{
          paddingTop: "calc(108px + env(safe-area-inset-top, 0px))",
        }}
      />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-7 sm:px-10 sm:py-10">
          <div className="animate-enter">
            <Link
              href="/programs"
              className="inline-flex min-h-11 items-center text-[11px] font-semibold text-[#6b6b6b] hover:text-[#3a3a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171411] focus-visible:ring-offset-2"
            >
              ← All programs
            </Link>
            <ProgramOfficialHero counties={tribeCounties} program={tribe} />
          </div>

          <section
            className="animate-enter animate-enter-delay-1 mt-5 grid scroll-mt-28 gap-4 lg:grid-cols-[minmax(260px,0.68fr)_minmax(0,1.32fr)]"
            id="tend-test-checkout"
          >
            <aside className="h-fit rounded-[20px] border-2 border-[#d99445]/35 bg-[#fff8ed] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#9b5a0a]">
                <FlaskConical aria-hidden="true" size={17} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Tend preview
                </p>
              </div>
              <h2 className="mt-3 text-balance text-[22px] font-bold leading-tight tracking-[-0.025em] text-[#30271f]">
                This checkout is a test.
              </h2>
              <p className="mt-3 text-[12px] leading-relaxed text-[#6f5a43]">
                This checkout moves test funds only. Stripe stays in test mode,
                and the receipt settles with faucet-funded pathUSD on Tempo
                Moderato testnet.
              </p>
              <p className="mt-4 border-t border-[#d99445]/25 pt-4 text-[11px] font-semibold leading-relaxed text-[#4c3d2d]">
                Use the official donation button above for real giving. Use
                this panel only to preview the flow.
              </p>
            </aside>

            <StreamPanel
              demo={demo}
              tribeId={tribe.id}
              tribeName={tribe.name}
            />
          </section>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <section
              aria-labelledby="about-program"
              className="surface-1 rounded-[16px] p-5 sm:p-6"
            >
              <p className="flex items-center gap-2 text-[11px] font-display font-semibold text-[#6b6b6b] uppercase tracking-wider">
                <Info aria-hidden="true" size={14} />
                About this program
              </p>
              <h2 className="sr-only" id="about-program">
                About {tribe.taxName}
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#3a3a3a]">
                {tribe.blurb}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tribeCounties.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.03] text-[#6b6b6b] border border-black/[0.08]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {notes.map((n) => (
                <p
                  className="mt-4 text-[11px] leading-relaxed text-[#8a8a8a]"
                  key={n}
                >
                  {n}
                </p>
              ))}

              <div className="mt-5 pt-4 border-t border-black/[0.06] grid grid-cols-3 gap-3">
                <div className="surface-2 rounded-[10px] p-2.5 text-center">
                  <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">
                    Real funds sent
                  </p>
                  <p className="text-[15px] font-bold text-[#111111] font-display">
                    $0
                  </p>
                </div>
                <div className="surface-2 rounded-[10px] p-2.5 text-center">
                  <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">
                    Checkout
                  </p>
                  <p className="text-[15px] font-bold text-[#111111] font-display">
                    test only
                  </p>
                </div>
                <div className="surface-2 rounded-[10px] p-2.5 text-center">
                  <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">
                    Machine path
                  </p>
                  <p className="text-[15px] font-bold text-[#111111] font-display">
                    MPP
                  </p>
                </div>
              </div>
            </section>

            <div className="space-y-4">
              <p className="text-[11px] text-[#8a8a8a] text-center">
                Want to try address matching?{" "}
                <Link
                  className="underline underline-offset-4 text-[#555555] hover:text-[#111111]"
                  href="/pledge"
                >
                  Find a program by address or county
                </Link>
              </p>

              <div className="surface-1 rounded-[16px] p-5">
                <p className="text-[11px] font-display font-semibold text-[#6b6b6b] uppercase tracking-wider">
                  Machine payments
                </p>
                <pre className="mt-3 rounded-[10px] bg-[#0f0f0f] border border-black/[0.08] p-3 font-mono text-[10.5px] leading-relaxed text-[#555555] overflow-x-auto">
                  {`POST /api/mpp/land-tax
     ?tribe=${tribe.id}
→ 402 · pay $25.00 · receipt`}
                </pre>
                <p className="mt-2 text-[10px] font-mono text-[#8a8a8a]">
                  Demonstration only. pathUSD on Tempo Moderato testnet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
