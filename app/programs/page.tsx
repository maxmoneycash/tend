import Link from "next/link";
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

export default function ProgramsExplorer() {
  const orgs = Object.values(tribes);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="display-1">Explorer</h1>
          <p className="mt-2 text-[13px] text-zinc-500 max-w-lg">
            Every contribution program Tend hosts — each one sovereign, each
            one paid directly, none of them arbitrated.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "PROGRAMS", value: "2" },
            { label: "COUNTIES", value: "5" },
            { label: "FEE", value: "0%" },
          ].map((s) => (
            <div key={s.label} className="surface-2 rounded-[10px] px-4 py-2.5 text-center">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-[16px] font-bold text-white font-display">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* filter tabs */}
      <div className="mt-8 flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto no-scrollbar w-fit">
        {["All", "Peninsula", "East & South Bay"].map((tab, i) => (
          <span
            key={tab}
            className={`px-4 py-2.5 rounded-lg text-[12px] font-medium whitespace-nowrap ${
              i === 0
                ? "bg-[#FA4616]/15 text-[#FA4616]"
                : "text-zinc-500"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orgs.map((t) => (
          <Link
            key={t.id}
            href={`/programs/${t.id}`}
            className="group block bg-[#141414] border border-white/[0.06] rounded-[16px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white/[0.12] active:scale-[0.98]"
          >
            <div className={`h-24 ${COVER[t.id]} relative`}>
              <span
                className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded ${BADGE[t.id]}`}
              >
                {t.region}
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-[15px] font-semibold text-white group-hover:text-[#ff7a4a] transition-colors">
                {t.taxName}
              </h3>
              <p className="text-[12px] text-zinc-500 mt-0.5">{t.name}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {counties(t.id).map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 border border-white/[0.06]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Accepting pledges
                </span>
                <span className="text-[11px] text-zinc-600 font-mono">
                  monthly · yearly · MPP
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* onboarding card */}
        <div className="border border-dashed border-white/[0.1] rounded-[16px] p-5 flex flex-col items-start justify-center min-h-[220px]">
          <p className="text-[15px] font-semibold text-zinc-300">
            Your program here
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
            Tend hosts sovereign tenants for Indigenous-led contribution
            programs: your counties, your rates, your words, your Stripe
            account. Onboarding is a conversation, on your terms.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] text-zinc-400 text-[11px] font-medium">
            By invitation of the tribe
          </span>
        </div>
      </div>
    </div>
  );
}
