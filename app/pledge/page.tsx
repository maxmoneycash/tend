import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PledgeFlow } from "@/components/PledgeFlow";
import { auth0 } from "@/lib/auth0";
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

export default async function Home() {
  if (process.env.TEND_DEMO_AUTH_BYPASS !== "1") {
    const session = await auth0.getSession();
    if (!session) redirect("/auth/login?returnTo=/pledge");
  }

  const demo = demoMode();
  const orgs = Object.values(tribes);

  return (
    <>
    <Navbar />
    <div style={{ paddingTop: "108px" }} />
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
          <span className="animate-enter inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/10 text-green-700">
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
          <p className="animate-enter animate-enter-delay-2 mt-5 max-w-xl text-[15px] leading-relaxed text-[#555555]">
            A small recurring contribution to the tribes whose land you live on. Sign in, type your address, and begin — <strong className="text-[#2a2a2a]">no platform fee.</strong>
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
            { label: "MACHINE PAYERS", value: "MPP PREVIEW" },
          ].map((s) => (
            <div key={s.label} className="surface-2 rounded-[10px] p-3 text-center">
              <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-[18px] font-bold text-[#111111] font-display mt-0.5">
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
              className={`animate-enter ${i === 1 ? "animate-enter-delay-1" : ""} group block bg-white border border-black/[0.08] rounded-[16px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:border-black/[0.14] active:scale-[0.99]`}
            >
              <div className={`h-28 ${COVER[t.id]} relative`}>
                <span
                  className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded ${BADGE[t.id]}`}
                >
                  {t.region}
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[#111111]/60">
                  {counties(t.id).length} counties
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-semibold text-[#111111] group-hover:text-[#ff7a4a] transition-colors">
                  {t.taxName}
                </h3>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">{t.name}</p>
                <p className="text-[12px] text-[#555555] leading-relaxed mt-3 line-clamp-3">
                  {t.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
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
                  <span className="text-[11px] text-[#8a8a8a] font-mono">
                    0% Tend fee · Stripe fees apply
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-700 text-[11px] font-medium group-hover:bg-orange-500/20 transition-colors">
                    View program →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-[#8a8a8a] max-w-2xl">
          Santa Clara appears in both tribes&apos; definitions — Tend shows both and never decides.
        </p>
      </section>

      {/* Pledge */}
      <section id="pledge" className="relative mx-auto max-w-6xl px-5 mt-16">
        <div className="rule-row">
          <h2 className="display-2">Begin</h2>
          <span className="note">about ninety seconds · secured by Auth0</span>
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
              body: "Shuumi built one of the strongest Indigenous land trusts in the country — the model works. Yunakin runs today; Tend gives programs like it shared rails.",
            },
            {
              title: "No Tend platform fee",
              body: "Pledges live on the tribe's own Stripe account. If Tend vanished tomorrow, every pledge would keep flowing.",
            },
            {
              title: "Sovereignty as architecture",
              body: "Each tribe controls its counties, rates, words, and access. No shared pot, no boundary decisions made for them.",
            },
          ].map((f) => (
            <div key={f.title} className="surface-1 rounded-[16px] p-5">
              <h3 className="text-[15px] font-semibold text-[#111111]">{f.title}</h3>
              <p className="mt-2.5 text-[12px] leading-relaxed text-[#555555]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Machine section */}
      <section className="relative mx-auto max-w-6xl px-5 mt-16">
        <div>
          <div className="rule-row">
            <h2 className="display-2">Machines pay rent here.</h2>
            <span className="note">
              Stripe MPP prototype · crypto preview access required
            </span>
          </div>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
            <p className="text-[14px] leading-relaxed text-[#3a3a3a] max-w-md">
              AI agents run on this land too — one line in your automation.
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
            </div>
          </div>
        </div>
      </section>
    </div>
  </>
  );
}
