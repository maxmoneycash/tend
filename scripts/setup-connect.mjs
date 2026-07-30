/**
 * Creates two TEST-MODE Stripe Connect accounts — one per tribe tenant —
 * prefilled with Stripe's test magic values so charges enable without
 * manual onboarding. Prints the env lines to paste into .env.local.
 *
 *   node scripts/setup-connect.mjs
 */
import { readFileSync } from "node:fs";
import Stripe from "stripe";

function loadEnv() {
  if (process.env.STRIPE_SECRET_KEY) return;
  for (const file of [".env.local", ".env"]) {
    try {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
      }
    } catch {
      /* file absent is fine */
    }
  }
}
loadEnv();

const key = process.env.STRIPE_SECRET_KEY;
if (!key?.startsWith("sk_test_")) {
  console.error("Set STRIPE_SECRET_KEY to a TEST key (sk_test_...) first.");
  process.exit(1);
}
const stripe = new Stripe(key);

const tribes = [
  {
    env: "TEND_ACCT_RAMAYTUSH",
    name: "Association of Ramaytush Ohlone (test)",
    url: "https://www.ramaytush.org",
  },
  {
    env: "TEND_ACCT_MUWEKMA",
    name: "Muwekma Ohlone Tribe (test)",
    url: "https://muwekma.org",
  },
];

const lines = [];
for (const t of tribes) {
  const account = await stripe.accounts.create({
    type: "custom",
    country: "US",
    email: "test@example.com",
    business_type: "non_profit",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      name: t.name,
      url: t.url,
      mcc: "8398",
      product_description: "Voluntary land tax contributions",
    },
    company: {
      name: t.name,
      tax_id: "000000000",
      phone: "4155551234",
      address: {
        line1: "address_full_match",
        city: "San Francisco",
        state: "CA",
        postal_code: "94102",
        country: "US",
      },
    },
    external_account: {
      object: "bank_account",
      country: "US",
      currency: "usd",
      routing_number: "110000000",
      account_number: "000123456789",
    },
    tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: "8.8.8.8" },
  });

  const fresh = await stripe.accounts.retrieve(account.id);
  console.log(
    `${t.name}\n  ${account.id}  charges_enabled=${fresh.charges_enabled}`,
  );
  if (!fresh.charges_enabled && fresh.requirements?.currently_due?.length) {
    console.log(`  still due: ${fresh.requirements.currently_due.join(", ")}`);
    console.log(
      "  (If charges stay disabled, unset the env line below — Tend falls back to platform mode.)",
    );
  }
  lines.push(`${t.env}=${account.id}`);
}

console.log("\nPaste into .env.local:\n");
console.log(lines.join("\n"));
