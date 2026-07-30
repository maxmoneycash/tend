/**
 * Demo mode: when TEND_DEMO=1 (or Stripe is unconfigured), dashboards render
 * believable sample data and skip the Auth0 gate, clearly badged — so the
 * whole product is walkable with zero credentials. Modeled on Lightyear's
 * replay-a-real-session demo pattern.
 */

export function demoMode(): boolean {
  return process.env.TEND_DEMO === "1" || !process.env.STRIPE_SECRET_KEY;
}

const DAY = 86_400;
const now = () => Math.floor(Date.now() / 1000);

export type DemoPledge = {
  id: string;
  created: number;
  amountCents: number;
  interval: "month" | "year";
};

export type DemoMachinePayment = {
  id: string;
  created: number;
  amountCents: number;
  status: string;
  payer: string;
};

export function demoPledges(): DemoPledge[] {
  const t = now();
  const rows: [number, number, "month" | "year"][] = [
    [1, 2500, "month"],
    [2, 5000, "month"],
    [4, 1000, "month"],
    [6, 25000, "year"],
    [9, 2500, "month"],
    [12, 10000, "month"],
    [15, 2500, "month"],
    [19, 50000, "year"],
    [23, 1500, "month"],
    [26, 2500, "month"],
    [31, 5000, "month"],
    [38, 2500, "month"],
  ];
  return rows.map(([daysAgo, amountCents, interval], i) => ({
    id: `demo_sub_${i}`,
    created: t - daysAgo * DAY,
    amountCents,
    interval,
  }));
}

export function demoMachinePayments(): DemoMachinePayment[] {
  const t = now();
  const rows: [number, string, string][] = [
    [2, "succeeded", "ci-runner @ acme-robotics"],
    [5, "succeeded", "ops-agent @ southbay.dev"],
    [11, "succeeded", "fleet-7 @ mission-labs"],
    [17, "succeeded", "deploy-bot @ presidio.ai"],
    [24, "succeeded", "assistant @ personal"],
    [33, "succeeded", "ci-runner @ fogline"],
    [41, "succeeded", "agent-3 @ tuyshtak.io"],
  ];
  return rows.map(([daysAgo, status, payer], i) => ({
    id: `demo_pi_${i}`,
    created: t - daysAgo * DAY,
    amountCents: 2500,
    status,
    payer,
  }));
}
