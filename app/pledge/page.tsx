import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PledgeFlow } from "@/components/PledgeFlow";
import { demoMode } from "@/lib/demo";
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

export default function Home() {
  const demo = demoMode();
  const orgs = Object.values(tribes);

  return (
    <>
    <Navbar />
    <div className="relative overflow-hidden">
      {/* ambient blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(250,70,22,0.14), transparent 65%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[30%] -right-52 w-[560px] h-[560px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12), transparent 65%)",
          filter: "blur(120px)",
        }}
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pt-20 pb-14">
        <div className="max-w-2xl">
          <span className="animate-enter inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Live on Ohlone land · Auth0 × Stripe hackathon
          </span>
          <h1 className="animate-enter animate-enter-delay-1 display-1 mt-5">
            You live on someone&apos;s ancestral land.{" "}
            <span className="text-gradient-whop">Tend it.</span>
          </h1>
          <p className="animate-enter animate-enter-delay-2 mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            A voluntary land tax is a small recurring contribution from the
            people living on Ohlone land to the tribes who have belonged to it
            for ten thousand years. Type your address, find Indigenous-led
            contribution programs connected to where you live, and begin.{" "}
            <strong className="text-zinc-200">Tend takes no platform fee.</strong>
          </p>
          <div className="animate-enter animate-enter-delay-3 mt-7 flex flex-wrap gap-3">
            <a href="#pledge" className="btn tnd-btn-primary">
              Find my land tax
            </a>
            <Link href="/programs" className="btn btn-ghost">
              Explore programs
            </Link>
          </div>
        </div>

        {/* stats row */}
        <div className="animate-enter animate-enter-delay-3 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "PROGRAMS LIVE", value: "2" },
            { label: "PLATFORM FEE", value: "0%" },
            { label: "COUNTIES COVERED", value: "5" },
            { label: "MACHINE PAYERS", value: "MPP" },
          ].map((s) => (
            <div key={s.label} className="surface-2 rounded-[10px] p-3 text-center">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-[18px] font-bold text-white font-display mt-0.5">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured programs */}
      <section className="relative mx-auto max-w-6xl px-5 mt-6">
        <div className="rule-row">
          <h2 className="display-2">Programs</h2>
          <span className="note">by each tribe&apos;s own published definition</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {orgs.map((t, i) => (
            <Link
              key={t.id}
              href={`/programs/${t.id}`}
              className={`animate-enter ${i === 1 ? "animate-enter-delay-1" : ""} group block bg-[#141414] border border-white/[0.06] rounded-[16px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:border-white/[0.12] active:scale-[0.99]`}
            >
              <div className={`h-28 ${COVER[t.id]} relative`}>
                <span
                  className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded ${BADGE[t.id]}`}
                >
                  {t.region}
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-white/60">
                  {counties(t.id).length} counties
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-semibold text-white group-hover:text-[#ff7a4a] transition-colors">
                  {t.taxName}
                </h3>
                <p className="text-[12px] text-zinc-500 mt-0.5">{t.name}</p>
                <p className="text-[12px] text-zinc-400 leading-relaxed mt-3 line-clamp-3">
                  {t.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {counties(t.id).map((c) => (
                    <span
                      key={c}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 border border-white/[0.06]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-600 font-mono">
                    100% to the org · no platform fee
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-medium group-hover:bg-orange-500/20 transition-colors">
                    View program →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-zinc-600 max-w-2xl">
          Santa Clara County appears in both tribes&apos; published definitions
          — Tend shows both and never arbitrates boundaries. In the East Bay,
          Sogorea Te&apos; Land Trust&apos;s Shuumi Land Tax (Lisjan Ohlone) is
          also part of this landscape.
        </p>
      </section>

      {/* Pledge */}
      <section id="pledge" className="relative mx-auto max-w-6xl px-5 mt-16">
        <div className="rule-row">
          <h2 className="display-2">Begin</h2>
          <span className="note">about ninety seconds · no account needed</span>
        </div>
        <div className="mt-6">
          <PledgeFlow demo={demo} />
        </div>
      </section>

      {/* How it holds together */}
      <section className="relative mx-auto max-w-6xl px-5 mt-16">
        <div className="rule-row">
          <h2 className="display-2">What holds this together</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "A proven practice",
              body: "Voluntary land taxes work: the East Bay's Shuumi Land Tax built one of the strongest Indigenous land trusts in the country. The Ramaytush Yunakin program exists today, and the Muwekma Ohlone Preservation Foundation accepts direct support. Tend demonstrates how verified programs could share modern contribution rails.",
            },
            {
              title: "No Tend platform fee",
              body: "Pledges are created directly on the tribe's own Stripe account — their supporters, their data, their payout. Tend takes no platform fee; Stripe processing fees may apply. If Tend vanished tomorrow, every pledge would keep flowing.",
            },
            {
              title: "Sovereignty as architecture",
              body: "Each tribe is its own tenant: it controls its counties, rates, and words, and grants its own dashboard access. Tribes in disagreement never share a surface, a pot, or a boundary decision.",
            },
          ].map((f) => (
            <div key={f.title} className="surface-1 rounded-[16px] p-5">
              <h3 className="text-[15px] font-semibold text-white">{f.title}</h3>
              <p className="mt-2.5 text-[12px] leading-relaxed text-zinc-400">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Machine section */}
      <section className="band mt-16">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="rule-row">
            <h2 className="display-2">Machines pay rent here.</h2>
            <span className="note">Stripe Machine Payments Protocol</span>
          </div>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
            <p className="max-w-xl text-[14px] leading-relaxed text-zinc-400">
              Ten trillion dollars of market cap sits on Ohlone land. Its agent
              fleets pay for compute, APIs, and data over machine rails — Tend
              lets them pay for where they run. One line in your automation; an
              AI agent can make an annual contribution like any other API
              payment.
            </p>
            <div>
              <pre className="terminal">
                {`$ `}
                <span className="cmd">
                  npx mppx https://tend.example/api/mpp/land-tax?tribe=ramaytush --method POST
                </span>
                {`
← 402 Payment Required · tempo, card
→ pay $25.00
← receipt ✓ routing status recorded`}
              </pre>
              <p className="mt-2.5 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                first call returns the challenge · second call carries the
                credential
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </>
  );
}
