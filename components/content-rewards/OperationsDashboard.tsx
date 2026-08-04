"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CreditCard,
  Download,
  ReceiptText,
  Search,
  Users,
} from "lucide-react";
import type { Tribe } from "@/lib/tribes";

export type DashboardPledge = {
  id: string;
  created: number;
  amountCents: number;
  interval: "month" | "year";
  status: string;
};

export type DashboardDonation = {
  id: string;
  created: number;
  amountCents: number;
  cadence: "once" | "month" | "year";
  email?: string;
  paymentStatus: string;
  status: string;
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

function csvCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OperationsDashboard({
  account,
  demo,
  donations,
  machine,
  pledges,
  stripeNote,
  tribe,
}: {
  account?: string;
  demo: boolean;
  donations: DashboardDonation[];
  machine: DashboardMachinePayment[];
  pledges: DashboardPledge[];
  stripeNote: string | null;
  tribe: Tribe;
}) {
  const activePledges = pledges.filter((pledge) =>
    ["active", "trialing"].includes(pledge.status),
  );
  const monthlyTotal = activePledges.reduce((sum, pledge) => sum + monthly(pledge), 0);
  const paidDonations = donations.filter((donation) =>
    ["paid", "no_payment_required"].includes(donation.paymentStatus),
  );
  const processedTotal = paidDonations.reduce(
    (sum, donation) => sum + donation.amountCents,
    0,
  );
  const needsAttention = donations.filter(
    (donation) =>
      donation.status === "expired" ||
      (donation.status === "complete" &&
        !["paid", "no_payment_required"].includes(donation.paymentStatus)),
  ).length;
  const machineTotal = machine
    .filter((payment) => payment.status === "succeeded")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const completedPayments = machine.filter((payment) => payment.status === "succeeded").length;
  const [registerView, setRegisterView] = useState<"donations" | "pledges">("donations");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDonations = useMemo(
    () =>
      donations.filter((donation) =>
        [
          donation.email,
          donation.id,
          donation.cadence,
          donation.paymentStatus,
          donation.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [donations, normalizedQuery],
  );
  const filteredPledges = useMemo(
    () =>
      pledges.filter((pledge) =>
        [pledge.id, pledge.interval, pledge.status].some((value) =>
          String(value).toLowerCase().includes(normalizedQuery),
        ),
      ),
    [normalizedQuery, pledges],
  );
  const visibleCount =
    registerView === "donations" ? filteredDonations.length : filteredPledges.length;

  function exportRegister() {
    if (registerView === "donations") {
      downloadCsv(
        `${tribe.id}-donations.csv`,
        [
          ["Date", "Donor", "Schedule", "Payment status", "Checkout status", "Amount USD", "Stripe reference"],
          ...filteredDonations.map((donation) => [
            new Date(donation.created * 1000).toISOString(),
            donation.email ?? "",
            donation.cadence,
            donation.paymentStatus,
            donation.status,
            (donation.amountCents / 100).toFixed(2),
            donation.id,
          ]),
        ],
      );
      return;
    }

    downloadCsv(
      `${tribe.id}-recurring-pledges.csv`,
      [
        ["Started", "Schedule", "Status", "Amount USD", "Stripe reference"],
        ...filteredPledges.map((pledge) => [
          new Date(pledge.created * 1000).toISOString(),
          pledge.interval,
          pledge.status,
          (pledge.amountCents / 100).toFixed(2),
          pledge.id,
        ]),
      ],
    );
  }

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
          <div className="cr-product-status"><ReceiptText aria-hidden="true" size={12} /> Donation workspace</div>
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
            <span>Processed</span>
            <strong>{money(processedTotal)}</strong>
          </article>
          <article>
            <Users aria-hidden="true" size={18} />
            <span>Donation records</span>
            <strong>{donations.length}</strong>
          </article>
          <article>
            <ReceiptText aria-hidden="true" size={18} />
            <span>Active pledges</span>
            <strong>{activePledges.length}</strong>
          </article>
          <article>
            {needsAttention > 0 ? <AlertCircle aria-hidden="true" size={18} /> : <Check aria-hidden="true" size={18} />}
            <span>{needsAttention > 0 ? "Needs attention" : "Monthly equivalent"}</span>
            <strong>{needsAttention > 0 ? needsAttention : money(monthlyTotal)}</strong>
          </article>
        </div>
      </section>

      {(demo || stripeNote) && (
        <div className="cr-operations-notice" role={stripeNote ? "alert" : "note"}>
          <strong>{stripeNote ? "Stripe unavailable" : "Test workspace"}</strong>
          <span>{stripeNote ?? "Complete a test checkout to populate the donation register."}</span>
        </div>
      )}

      <section className="cr-operations-register cr-operations-register--workspace" aria-labelledby="register-heading">
        <header>
          <div>
            <p>Donor records</p>
            <h2 id="register-heading">Giving register</h2>
          </div>
          <span>{donations.length} gifts · {activePledges.length} active pledges</span>
        </header>

        <div className="cr-operations-controls">
          <div className="cr-operations-tabs" role="group" aria-label="Giving register view">
            <button
              aria-pressed={registerView === "donations"}
              onClick={() => setRegisterView("donations")}
              type="button"
            >
              Donations <span>{donations.length}</span>
            </button>
            <button
              aria-pressed={registerView === "pledges"}
              onClick={() => setRegisterView("pledges")}
              type="button"
            >
              Recurring <span>{activePledges.length}</span>
            </button>
          </div>

          <label className="cr-operations-search">
            <span>Search records</span>
            <i>
              <Search aria-hidden="true" size={15} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Email or Stripe reference"
                type="search"
                value={query}
              />
            </i>
          </label>

          <button
            className="cr-operations-export"
            disabled={visibleCount === 0}
            onClick={exportRegister}
            type="button"
          >
            <Download aria-hidden="true" size={15} />
            Export CSV
          </button>
        </div>

        {registerView === "donations" ? (
          <div id="donations-panel">
            {donations.length === 0 ? (
              <div className="cr-operations-empty">
                <ReceiptText aria-hidden="true" size={20} />
                <strong>No donations yet</strong>
                <span>Complete a test checkout to create the first donor record.</span>
                <Link href={`/programs/${tribe.id}#donate`}>Open donation page</Link>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="cr-operations-empty">
                <Search aria-hidden="true" size={20} />
                <strong>No matching donations</strong>
                <span>Search by donor email, status, schedule, or Stripe reference.</span>
                <button onClick={() => setQuery("")} type="button">Clear search</button>
              </div>
            ) : (
              <div className="cr-operations-table cr-operations-table--donations" role="table" aria-label="Donation records">
                <div className="cr-operations-table-head" role="row">
                  <span role="columnheader">Date</span><span role="columnheader">Donor</span><span role="columnheader">Schedule</span><span role="columnheader">Status</span><span role="columnheader">Amount</span>
                </div>
                {filteredDonations.slice(0, 20).map((donation) => (
                  <div className="cr-operations-table-row" role="row" key={donation.id}>
                    <span data-label="Date" role="cell">{new Date(donation.created * 1000).toLocaleDateString()}</span>
                    <span data-label="Donor" role="cell">{donation.email ?? "Email unavailable"}</span>
                    <span data-label="Schedule" role="cell">{donation.cadence === "once" ? "One time" : donation.cadence === "month" ? "Monthly" : "Yearly"}</span>
                    <span data-label="Status" role="cell"><i data-status={donation.paymentStatus}>{donation.paymentStatus.replaceAll("_", " ")}</i></span>
                    <strong data-label="Amount" role="cell">{money(donation.amountCents)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div id="pledges-panel">
            {pledges.length === 0 ? (
              <div className="cr-operations-empty">
                <CreditCard aria-hidden="true" size={20} />
                <strong>No recurring pledges yet</strong>
                <span>Complete a monthly or yearly test checkout to create one.</span>
                <Link href={`/programs/${tribe.id}#donate`}>Open donation page</Link>
              </div>
            ) : filteredPledges.length === 0 ? (
              <div className="cr-operations-empty">
                <Search aria-hidden="true" size={20} />
                <strong>No matching pledges</strong>
                <span>Search by status, schedule, or Stripe reference.</span>
                <button onClick={() => setQuery("")} type="button">Clear search</button>
              </div>
            ) : (
              <div className="cr-operations-table cr-operations-table--pledges" role="table" aria-label="Recurring pledges">
                <div className="cr-operations-table-head" role="row">
                  <span role="columnheader">Started</span><span role="columnheader">Reference</span><span role="columnheader">Cadence</span><span role="columnheader">Status</span><span role="columnheader">Amount</span>
                </div>
                {filteredPledges.slice(0, 20).map((pledge) => (
                  <div className="cr-operations-table-row" role="row" key={pledge.id}>
                    <span data-label="Started" role="cell">{new Date(pledge.created * 1000).toLocaleDateString()}</span>
                    <span data-label="Reference" role="cell"><code>{pledge.id.slice(0, 14)}…</code></span>
                    <span data-label="Cadence" role="cell">{pledge.interval === "month" ? "Monthly" : "Yearly"}</span>
                    <span data-label="Status" role="cell"><i data-status={pledge.status}>{pledge.status}</i></span>
                    <strong data-label="Amount" role="cell">{money(pledge.amountCents)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <details className="cr-operations-technical">
        <summary>Machine-payment activity</summary>
        <div>
          <span>{machine.length} records · {money(machineTotal)} completed · {completedPayments} receipts</span>
          <code>POST /api/mpp/land-tax?tribe={tribe.id}</code>
        </div>
      </details>
    </main>
  );
}
