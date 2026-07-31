import { Navbar } from "@/components/layout/Navbar";
import { TempoStream } from "@/components/TempoStream";
import Link from "next/link";
import { getTribe } from "@/lib/tribes";

export default async function Thanks({
  searchParams,
}: {
  searchParams: Promise<{
    amount?: string;
    demo?: string;
    session_id?: string;
    tribe?: string;
  }>;
}) {
  const {
    tribe: tribeParam,
    demo,
    session_id: sessionId,
  } = await searchParams;
  const tribe = getTribe(tribeParam ?? "");

  if (sessionId && demo !== "1") {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: "108px" }} />
        <main className="tempo-thanks-shell">
          <TempoStream
            sessionId={sessionId}
            fallbackOrganization={
              tribe?.name ?? "Indigenous-led organization"
            }
          />
          <div className="tempo-thanks-actions">
            <Link href="/pledge" className="btn btn-ghost">
              Make another contribution
            </Link>
            <Link href="/dashboard" className="btn tnd-btn-primary">
              Open dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
    <Navbar />
    <div style={{ paddingTop: "108px" }} />
    <div className="mx-auto max-w-2xl px-6 pt-24 text-center">
      {demo === "1" && (
        <p className="mb-6 rounded-lg border border-amber bg-parch px-4 py-3 text-sm">
          <strong>Demo preview</strong> — no payment or subscription was
          created.
        </p>
      )}
      <p className="font-display text-sm font-semibold text-tide">
        {demo === "1" ? "Pledge preview" : "Pledge begun"}
      </p>
      <h1 className="display-1 mt-4">
        {demo === "1" ? "Contribution preview complete." : "Contribution begun."}
      </h1>
      <p className="mt-6 text-lg text-faded leading-relaxed">
        {tribe
          ? `Your ${tribe.taxName} is ready for the ${tribe.name}.`
          : "Your contribution is ready for the organization."}{" "}
        {demo === "1"
          ? "In a configured deployment, Stripe Checkout creates the subscription and sends the receipt."
          : "A receipt is on its way from Stripe."}
      </p>
      <Link href="/" className="btn tnd-btn-primary mt-10">
        Back to Tend
      </Link>
    </div>
  </>
  );
}
