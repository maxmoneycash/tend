import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, CreditCard, Radio, ReceiptText } from "lucide-react";
import type { Tribe } from "@/lib/tribes";

export type DashboardPledge = {
  id: string;
  created: number;
  amountCents: number;
  interval: "month" | "year";
};

export type DashboardMachinePayment = {
  id: string;
  created: number;
  amountCents: number;
  status: string;
  payer?: string;
};

function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function monthly(row: DashboardPledge): number {
  return row.interval === "year" ? Math.round(row.amountCents / 12) : row.amountCents;
}

export function OperationsDashboard({
  account,
  demo,
  machine,
  pledges,
  stripeNote,
  tribe,
}: {
  account?: string;
  demo: boolean;
  machine: DashboardMachinePayment[];
  pledges: DashboardPledge[];
  stripeNote: string | null;
  tribe: Tribe;
}) {
  const monthlyTotal = pledges.reduce((sum, pledge) => sum + monthly(pledge), 0);
  const machineTotal = machine
    .filter((payment) => payment.status === "succeeded")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const completedPayments = machine.filter((payment) => payment.status === "succeeded").length;

  return (
    <main className="cr-product-shell cr-operations-dashboard">
      <header className="cr-operations-campaign">
        <div className="cr-operations-campaign-media">
          <Image
            alt=""
            fill
            priority
            sizes="(min-width: 48rem) 12rem, 6rem"
            src={`/videos/${tribe.id}-poster.jpg`}
          />
        </div>
        <div className="cr-operations-campaign-copy">
          <div className="cr-product-status"><Radio aria-hidden="true" size={12} /> Test workspace</div>
          <h1>{tribe.taxName}</h1>
          <p>{tribe.name}</p>
        </div>
        <Link className="cr-product-secondary" href={`/programs/${tribe.id}`}>
          Open public page <ArrowUpRight aria-hidden="true" size={14} />
        </Link>
      </header>

      <section className="cr-operations-overview" aria-labelledby="overview-title">
        <div className="cr-operations-overview-head">
          <div>
            <p>Program overview</p>
            <h2 id="overview-title">Donation activity</h2>
          </div>
          <span>{demo ? "Demo data off" : account ? "Stripe connected" : "Platform test account"}</span>
        </div>

        <div className="cr-operations-stats">
          <article>
            <CreditCard aria-hidden="true" size={18} />
            <span>Active pledges</span>
            <strong>{pledges.length}</strong>
          </article>
          <article>
            <Radio aria-hidden="true" size={18} />
            <span>Monthly equivalent</span>
            <strong>{money(monthlyTotal)}</strong>
          </article>
          <article>
            <ReceiptText aria-hidden="true" size={18} />
            <span>Machine payments</span>
            <strong>{money(machineTotal)}</strong>
          </article>
          <article>
            <Check aria-hidden="true" size={18} />
            <span>Completed receipts</span>
            <strong>{completedPayments}</strong>
          </article>
        </div>
      </section>

      {(demo || stripeNote) && (
        <div className="cr-operations-notice" role={stripeNote ? "alert" : "note"}>
          <strong>{stripeNote ? "Stripe unavailable" : "No fabricated activity"}</strong>
          <span>{stripeNote ?? "Connect test data or complete a test checkout to populate this workspace."}</span>
        </div>
      )}

      <section className="cr-operations-register" aria-labelledby="pledges-heading">
        <header>
          <div>
            <p>Stripe</p>
            <h2 id="pledges-heading">Recurring pledges</h2>
          </div>
          <span>{pledges.length} active</span>
        </header>
        {pledges.length === 0 ? (
          <div className="cr-operations-empty">
            <CreditCard aria-hidden="true" size={20} />
            <strong>No test subscriptions yet</strong>
            <span>A completed monthly or yearly checkout will appear here.</span>
          </div>
        ) : (
          <div className="cr-operations-table" role="table" aria-label="Recurring pledges">
            <div className="cr-operations-table-head" role="row">
              <span role="columnheader">Started</span><span role="columnheader">Reference</span><span role="columnheader">Cadence</span><span role="columnheader">Amount</span>
            </div>
            {pledges.slice(0, 12).map((pledge) => (
              <div className="cr-operations-table-row" role="row" key={pledge.id}>
                <span data-label="Started" role="cell">{new Date(pledge.created * 1000).toLocaleDateString()}</span>
                <span data-label="Reference" role="cell"><code>{pledge.id.slice(0, 14)}…</code></span>
                <span data-label="Cadence" role="cell">{pledge.interval === "month" ? "Monthly" : "Yearly"}</span>
                <strong data-label="Amount" role="cell">{money(pledge.amountCents)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="cr-operations-register" aria-labelledby="machine-heading">
        <header>
          <div>
            <p>MPP</p>
            <h2 id="machine-heading">Machine payments</h2>
          </div>
          <span>{machine.length} recorded</span>
        </header>
        {machine.length === 0 ? (
          <div className="cr-operations-empty cr-operations-empty--code">
            <ReceiptText aria-hidden="true" size={20} />
            <strong>No machine payments yet</strong>
            <code>POST /api/mpp/land-tax?tribe={tribe.id}</code>
          </div>
        ) : (
          <div className="cr-operations-table" role="table" aria-label="Machine payments">
            <div className="cr-operations-table-head" role="row">
              <span role="columnheader">Date</span><span role="columnheader">Payer</span><span role="columnheader">Status</span><span role="columnheader">Amount</span>
            </div>
            {machine.slice(0, 12).map((payment) => (
              <div className="cr-operations-table-row" role="row" key={payment.id}>
                <span data-label="Date" role="cell">{new Date(payment.created * 1000).toLocaleDateString()}</span>
                <span data-label="Payer" role="cell"><code>{payment.payer ?? `${payment.id.slice(0, 14)}…`}</code></span>
                <span data-label="Status" role="cell"><i data-status={payment.status}>{payment.status}</i></span>
                <strong data-label="Amount" role="cell">{money(payment.amountCents)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
