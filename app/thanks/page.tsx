import { getTribe } from "@/lib/tribes";

export default async function Thanks({
  searchParams,
}: {
  searchParams: Promise<{ tribe?: string }>;
}) {
  const { tribe: tribeParam } = await searchParams;
  const tribe = getTribe(tribeParam ?? "");

  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-clay">
        Pledge begun
      </p>
      <h1 className="font-display text-5xl font-bold mt-4">
        The land remembers.
      </h1>
      <p className="mt-6 text-lg text-faded leading-relaxed">
        {tribe
          ? `Your ${tribe.taxName} now recurs to the ${tribe.name} — directly to their account, in full.`
          : "Your land tax pledge is now recurring — directly to the tribe, in full."}{" "}
        A receipt is on its way from Stripe, and every renewal happens without
        you lifting a finger.
      </p>
      <a href="/" className="btn btn-primary mt-10">
        Back to Tend
      </a>
    </div>
  );
}
