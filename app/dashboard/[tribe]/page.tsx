import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { auth0 } from "@/lib/auth0";
import { canAccessTribe } from "@/lib/access";
import { getStripe } from "@/lib/stripe";
import { getTribe, getTribeAccount, type TribeId } from "@/lib/tribes";

export const dynamic = "force-dynamic";

function monthlyCents(sub: Stripe.Subscription): number {
  const item = sub.items.data[0];
  const amount = item?.price?.unit_amount ?? 0;
  const interval = item?.price?.recurring?.interval;
  return interval === "year" ? Math.round(amount / 12) : amount;
}

function usd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function TribeDashboard({
  params,
}: {
  params: Promise<{ tribe: string }>;
}) {
  const { tribe: tribeParam } = await params;
  const tribe = getTribe(tribeParam);
  if (!tribe) redirect("/dashboard");

  const session = await auth0.getSession();
  if (!session) redirect(`/auth/login?returnTo=/dashboard/${tribe.id}`);
  if (!canAccessTribe(session.user, tribe.id as TribeId)) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-24">
        <h1 className="font-display text-4xl font-bold">Not your tenant</h1>
        <p className="mt-4 text-faded">
          {session.user.email} isn&apos;t on the {tribe.name} admin list. Each
          tribe&apos;s tenant is sovereign — access is granted by that tribe
          alone.
        </p>
      </div>
    );
  }

  const account = getTribeAccount(tribe.id as TribeId);
  let subs: Stripe.Subscription[] = [];
  let machine: Stripe.PaymentIntent[] = [];
  let stripeNote: string | null = null;

  try {
    const stripe = getStripe();
    const res = await stripe.subscriptions.list(
      { status: "active", limit: 100 },
      account ? { stripeAccount: account } : undefined,
    );
    subs = account
      ? res.data
      : res.data.filter((s) => s.metadata?.tribe === tribe.id);

    // Machine (MPP) payments settle on the platform account before routing.
    const pis = await stripe.paymentIntents.list({ limit: 100 });
    machine = pis.data.filter(
      (pi) =>
        pi.metadata?.source === "tend-mpp" && pi.metadata?.tribe === tribe.id,
    );
  } catch (err) {
    stripeNote = `Stripe not reachable (${(err as Error).message}) — configure STRIPE_SECRET_KEY.`;
  }

  const mrr = subs.reduce((sum, s) => sum + monthlyCents(s), 0);
  const machineTotal = machine
    .filter((pi) => pi.status === "succeeded")
    .reduce((sum, pi) => sum + pi.amount, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-clay">
        {tribe.taxName}
      </p>
      <h1 className="font-display text-4xl font-bold mt-2">{tribe.name}</h1>
      <p className="mt-2 text-sm text-faded">
        {account
          ? `Payments land directly on this tribe's own Stripe account (${account.slice(0, 12)}…).`
          : "Platform-fallback mode — run scripts/setup-connect.mjs to give this tribe its own account."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-faded">Supporters</div>
          <div className="font-display text-4xl font-bold mt-1">
            {subs.length}
          </div>
          <div className="text-xs text-faded mt-1">active recurring pledges</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-faded">Recurring</div>
          <div className="font-display text-4xl font-bold mt-1">
            {usd(mrr)}
          </div>
          <div className="text-xs text-faded mt-1">per month, 100% yours</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-faded">Machine payments</div>
          <div className="font-display text-4xl font-bold mt-1">
            {usd(machineTotal)}
          </div>
          <div className="text-xs text-faded mt-1">
            paid by AI agents over MPP
          </div>
        </div>
      </div>

      {stripeNote && <p className="mt-4 text-sm text-clay">{stripeNote}</p>}

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold">Pledges</h2>
          {subs.length === 0 ? (
            <p className="mt-3 text-sm text-faded">
              No pledges yet — the land is patient.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {subs.slice(0, 12).map((s) => {
                const item = s.items.data[0];
                return (
                  <li
                    key={s.id}
                    className="card px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <span>
                      {new Date(s.created * 1000).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">
                      {usd(item?.price?.unit_amount ?? 0)}/
                      {item?.price?.recurring?.interval ?? "month"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">
            Machine ledger
          </h2>
          {machine.length === 0 ? (
            <p className="mt-3 text-sm text-faded">
              No agent has paid its land tax yet. Point one at
              {" /api/mpp/land-tax?tribe="}
              {tribe.id}.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {machine.slice(0, 12).map((pi) => (
                <li
                  key={pi.id}
                  className="card px-4 py-3 flex items-center justify-between text-sm"
                >
                  <span>
                    {new Date(pi.created * 1000).toLocaleDateString()} ·{" "}
                    {pi.status}
                  </span>
                  <span className="font-semibold">{usd(pi.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
