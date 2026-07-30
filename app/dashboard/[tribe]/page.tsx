import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientBlobs } from "@/components/layout/AmbientBlobs";
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
  const authBypass = process.env.TEND_DEMO_AUTH_BYPASS === "1";

  if (!demo && !authBypass) {
    const session = await auth0.getSession();
    if (!session) redirect(`/auth/login?returnTo=/dashboard/${tribe.id}`);
    if (!canAccessTribe(session.user, tribe.id as TribeId)) {
      return (
        <div className="min-h-screen">
          <Navbar />
          <div style={{ paddingTop: "108px" }} />
          <main className="max-w-6xl mx-auto px-6 sm:px-10 py-8">
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] tracking-[-0.02em]">
              Not your tenant
            </h1>
            <p className="mt-3 text-[13px] text-[#555555] max-w-lg leading-relaxed">
              {session.user.email} isn&apos;t on the {tribe.name} admin list.
              Each tribe&apos;s tenant is sovereign — access is granted by that
              tribe alone.
            </p>
          </main>
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
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div style={{ paddingTop: "108px" }} />
      <div className="relative" style={{ overflow: "clip" }}>
        <AmbientBlobs variant="earn" />
        <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
          {/* Hero */}
          <div className="mb-6 sm:mb-8 animate-enter">
            <span className="inline-block text-[11px] font-display font-medium px-2.5 py-1 rounded-[10px] bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20 uppercase tracking-wider mb-3">
              {tribe.taxName}
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] mb-2 tracking-[-0.02em]">
              {tribe.name}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#7d7d7d] max-w-xl text-pretty leading-relaxed">
              {demo
                ? "This is the fundraising program in a box: no code, no hosting, no development director required."
                : account
                  ? `Payments land directly on this tribe's own Stripe account (${account.slice(0, 12)}…).`
                  : "Platform mode — pledges are tagged to this program until the tribe connects its own account."}
            </p>
          </div>

          {(demo || authBypass) && (
            <div className="animate-enter mb-4 surface-1 rounded-[12px] px-4 py-3 flex items-center gap-2.5">
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 uppercase tracking-wider shrink-0">
                {demo ? "Demo" : "Test mode"}
              </span>
              <p className="text-[12px] text-[#555555] leading-relaxed">
                {demo
                  ? "Sample data, sign-in bypassed."
                  : "Real test transactions, sign-in bypassed for recording."}{" "}
                Production access is isolated with Auth0 Organizations.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="animate-enter animate-enter-delay-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="surface-1 rounded-[16px] p-4">
              <p className="text-[9px] text-[#6b6b6b] uppercase tracking-wider">Supporters</p>
              <p className="font-mono text-[26px] font-bold text-[#111111] tracking-tight">
                {pledges.length}
              </p>
              <p className="text-[10px] text-[#8a8a8a] mt-0.5">active recurring pledges</p>
            </div>
            <div className="surface-1 rounded-[16px] p-4">
              <p className="text-[9px] text-[#6b6b6b] uppercase tracking-wider">Recurring</p>
              <p className="font-mono text-[26px] font-bold text-[#111111] tracking-tight">
                {usd(mrr)}
              </p>
              <p className="text-[10px] text-[#8a8a8a] mt-0.5">per month · no Tend platform fee</p>
            </div>
            <div className="surface-1 rounded-[16px] p-4">
              <p className="text-[9px] text-[#6b6b6b] uppercase tracking-wider">Machine payments</p>
              <p className="font-mono text-[26px] font-bold text-[#111111] tracking-tight">
                {usd(machineTotal)}
              </p>
              <p className="text-[10px] text-[#8a8a8a] mt-0.5">paid by AI agents over MPP</p>
            </div>
          </div>

          {stripeNote && (
            <p className="mt-3 text-[12px] text-orange-700">{stripeNote}</p>
          )}

          {/* Ledgers */}
          <div className="animate-enter animate-enter-delay-2 mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-1 rounded-[16px] p-5">
              <h2 className="text-[15px] font-semibold text-[#111111] mb-3">Pledges</h2>
              {pledges.length === 0 ? (
                <p className="text-[12px] text-[#8a8a8a]">
                  No pledges yet — the land is patient.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_auto] gap-2 text-[9px] text-[#8a8a8a] uppercase tracking-wider pb-2 border-b border-black/[0.06]">
                    <span>Started</span>
                    <span>Amount</span>
                  </div>
                  {pledges.slice(0, 12).map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-[1fr_auto] gap-2 items-center py-2.5 border-b border-black/[0.05] last:border-0 text-[12px]"
                    >
                      <span className="text-[#555555]">
                        {new Date(p.created * 1000).toLocaleDateString()}
                      </span>
                      <span className="font-mono font-semibold text-[#111111]">
                        {usd(p.amountCents)}/{p.interval}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="surface-1 rounded-[16px] p-5">
              <h2 className="text-[15px] font-semibold text-[#111111] mb-3">
                Machine ledger
              </h2>
              {machine.length === 0 ? (
                <div>
                  <p className="text-[12px] text-[#8a8a8a]">
                    No agent has paid its land tax yet. Point one at:
                  </p>
                  <pre className="mt-3 rounded-[10px] bg-[#0f0f0f] p-3 font-mono text-[10.5px] leading-relaxed text-[#b4b4b4] overflow-x-auto">
                    {`POST /api/mpp/land-tax?tribe=${tribe.id}`}
                  </pre>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[9px] text-[#8a8a8a] uppercase tracking-wider pb-2 border-b border-black/[0.06]">
                    <span>Payer</span>
                    <span>Status</span>
                    <span>Amount</span>
                  </div>
                  {machine.slice(0, 12).map((m) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-2 items-center py-2.5 border-b border-black/[0.05] last:border-0 text-[12px]"
                    >
                      <span className="text-[#555555] truncate">
                        {m.payer ?? new Date(m.created * 1000).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${
                          m.status === "succeeded"
                            ? "bg-green-500/10 text-green-700"
                            : "bg-black/[0.05] text-[#555555]"
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="font-mono font-semibold text-[#111111]">
                        {usd(m.amountCents)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
