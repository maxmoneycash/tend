import Link from "next/link";
import { PledgeFlow } from "@/components/PledgeFlow";
import { Panorama } from "@/components/site/Panorama";
import { demoMode } from "@/lib/demo";
import { countyTribes, tribes } from "@/lib/tribes";

function counties(id: string) {
  return Object.entries(countyTribes)
    .filter(([, ids]) => ids.includes(id as never))
    .map(([county]) => county);
}

export default function Home() {
  const demo = demoMode();
  const orgs = Object.values(tribes);

  return (
    <div>
      {/* Hero — dawn over the Bay */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 pt-14 pb-6 relative z-10">
          <h1 className="display-1 max-w-3xl" data-reveal>
            You live on someone&apos;s ancestral land.
            <span className="text-tide"> Tend it.</span>
          </h1>
          <p
            className="mt-6 max-w-xl text-lg leading-relaxed"
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            A voluntary land tax is a small recurring contribution from the
            people living on Ohlone land to the tribes who have belonged to it
            for ten thousand years. Type your address, find Indigenous-led
            contribution programs connected to where you live, and begin.{" "}
            <strong>Tend takes no platform fee.</strong>
          </p>
          <div
            className="mt-8 flex flex-wrap gap-3"
            data-reveal
            style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
          >
            <a href="#pledge" className="btn btn-primary">
              Find my land tax
            </a>
            <Link href="/dashboard/muwekma" className="btn btn-ghost">
              See a tribe&apos;s dashboard
            </Link>
          </div>
        </div>
        <Panorama className="block w-full h-[300px] sm:h-[380px] -mt-24 sm:-mt-36" />
      </section>

      {/* The organizations */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <div className="rule-row" data-reveal>
          <h2 className="display-2">Whose land holds you</h2>
          <span className="note">by each tribe&apos;s own published definition</span>
        </div>

        <div className="mt-10 space-y-12">
          {orgs.map((t, i) => (
            <div
              key={t.id}
              className="grid gap-4 sm:grid-cols-[1fr_1.3fr] sm:gap-10"
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <div>
                <h3 className="display-3">{t.name}</h3>
                <p className="mt-1 font-display text-sm font-semibold text-tide">
                  {t.region}
                </p>
                <p className="mt-3 font-display text-sm font-semibold">
                  {t.taxName} ·{" "}
                  <a
                    href={t.siteUrl}
                    className="underline decoration-mist underline-offset-4 hover:decoration-tide"
                  >
                    {t.siteUrl
                      .replace("https://www.", "")
                      .replace("https://", "")
                      .replace(/\/.*$/, "")}
                  </a>
                </p>
              </div>
              <div>
                <p className="leading-relaxed text-[1.02rem]">{t.blurb}</p>
                <p className="mt-3 font-display text-sm font-medium text-faded">
                  {counties(t.id).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-faded" data-reveal>
          Santa Clara County appears in both tribes&apos; published definitions
          — Tend shows both and never arbitrates boundaries. In the East Bay,
          Sogorea Te&apos; Land Trust&apos;s Shuumi Land Tax (Lisjan Ohlone) is
          also part of this landscape.
        </p>
      </section>

      {/* Pledge */}
      <section id="pledge" className="mx-auto max-w-5xl px-6 mt-20">
        <div className="rule-row" data-reveal>
          <h2 className="display-2">Begin</h2>
          <span className="note">about ninety seconds · no account needed</span>
        </div>
        <div className="mt-8" data-reveal>
          <PledgeFlow demo={demo} />
        </div>
      </section>

      {/* What holds it together */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <div className="rule-row" data-reveal>
          <h2 className="display-2">What holds this together</h2>
        </div>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          <div data-reveal>
            <h3 className="display-3">A proven practice</h3>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-faded">
              Voluntary land taxes work: the East Bay&apos;s Shuumi Land Tax
              built one of the strongest Indigenous land trusts in the
              country. The Ramaytush Yunakin program exists today, and the
              Muwekma Ohlone Preservation Foundation accepts direct support.
              Tend demonstrates how verified programs could share modern
              contribution rails.
            </p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
            <h3 className="display-3">No Tend platform fee</h3>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-faded">
              Pledges are created directly on the tribe&apos;s own Stripe
              account — their supporters, their data, their payout. Tend takes
              no platform fee; Stripe processing fees may apply. If Tend
              vanished tomorrow, every pledge would keep flowing.
            </p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            <h3 className="display-3">Sovereignty as architecture</h3>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-faded">
              Each tribe is its own tenant: it controls its counties, rates,
              and words, and grants its own dashboard access. Tribes in
              disagreement never share a surface, a pot, or a boundary
              decision.
            </p>
          </div>
        </div>
      </section>

      {/* Machine band */}
      <section className="band-2 noise mt-24">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rule-row" data-reveal>
            <h2 className="display-2">Machines pay rent here.</h2>
            <span className="note" style={{ color: "var(--color-mist)" }}>
              Stripe Machine Payments Protocol
            </span>
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <p className="max-w-xl leading-relaxed opacity-90" data-reveal>
              Ten trillion dollars of market cap sits on Ohlone land. Its
              agent fleets pay for compute, APIs, and data over machine rails
              — Tend lets them pay for where they run. One line in your
              automation; an AI agent can make an annual contribution like any
              other API payment.
            </p>
            <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
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
              <p className="mt-3 font-machine text-xs opacity-70">
                first call returns the challenge · second call carries the
                credential
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three doors */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <div className="rule-row" data-reveal>
          <h2 className="display-2">One deployment, three doors</h2>
        </div>
        <div className="mt-6 divide-y divide-mist">
          <div className="py-6 grid gap-2 sm:grid-cols-[180px_1fr] sm:gap-8" data-reveal>
            <h3 className="display-3">Residents</h3>
            <p className="leading-relaxed text-faded">
              Address → tribe → standing order. Ninety seconds, and the pledge
              recurs without another thought.
            </p>
          </div>
          <div className="py-6 grid gap-2 sm:grid-cols-[180px_1fr] sm:gap-8" data-reveal>
            <h3 className="display-3">Tribes</h3>
            <p className="leading-relaxed text-faded">
              A fundraising program with no code, no hosting, no hires —
              supporters, recurring totals, and the machine ledger in one
              sovereign view.{" "}
              <Link
                href="/dashboard/muwekma"
                className="font-display font-semibold text-tide underline decoration-mist underline-offset-4"
              >
                Open the live demo
              </Link>
            </p>
          </div>
          <div className="py-6 grid gap-2 sm:grid-cols-[180px_1fr] sm:gap-8" data-reveal>
            <h3 className="display-3">Machines</h3>
            <p className="leading-relaxed text-faded">
              A payable endpoint speaking Stripe&apos;s MPP: challenge,
              credential, receipt. AI agents make an annual contribution like
              any other API payment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
