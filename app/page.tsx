import { PledgeFlow } from "@/components/PledgeFlow";
import { countyTribes, tribes } from "@/lib/tribes";

const TRIBE_COLOR: Record<string, string> = {
  ramaytush: "bg-moss",
  muwekma: "bg-clay",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      {/* Hero */}
      <section className="pt-14 pb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-clay">
          The San Francisco Bay Area · Ohlone land
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] mt-4 max-w-2xl">
          You live on someone&apos;s ancestral land. Tend it.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-faded leading-relaxed">
          A voluntary land tax is a small recurring contribution from the
          people living on Ohlone land to the tribes who have belonged to it
          for ten thousand years. Type your address, see whose land holds you,
          and begin — <strong className="text-ink">100% goes to the tribe</strong>.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#pledge" className="btn btn-primary">
            Find my land tax
          </a>
          <a
            href="/dashboard/muwekma"
            className="btn border border-sand bg-parch"
          >
            See a tribe&apos;s dashboard →
          </a>
        </div>
      </section>

      {/* The two tribes, up front */}
      <section className="grid gap-4 sm:grid-cols-2">
        {Object.values(tribes).map((t) => (
          <div key={t.id} className="card p-6">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${TRIBE_COLOR[t.id]}`}
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-clay">
                {t.region}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold mt-2">
              {t.name}
            </h2>
            <p className="mt-2 text-sm text-faded leading-relaxed">{t.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {Object.entries(countyTribes)
                .filter(([, ids]) => ids.includes(t.id))
                .map(([county]) => (
                  <span key={county} className="chip cursor-default!">
                    {county}
                  </span>
                ))}
            </div>
            <div className="mt-4 text-sm font-medium text-moss">
              {t.taxName} ·{" "}
              <a href={t.siteUrl} className="underline underline-offset-4">
                {t.siteUrl.replace("https://www.", "").replace("https://", "")}
              </a>
            </div>
          </div>
        ))}
      </section>
      <p className="mt-3 text-xs text-faded">
        Santa Clara County appears in both tribes&apos; published definitions —
        Tend shows both and never arbitrates boundaries. In the East Bay,
        Sogorea Te&apos; Land Trust&apos;s Shuumi Land Tax (Lisjan Ohlone) is
        also part of this landscape.
      </p>

      {/* Pledge flow */}
      <div id="pledge" className="mt-12">
        <PledgeFlow />
      </div>

      {/* What a land tax is */}
      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-semibold">
            A proven practice
          </h3>
          <p className="mt-2 text-sm text-faded leading-relaxed">
            Voluntary land taxes work: the East Bay&apos;s Shuumi Land Tax
            built one of the strongest Indigenous land trusts in the country.
            The Ramaytush Yunakin program exists today; Muwekma has had no
            recurring-giving rail at all. Tend gives both the same modern one.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">
            100%, unrestricted
          </h3>
          <p className="mt-2 text-sm text-faded leading-relaxed">
            Pledges are created directly on the tribe&apos;s own Stripe
            account — their supporters, their data, their payout. Tend takes
            0%, and the money carries no grant strings. If Tend vanished
            tomorrow, every pledge would keep flowing.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">
            Sovereignty as architecture
          </h3>
          <p className="mt-2 text-sm text-faded leading-relaxed">
            Each tribe is its own tenant: it controls its counties, rates, and
            words, and grants its own dashboard access. Tribes in disagreement
            never share a surface, a pot, or a boundary decision.
          </p>
        </div>
      </section>

      {/* The three surfaces */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-semibold">
          One deployment, three doors
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              Residents
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="field !py-2 text-faded">123 Valencia St…</div>
              <div className="font-semibold">→ Ramaytush Ohlone land</div>
              <div className="chip chip-active inline-block">$25/month</div>
            </div>
            <p className="mt-3 text-xs text-faded">
              Address → tribe → standing order. Ninety seconds.
            </p>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              Tribes
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-display text-2xl font-bold">12</div>
                <div className="text-[10px] text-faded">supporters</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold">$372</div>
                <div className="text-[10px] text-faded">/month</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold">$175</div>
                <div className="text-[10px] text-faded">machines</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-faded">
              A fundraising program with no code, no hosting, no hires.{" "}
              <a href="/dashboard/muwekma" className="underline">
                Open the live demo →
              </a>
            </p>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              Machines
            </div>
            <pre className="mt-3 rounded bg-moss-deep p-3 text-[11px] leading-relaxed text-cream overflow-x-auto">
              {`POST /api/mpp/land-tax
← 402 Payment Required
→ pay $25.00 (MPP)
← receipt ✓ routed to tribe`}
            </pre>
            <p className="mt-3 text-xs text-faded">
              AI agents pay an annual land tax like any other API bill.
            </p>
          </div>
        </div>
      </section>

      {/* Machine section */}
      <section className="mt-16 card p-6 sm:p-8">
        <h3 className="font-display text-2xl font-semibold">
          Run an AI workforce on this land?
        </h3>
        <p className="mt-2 text-faded max-w-xl">
          Ten trillion dollars of market cap sits on Ohlone land. Its agent
          fleets pay for compute, APIs, and data over machine rails — Tend
          lets them pay for where they run. One line in your automation;
          Stripe&apos;s Machine Payments Protocol does the rest.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-moss-deep p-4 text-sm text-cream">
          {`npx mppx https://tend.example/api/mpp/land-tax?tribe=ramaytush \\
    --method POST`}
        </pre>
      </section>
    </div>
  );
}
