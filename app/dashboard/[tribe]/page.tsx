import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { auth0 } from "@/lib/auth0";
import { canAccessTribe } from "@/lib/access";
import { demoMachinePayments, demoMode, demoPledges } from "@/lib/demo";
import { getStripe } from "@/lib/stripe";
import { getTribe, getTribeAccount, type TribeId } from "@/lib/tribes";

export const dynamic = "force-dynamic";

type PledgeRow = {
  id: string;
  created: number;
  amountCents: number;
  interval: "month" | "year";
};

type MachineRow = {
  id: string;
  created: number;
  amountCents: number;
  status: string;
  payer?: string;
};

function usd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function monthly(row: PledgeRow): number {
  return row.interval === "year"
    ? Math.round(row.amountCents / 12)
    : row.amountCents;
}

export default async function TribeDashboard({
  params,
}: {
  params: Promise<{ tribe: string }>;
}) {
  const { tribe: tribeParam } = await params;
  const tribe = getTribe(tribeParam);
  if (!tribe) redirect("/dashboard");

  const demo = demoMode();

  if (!demo) {
    const session = await auth0.getSession();
    if (!session) redirect(`/auth/login?returnTo=/dashboard/${tribe.id}`);
    if (!canAccessTribe(session.user, tribe.id as TribeId)) {
      return (
        <div className="mx-auto max-w-2xl px-6 pt-24">
          <h1 className="font-display text-4xl font-bold">Not your tenant</h1>
          <p className="mt-4 text-faded">
            {session.user.email} isn&apos;t on the {tribe.name} admin list.
            Each tribe&apos;s tenant is sovereign — access is granted by that
            tribe alone.
          </p>
        </div>
      );
    }
  }

  const account = getTribeAccount(tribe.id as TribeId);
  let pledges: PledgeRow[] = [];
  let machine: MachineRow[] = [];
  let stripeNote: string | null = null;

  if (demo) {
    pledges = demoPledges();
    machine = demoMachinePayments();
  } else {
    try {
      const stripe = getStripe();
      const res = await stripe.subscriptions.list(
        { status: "active", limit: 100 },
        account ? { stripeAccount: account } : undefined,
      );
      const subs = account
        ? res.data
        : res.data.filter((s) => s.metadata?.tribe === tribe.id);
      pledges = subs.map((s: Stripe.Subscription) => {
        const item = s.items.data[0];
        return {
          id: s.id,
          created: s.created,
          amountCents: item?.price?.unit_amount ?? 0,
          interval:
            item?.price?.recurring?.interval === "year" ? "year" : "month",
        };
      });

      // Machine (MPP) payments settle on the platform account before routing.
      const pis = await stripe.paymentIntents.list({ limit: 100 });
      machine = pis.data
        .filter(
          (pi) =>
            pi.metadata?.source === "tend-mpp" &&
            pi.metadata?.tribe === tribe.id,
        )
        .map((pi) => ({
          id: pi.id,
          created: pi.created,
          amountCents: pi.amount,
          status: pi.status,
        }));
    } catch (err) {
      stripeNote = `Stripe not reachable (${(err as Error).message}) — configure STRIPE_SECRET_KEY.`;
    }
  }

  const mrr = pledges.reduce((sum, p) => sum + monthly(p), 0);
  const machineTotal = machine
    .filter((m) => m.status === "succeeded")
    .reduce((sum, m) => sum + m.amountCents, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-12">
      {demo && (
        <div className="mb-6 rounded-lg border border-amber bg-parch px-4 py-3 text-sm">
          <strong>Demo mode</strong> — sample data, sign-in bypassed. Connect
          Stripe &amp; Auth0 (see README) and this page goes live with the
          tribe&apos;s real numbers.
        </div>
      )}

      <p className="font-display text-sm font-semibold text-tide">
        {tribe.taxName}
      </p>
      <h1 className="display-2 mt-2">{tribe.name}</h1>
      <p className="mt-2 text-sm text-faded">
        {demo
          ? "This is the fundraising program in a box: no code, no hosting, no development director required."
          : account
            ? `Payments land directly on this tribe's own Stripe account (${account.slice(0, 12)}…).`
            : "Platform-fallback mode — run scripts/setup-connect.mjs to give this tribe its own account."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-faded">Supporters</div>
          <div className="font-display text-4xl font-bold mt-1">
            {pledges.length}
          </div>
          <div className="text-xs text-faded mt-1">active recurring pledges</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-faded">Recurring</div>
          <div className="font-display text-4xl font-bold mt-1">{usd(mrr)}</div>
          <div className="text-xs text-faded mt-1">
            per month · no Tend platform fee
          </div>
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

      <div className="mt-10 grid gap-8 sm:grid-cols-2 pb-8">
        <section>
          <h2 className="font-display text-2xl font-semibold">Pledges</h2>
          {pledges.length === 0 ? (
            <p className="mt-3 text-sm text-faded">
              No pledges yet — the land is patient.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pledges.slice(0, 12).map((p) => (
                <li
                  key={p.id}
                  className="card px-4 py-3 flex items-center justify-between text-sm"
                >
                  <span>{new Date(p.created * 1000).toLocaleDateString()}</span>
                  <span className="font-semibold">
                    {usd(p.amountCents)}/{p.interval}
                  </span>
                </li>
              ))}
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
              {machine.slice(0, 12).map((m) => (
                <li
                  key={m.id}
                  className="card px-4 py-3 flex items-center justify-between text-sm"
                >
                  <span>
                    {new Date(m.created * 1000).toLocaleDateString()}
                    {m.payer ? ` · ${m.payer}` : ` · ${m.status}`}
                  </span>
                  <span className="font-semibold">{usd(m.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
