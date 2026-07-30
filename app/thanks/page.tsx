import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { getTribe } from "@/lib/tribes";

export default async function Thanks({
  searchParams,
}: {
  searchParams: Promise<{ tribe?: string; demo?: string }>;
}) {
  const { tribe: tribeParam, demo } = await searchParams;
  const tribe = getTribe(tribeParam ?? "");

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
      <h1 className="display-1 mt-4">Contribution preview complete.</h1>
      <p className="mt-6 text-lg text-faded leading-relaxed">
        {tribe
          ? `Your ${tribe.taxName} now recurs to the ${tribe.name} through their connected account.`
          : "Your contribution is now recurring through the organization's connected account."}{" "}
        {demo === "1"
          ? "In a configured deployment, Stripe Checkout creates the subscription and sends the receipt."
          : "A receipt is on its way from Stripe, and every renewal happens without you lifting a finger."}
      </p>
      <Link href="/" className="btn tnd-btn-primary mt-10">
        Back to Tend
      </Link>
    </div>
  </>
  );
}
