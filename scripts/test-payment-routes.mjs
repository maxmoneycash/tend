import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { DatabaseSync } from "node:sqlite";
import Stripe from "stripe";

async function availablePort() {
  const probe = createServer();
  const port = await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not reserve a payment test port."));
        return;
      }
      resolve(address.port);
    });
  });
  await new Promise((resolve, reject) => {
    probe.close((error) => (error ? reject(error) : resolve()));
  });
  return port;
}

const port = await availablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const webhookSecret = "whsec_tend_route_test";
const requestTimeoutMs = 60_000;
const startupTimeoutMs = 120_000;
const stateDir = await mkdtemp(path.join(tmpdir(), "tend-payment-routes-"));
const dbPath = path.join(stateDir, "payments.sqlite");
let server = null;
let serverOutput = "";

const serverEnv = {
  ...process.env,
  APP_BASE_URL: baseUrl,
  AUTH0_CLIENT_ID: "tend_payment_route_test",
  AUTH0_CLIENT_SECRET: "tend_payment_route_test",
  AUTH0_DOMAIN: "auth.tend.invalid",
  AUTH0_SECRET: "0".repeat(64),
  STRIPE_SECRET_KEY: "sk_test_tend_route_test",
  STRIPE_WEBHOOK_SECRET: webhookSecret,
  TEND_DEMO_AUTH_BYPASS: "1",
  TEND_DEMO: "1",
  TEND_PAYMENT_DB_PATH: dbPath,
};
delete serverEnv.TEND_ACCT_MUWEKMA;
delete serverEnv.TEND_ACCT_RAMAYTUSH;
delete serverEnv.TEND_CONNECT_DESTINATION_CHARGES;

function rememberOutput(chunk) {
  serverOutput = `${serverOutput}${chunk}`.slice(-12_000);
}

async function startServer() {
  serverOutput = "";
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--webpack",
      "--hostname",
      "127.0.0.1",
      "-p",
      String(port),
    ],
    {
      cwd: process.cwd(),
      env: serverEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", rememberOutput);
  server.stderr.on("data", rememberOutput);

  const deadline = Date.now() + startupTimeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited during startup:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/stripe/connect/onboard`, {
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for Next.js:\n${serverOutput}`);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGTERM");
  await Promise.race([
    exited,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Next.js did not stop")), 10_000),
    ),
  ]);
  server = null;
}

async function json(pathname, init) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const body = await response.json();
  return { body, status: response.status };
}

function checkoutSession(id, paymentStatus, tempoStream = false) {
  return {
    id,
    object: "checkout.session",
    amount_total: 2500,
    currency: "usd",
    metadata: {
      interval: "once",
      source: "tend",
      stream_duration_seconds: "10",
      stream_interval_seconds: "2",
      tempo_stream: String(tempoStream),
      tribe: "ramaytush",
    },
    mode: "payment",
    payment_status: paymentStatus,
  };
}

function stripeEvent(id, type, session, livemode = false) {
  return JSON.stringify({
    id,
    object: "event",
    api_version: "2026-07-29.dahlia",
    created: 1_785_000_000,
    data: { object: session },
    livemode,
    pending_webhooks: 1,
    request: null,
    type,
  });
}

function paymentRows(eventId, sessionId) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return {
      contribution: Boolean(
        db
          .prepare("SELECT 1 FROM contributions WHERE session_id = ?")
          .get(sessionId),
      ),
      event: Boolean(
        db.prepare("SELECT 1 FROM stripe_events WHERE id = ?").get(eventId),
      ),
    };
  } finally {
    db.close();
  }
}

function signedWebhook(payload) {
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": Stripe.webhooks.generateTestHeaderString({
        payload,
        secret: webhookSecret,
      }),
    },
    body: payload,
  };
}

try {
  console.log("Starting payment route server (pass 1).");
  await startServer();

  console.log("Checking Connect, checkout, and display-only receipt guards.");
  const status = await json("/api/stripe/connect/onboard");
  assert.equal(status.status, 200);
  assert.deepEqual(status.body, {
    destinationCharges: false,
    testMode: true,
  });

  const invalidCheckout = await json("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(invalidCheckout.status, 400);

  const canonicalCheckout = await fetch(`${baseUrl}/api/checkout`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-host": "attacker.example",
      "x-forwarded-proto": "https",
    },
    body: JSON.stringify({
      tribeId: "ramaytush",
      amountCents: 2500,
      interval: "once",
    }),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  assert.equal(canonicalCheckout.status, 200);
  assert.equal(
    (await canonicalCheckout.json()).url,
    `${baseUrl}/thanks?tribe=ramaytush&demo=1&amount=2500`,
  );

  const disabledOnboarding = await json("/api/stripe/connect/onboard", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tribeId: "ramaytush" }),
  });
  assert.equal(disabledOnboarding.status, 503);

  const invalidReceipt = await json(
    "/api/tempo/stream?sessionId=not-a-session",
  );
  assert.equal(invalidReceipt.status, 400);

  const unknownReceipt = await json(
    "/api/tempo/stream?sessionId=cs_unknown_route_test",
  );
  assert.deepEqual(unknownReceipt, {
    body: { status: "awaiting-confirmation", events: [] },
    status: 200,
  });

  const displayOnly = await fetch(`${baseUrl}/api/tempo/stream`, {
    method: "POST",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  assert.equal(displayOnly.status, 405);

  const unsigned = await json("/api/stripe/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(unsigned.status, 400);

  console.log("Checking the signed live-event boundary.");
  const liveEventId = "evt_route_live_rejected";
  const liveSessionId = "cs_route_live_rejected";
  const livePayload = stripeEvent(
    liveEventId,
    "checkout.session.completed",
    checkoutSession(liveSessionId, "paid", true),
    true,
  );
  const liveResult = await json(
    "/api/stripe/webhook",
    signedWebhook(livePayload),
  );
  assert.deepEqual(liveResult, {
    body: { error: "Live Stripe events are not accepted." },
    status: 400,
  });
  assert.deepEqual(paymentRows(liveEventId, liveSessionId), {
    contribution: false,
    event: false,
  });
  assert.deepEqual(
    await json(`/api/tempo/stream?sessionId=${liveSessionId}`),
    {
      body: { status: "awaiting-confirmation", events: [] },
      status: 200,
    },
  );

  console.log("Checking signed webhook idempotency and payment state.");
  const paidPayload = stripeEvent(
    "evt_route_paid",
    "checkout.session.completed",
    checkoutSession("cs_route_paid", "paid"),
  );
  const firstPaid = await json(
    "/api/stripe/webhook",
    signedWebhook(paidPayload),
  );
  assert.deepEqual(firstPaid, {
    body: { received: true, duplicate: false },
    status: 200,
  });

  const duplicatePaid = await json(
    "/api/stripe/webhook",
    signedWebhook(paidPayload),
  );
  assert.deepEqual(duplicatePaid, {
    body: { received: true, duplicate: true },
    status: 200,
  });

  const failedSession = checkoutSession("cs_route_failed", "unpaid");
  const failedPayload = stripeEvent(
    "evt_route_async_failed",
    "checkout.session.async_payment_failed",
    failedSession,
  );
  const failedResult = await json(
    "/api/stripe/webhook",
    signedWebhook(failedPayload),
  );
  assert.equal(failedResult.status, 200);

  const lateCompletedPayload = stripeEvent(
    "evt_route_completed_late",
    "checkout.session.completed",
    failedSession,
  );
  const lateCompleted = await json(
    "/api/stripe/webhook",
    signedWebhook(lateCompletedPayload),
  );
  assert.equal(lateCompleted.status, 200);

  const failedReceipt = await json(
    "/api/tempo/stream?sessionId=cs_route_failed",
  );
  assert.deepEqual(failedReceipt, {
    body: { status: "payment-failed", events: [] },
    status: 200,
  });

  console.log("Restarting with the same SQLite database.");
  await stopServer();
  delete serverEnv.TEND_DEMO;
  serverEnv.TEND_CONNECT_DESTINATION_CHARGES = "1";
  await startServer();

  const incompleteDestinationCheckout = await json("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tribeId: "ramaytush",
      amountCents: 2500,
      interval: "once",
    }),
  });
  assert.equal(incompleteDestinationCheckout.status, 503);

  console.log("Checking durable replay detection after restart.");
  const duplicateAfterRestart = await json(
    "/api/stripe/webhook",
    signedWebhook(paidPayload),
  );
  assert.deepEqual(duplicateAfterRestart, {
    body: { received: true, duplicate: true },
    status: 200,
  });

  console.log("Payment route tests passed.");
} catch (error) {
  console.error(serverOutput);
  throw error;
} finally {
  await stopServer();
  await rm(stateDir, { recursive: true, force: true });
}
