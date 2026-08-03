import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readAuthorizedDashboardData } from "../lib/dashboard-access.ts";
import { demoAuthBypass } from "../lib/demo.ts";

const [dashboardIndex, tribeDashboard] = await Promise.all([
  readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
  readFile(
    new URL("../app/dashboard/[tribe]/page.tsx", import.meta.url),
    "utf8",
  ),
]);

const dashboardSources = `${dashboardIndex}\n${tribeDashboard}`;
assert.doesNotMatch(
  dashboardSources,
  /TEND_DEMO_AUTH_BYPASS|authBypass/,
  "Dashboard pages must not bypass Auth0 or tenant access.",
);
assert.match(
  dashboardIndex,
  /const session = await auth0\.getSession\(\);[\s\S]*?if \(!session\) redirect\("\/auth\/login\?returnTo=\/dashboard"\);/,
  "The dashboard index must require an Auth0 session.",
);

const sessionGate = tribeDashboard.indexOf("await auth0.getSession()");
const accessGate = tribeDashboard.indexOf("readAuthorizedDashboardData(");
const stripeClient = tribeDashboard.indexOf("const stripe = getStripe()");
const subscriptionRead = tribeDashboard.indexOf("stripe.subscriptions.list(");
const paymentIntentRead = tribeDashboard.indexOf(
  "stripe.paymentIntents.list(",
);

assert.ok(sessionGate >= 0, "The tenant dashboard must read the Auth0 session.");
assert.ok(
  sessionGate < accessGate,
  "The tenant dashboard must read Auth0 before checking tenant access.",
);
assert.ok(
  accessGate < stripeClient &&
    stripeClient < subscriptionRead &&
    subscriptionRead < paymentIntentRead,
  "Both Stripe reads must remain inside the authorized dashboard callback.",
);
assert.match(
  tribeDashboard.slice(accessGate, stripeClient),
  /canAccessTribe\(user, tribe\.id as TribeId\)[\s\S]*?async \(\) => \{/,
  "The Stripe callback must follow the tenant access check.",
);

let stripeReads = 0;
const readStripe = async () => {
  stripeReads += 1;
  return "stripe data";
};

const loggedOut = await readAuthorizedDashboardData(
  null,
  () => true,
  readStripe,
);
assert.equal(loggedOut.status, "signed-out");
assert.equal(stripeReads, 0, "Logged-out requests must make zero Stripe reads.");

const wrongTenant = await readAuthorizedDashboardData(
  { email: "other@example.com" },
  () => false,
  readStripe,
);
assert.equal(wrongTenant.status, "forbidden");
assert.equal(stripeReads, 0, "Wrong-tenant requests must make zero Stripe reads.");

const previousBypass = process.env.TEND_DEMO_AUTH_BYPASS;
const previousNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
process.env.TEND_DEMO_AUTH_BYPASS = "1";
try {
  const productionBypass = await readAuthorizedDashboardData(
    null,
    () => true,
    readStripe,
  );
  assert.equal(productionBypass.status, "signed-out");
  assert.equal(
    stripeReads,
    0,
    "The retired production bypass flag must make zero Stripe reads.",
  );
} finally {
  if (previousBypass === undefined) {
    delete process.env.TEND_DEMO_AUTH_BYPASS;
  } else {
    process.env.TEND_DEMO_AUTH_BYPASS = previousBypass;
  }
  if (previousNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnv;
  }
}

// The sign-in bypass exists so the flow can be walked while recording
// locally. This repository is public, so a fork that copied an env file — or a
// variable pasted into a project's settings — must not be able to open
// checkout and Stripe Connect onboarding to anyone with the URL.
{
  const previousVercel = process.env.VERCEL;
  const previousBypassFlag = process.env.TEND_DEMO_AUTH_BYPASS;
  process.env.TEND_DEMO_AUTH_BYPASS = "1";
  try {
    process.env.VERCEL = "1";
    assert.equal(
      demoAuthBypass(),
      false,
      "The sign-in bypass must be refused on a deployment even when the flag is set.",
    );
    delete process.env.VERCEL;
    assert.equal(
      demoAuthBypass(),
      true,
      "The bypass still works locally, which is the only place it is meant to.",
    );
  } finally {
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousBypassFlag === undefined) delete process.env.TEND_DEMO_AUTH_BYPASS;
    else process.env.TEND_DEMO_AUTH_BYPASS = previousBypassFlag;
  }
}

// Every guarded surface must go through the helper, so hardening it once
// covers all of them.
const guardedRoutes = await Promise.all(
  [
    "../app/api/checkout/route.ts",
    "../app/api/stripe/connect/onboard/route.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
);
for (const source of guardedRoutes) {
  assert.match(
    source,
    /!demoAuthBypass\(\)/,
    "Guarded routes must ask demoAuthBypass(), not read the raw variable.",
  );
  assert.doesNotMatch(
    source,
    /process\.env\.TEND_DEMO_AUTH_BYPASS/,
    "A route reading the raw variable would skip the deployment refusal.",
  );
}

const authorized = await readAuthorizedDashboardData(
  { email: "admin@example.com" },
  () => true,
  readStripe,
);
assert.deepEqual(authorized, {
  status: "authorized",
  data: "stripe data",
  user: { email: "admin@example.com" },
});
assert.equal(stripeReads, 1, "Authorized requests may read Stripe once.");

console.log(
  "Dashboard access checks passed: logged-out, wrong-tenant, and retired-bypass cases made zero Stripe reads, and the sign-in bypass is refused on a deployment.",
);
