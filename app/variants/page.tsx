import { Navbar } from "@/components/layout/Navbar";
import { AppearText } from "@/components/originkit-inspired/appear-text";
import {
  AmountPickerA,
  AmountPickerB,
  AmountPickerC,
} from "@/components/variants/AmountPickers";
import {
  StatsA,
  StatsB,
  StatsC,
} from "@/components/variants/DashboardStats";
import { FlowA, FlowB } from "@/components/variants/PledgeContainers";
import { PrimitivesStrip } from "@/components/variants/PrimitivesStrip";
import {
  TribeSelectorA,
  TribeSelectorB,
  TribeSelectorC,
} from "@/components/variants/TribeSelectors";

function Version({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-moss text-cream text-sm font-bold">
          {label}
        </span>
        <span className="text-sm text-faded">{note}</span>
      </div>
      {children}
    </div>
  );
}

export default function VariantsPage() {
  return (
    <>
    <Navbar />
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-8 space-y-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-clay">
          Component lab · basecn on Base UI
        </p>
        <h1 className="font-display text-5xl font-bold mt-3">
          <AppearText text="Pick what Tend should feel like." />
        </h1>
        <p className="mt-4 max-w-xl text-faded">
          Each surface below comes in two or three versions built from the
          basecn library, restyled to Tend&apos;s palette. Tell me the letters
          you like (e.g. &ldquo;amounts B, tribes A, stats C&rdquo;) and
          they&apos;ll become the app. The headline above is the
          originkit-inspired word reveal.
        </p>
      </header>

      <section>
        <h2 className="font-display text-3xl font-semibold mb-6">
          Amount picker
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Version label="A" note="chips — familiar, fastest">
            <AmountPickerA />
          </Version>
          <Version label="B" note="slider — sliding scale, literally">
            <AmountPickerB />
          </Version>
          <Version label="C" note="tiers — a relationship, not a transaction">
            <AmountPickerC />
          </Version>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-semibold mb-6">
          Tribe selection
        </h2>
        <div className="space-y-8">
          <Version label="A" note="cards — both visible; strongest for the Santa Clara overlap">
            <TribeSelectorA />
          </Version>
          <div className="grid gap-6 lg:grid-cols-2">
            <Version label="B" note="tabs — one tribe in focus, more reading room">
              <TribeSelectorB />
            </Version>
            <Version label="C" note="radio list — densest, quickest to pick">
              <TribeSelectorC />
            </Version>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-semibold mb-6">
          Dashboard stats
        </h2>
        <div className="space-y-8">
          <Version label="A" note="tiles — scans instantly (current)">
            <StatsA />
          </Version>
          <div className="grid gap-6 lg:grid-cols-2">
            <Version label="B" note="goals — numbers with direction">
              <StatsB />
            </Version>
            <Version label="C" note="ledger — auditable, feels like the books">
              <StatsC />
            </Version>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-semibold mb-6">
          Pledge flow container
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Version label="A" note="one card — nothing hidden">
            <FlowA />
          </Version>
          <Version label="B" note="accordion steps — guided, confirms as you go">
            <FlowB />
          </Version>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-semibold mb-6">
          The rest of the kit, in Tend&apos;s colors
        </h2>
        <PrimitivesStrip />
      </section>
    </div>
  </>
  );
}
