import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
import { countyNotes, countyTribes, getTribe, type TribeId } from "@/lib/tribes";

const COVER: Record<TribeId, string> = {
  ramaytush: "cover-orange",
  muwekma: "cover-purple",
};
const BADGE: Record<TribeId, string> = {
  ramaytush: "text-[#FA4616] bg-[#FA4616]/10",
  muwekma: "text-[#8B5CF6] bg-[#8B5CF6]/10",
};

export default async function ProgramDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tribe = getTribe(id);
  if (!tribe) notFound();

  const tribeCounties = Object.entries(countyTribes)
    .filter(([, ids]) => ids.includes(tribe.id))
    .map(([county]) => county);
  const notes = tribeCounties
    .map((c) => countyNotes[c])
    .filter((n, i, arr) => n && arr.indexOf(n) === i);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          <div className="animate-enter">
            <Link
              href="/programs"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
            >
              ← All programs
            </Link>

            <div className={`mt-4 h-28 ${COVER[tribe.id]} rounded-[16px] relative border border-white/[0.06]`}>
              <span
                className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded ${BADGE[tribe.id]}`}
              >
                {tribe.region}
              </span>
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Accepting pledges
              </span>
            </div>

            <div className="mt-5 mb-6">
              <h1 className="text-[22px] sm:text-[26px] font-bold text-white mb-1 tracking-[-0.02em]">
                {tribe.taxName}
              </h1>
              <p className="text-[13px] text-zinc-500">
                {tribe.name} ·{" "}
                <a
                  href={tribe.siteUrl}
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-white/20"
                >
                  {tribe.siteUrl
                    .replace("https://www.", "")
                    .replace("https://", "")
                    .replace(/\/.*$/, "")}
                </a>
              </p>
            </div>
          </div>

          <div className="animate-enter animate-enter-delay-1 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="surface-1 rounded-[16px] p-5">
              <p className="text-[11px] font-display font-semibold text-zinc-500 uppercase tracking-wider">
                About
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-300">
                {tribe.blurb}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tribeCounties.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 border border-white/[0.06]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {notes.map((n) => (
                <p key={n} className="mt-4 text-[11px] leading-relaxed text-zinc-600">
                  {n}
                </p>
              ))}

              <div className="mt-5 pt-4 border-t border-white/[0.04] grid grid-cols-3 gap-3">
                <div className="surface-2 rounded-[10px] p-2.5 text-center">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Fee</p>
                  <p className="text-[15px] font-bold text-white font-display">0%</p>
                </div>
                <div className="surface-2 rounded-[10px] p-2.5 text-center">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Cadence</p>
                  <p className="text-[15px] font-bold text-white font-display">mo · yr</p>
                </div>
                <div className="surface-2 rounded-[10px] p-2.5 text-center">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Machines</p>
                  <p className="text-[15px] font-bold text-white font-display">MPP</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-1 rounded-[16px] p-5">
                <p className="text-[11px] font-display font-semibold text-zinc-500 uppercase tracking-wider">
                  Contribute
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                  Recurring pledge by card, created on the organization&apos;s
                  own Stripe account. Tend takes no platform fee.
                </p>
                <Link
                  href="/pledge"
                  className="btn-whop mt-4 w-full py-3 rounded-[12px] text-[13px] font-semibold flex items-center justify-center"
                >
                  Start a pledge
                </Link>
              </div>

              <div className="surface-1 rounded-[16px] p-5">
                <p className="text-[11px] font-display font-semibold text-zinc-500 uppercase tracking-wider">
                  Machine payments
                </p>
                <pre className="mt-3 rounded-[10px] bg-[#0f0f0f] border border-white/[0.06] p-3 font-mono text-[10.5px] leading-relaxed text-zinc-400 overflow-x-auto">
                  {`POST /api/mpp/land-tax
     ?tribe=${tribe.id}
→ 402 · pay $25.00 · receipt`}
                </pre>
                <p className="mt-2 text-[10px] font-mono text-zinc-600">
                  USDC on Tempo · offramped with Stripe
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
