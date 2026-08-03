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
        <div className="tempo-thanks-shell">
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
        </div>
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
          <strong>Demo preview.</strong> No payment or subscription was
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
          ? `This test receipt references ${tribe.taxName} and ${tribe.name}.`
          : "This test receipt references the selected demonstration program."}{" "}
        {demo === "1"
          ? "A configured test environment opens Stripe Checkout; this preview does not represent beneficiary onboarding or a real transfer."
          : "Stripe created a test-mode receipt; no real funds were sent to the organization."}
      </p>
      <Link href="/programs" className="btn tnd-btn-primary mt-10">
        View programs
      </Link>
    </div>
  </>
  );
}
