/**
 * The machine pays its land tax — MPP demo driver.
 *
 * Creates a funded testnet machine account (first run only), then pays the
 * annual land tax endpoint and prints the receipt.
 *
 *   node scripts/agent-pays.mjs [tribe] [baseUrl]
 *   node scripts/agent-pays.mjs muwekma http://localhost:3100
 */
import { spawnSync } from "node:child_process";

const tribe = process.argv[2] ?? "ramaytush";
const base = process.argv[3] ?? "http://localhost:3100";
const endpoint = `${base}/api/mpp/land-tax?tribe=${tribe}`;

function run(label, args) {
  console.log(`\n━━ ${label}\n   npx ${args.join(" ")}\n`);
  const r = spawnSync("npx", args, { stdio: "inherit" });
  return r.status === 0;
}

console.log(`Tend — an AI agent pays its annual land tax (${tribe})`);

run("Ensure a machine account exists", ["mppx", "account", "create"]);
run("Fund it on the Tempo testnet", ["mppx", "account", "fund", "--network", "testnet"]);

const paid = run("Pay the land tax", ["mppx", endpoint, "--method", "POST"]);

console.log(
  paid
    ? "\n✓ The machine paid its land tax. Check the tribe dashboard and Stripe Payments."
    : "\n✗ Payment did not complete — is `npm run dev` running, and STRIPE_SECRET_KEY set?",
);
