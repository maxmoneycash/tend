import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const stripeModule = new URL("../lib/stripe.ts", import.meta.url).href;
const webhookRoute = await readFile(
  new URL("../app/api/stripe/webhook/route.ts", import.meta.url),
  "utf8",
);
const getters = ["getStripe", "getStripePreview"];
const acceptedPrefixes = ["sk_test_", "rk_test_", "rkcs_test_"];
const rejectedKeys = [
  ["sk", "live", "tend", "synthetic"].join("_"),
  ["rk", "live", "tend", "synthetic"].join("_"),
  "not_a_stripe_key",
];

function probe(getter, key) {
  const source = `
    const { ${getter} } = await import(${JSON.stringify(stripeModule)});
    try {
      ${getter}();
      process.stdout.write("accepted");
    } catch (error) {
      process.stdout.write(
        error instanceof Error ? \`rejected: \${error.message}\` : "rejected",
      );
    }
  `;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", source],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, STRIPE_SECRET_KEY: key },
    },
  );
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

for (const getter of getters) {
  for (const prefix of acceptedPrefixes) {
    assert.equal(
      probe(getter, `${prefix}tend_synthetic`),
      "accepted",
      `${getter} must accept ${prefix} credentials.`,
    );
  }
  for (const key of rejectedKeys) {
    assert.equal(
      probe(getter, key),
      "rejected: STRIPE_SECRET_KEY must use a Stripe test-mode key.",
      `${getter} must reject non-test credentials.`,
    );
  }
}

const signatureVerification = webhookRoute.indexOf(
  "event = getStripe().webhooks.constructEvent",
);
const liveEventGuard = webhookRoute.indexOf("if (event.livemode)");
const eventClaim = webhookRoute.indexOf("processStripeEventOnce(");
const tempoStart = webhookRoute.indexOf(
  "after(() => maybeStartTempoSettlement(sessionId))",
);
assert.ok(signatureVerification >= 0, "The webhook must verify its signature.");
assert.ok(
  signatureVerification < liveEventGuard && liveEventGuard < eventClaim,
  "Live events must stop after signature verification and before payment writes.",
);
assert.ok(
  liveEventGuard < tempoStart,
  "Live events must stop before Tempo settlement work is scheduled.",
);

console.log("Stripe test-only key boundary checks passed.");
