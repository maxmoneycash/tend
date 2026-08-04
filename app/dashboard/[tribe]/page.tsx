import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { Navbar } from "@/components/layout/Navbar";
import { OperationsDashboard } from "@/components/content-rewards/OperationsDashboard";
import { auth0 } from "@/lib/auth0";
import { canAccessTribe } from "@/lib/access";
import { readAuthorizedDashboardData } from "@/lib/dashboard-access";
import { demoMode } from "@/lib/demo";
import { getStripe } from "@/lib/stripe";
import { getTribe, getTribeAccount, type TribeId } from "@/lib/tribes";
import "@/styles/content-rewards-product.css";

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

export default async function TribeDashboard({
  params,
}: {
  params: Promise<{ tribe: string }>;
}) {
  const { tribe: tribeParam } = await params;
  const tribe = getTribe(tribeParam);
  if (!tribe) redirect("/dashboard");

  const session = await auth0.getSession();
  const access = await readAuthorizedDashboardData(
    session?.user,
    (user) => canAccessTribe(user, tribe.id as TribeId),
    async () => {
      const demo = demoMode();
      const account = getTribeAccount(tribe.id as TribeId);
      let pledges: PledgeRow[] = [];
      let machine: MachineRow[] = [];
      let stripeNote: string | null = null;

      if (!demo) {
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
                item?.price?.recurring?.interval === "year"
                  ? "year"
                  : "month",
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
          stripeNote = `Stripe is unavailable (${(err as Error).message}). Check STRIPE_SECRET_KEY.`;
        }
      }

      return { account, demo, machine, pledges, stripeNote };
    },
  );

  if (access.status === "signed-out") {
    redirect(`/auth/login?returnTo=/dashboard/${tribe.id}`);
  }

  if (access.status === "forbidden") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div style={{ paddingTop: "108px" }} />
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111111] tracking-[-0.02em]">
            Not your tenant
          </h1>
          <p className="mt-3 text-[13px] text-[#555555] max-w-lg leading-relaxed">
            {access.user.email} isn&apos;t on the {tribe.name} admin list. The
            current Auth0 and environment settings do not grant access to this
            test tenant.
          </p>
        </div>
      </div>
    );
  }

  const { account, demo, machine, pledges, stripeNote } = access.data;

  return (
    <div className="cr-product-page min-h-screen pb-24 md:pb-0">
      <Navbar />
      <div className="cr-product-nav-spacer" />
      <OperationsDashboard account={account} demo={demo} machine={machine} pledges={pledges} stripeNote={stripeNote} tribe={tribe} />
    </div>
  );
}
