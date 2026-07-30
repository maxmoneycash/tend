import { PledgeFlow } from "@/components/PledgeFlow";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="pt-16 pb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-clay">
          The San Francisco Bay Area · Ohlone land
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] mt-4 max-w-2xl">
          You live on someone&apos;s ancestral land. Tend it.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-faded leading-relaxed">
          A voluntary land tax is rent acknowledged: a small recurring
          contribution from the people living on Ohlone land to the tribes who
          have belonged to it for ten thousand years. Type your address, see
          whose land holds you, and begin — 100% goes to the tribe.
        </p>
      </section>

      <PledgeFlow />

      <section className="mt-20 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-semibold">Locate</h3>
          <p className="mt-2 text-sm text-faded leading-relaxed">
            Your address resolves to a county, and the county to every tribe
            whose own published territorial definition includes it. Overlaps
            are shown honestly — the choice is always yours.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Contribute</h3>
          <p className="mt-2 text-sm text-faded leading-relaxed">
            A monthly or yearly pledge through Stripe, created directly on the
            tribe&apos;s own account — their supporters, their data, their
            payout. Tend takes 0%.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">
            Machines too
          </h3>
          <p className="mt-2 text-sm text-faded leading-relaxed">
            AI agents work on this land now. Tend speaks Stripe&apos;s Machine
            Payments Protocol, so an agent can pay its own annual land tax —
            no human in the loop, except the ones who were here first.
          </p>
        </div>
      </section>

      <section className="mt-16 card p-6 sm:p-8">
        <h3 className="font-display text-2xl font-semibold">
          Run an AI workforce on this land?
        </h3>
        <p className="mt-2 text-faded max-w-xl">
          Point your agent at the machine-payable endpoint. First call returns
          a 402 with payment methods; the agent pays and collects its receipt.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-moss-deep p-4 text-sm text-cream">
          {`npx mppx https://tend.example/api/mpp/land-tax?tribe=ramaytush \\
    --method POST`}
        </pre>
      </section>
    </div>
  );
}
