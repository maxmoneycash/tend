import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { join } from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const ROOT = process.cwd();
const SESSION = `tend-donation-${process.pid}`;
const RECEIPT_ROUTE = "**/api/tempo/stream?*";
let port;
let baseUrl;

loadEnvConfig(ROOT);
assert.match(
  process.env.STRIPE_SECRET_KEY ?? "",
  /^sk_test_/,
  "STRIPE_SECRET_KEY must be a Stripe test-mode key (sk_test_…).",
);

const agentEnvironment = Object.fromEntries(
  [
    "HOME",
    "LANG",
    "LC_ALL",
    "LOGNAME",
    "PATH",
    "SHELL",
    "TMPDIR",
    "USER",
    "XDG_CACHE_HOME",
    "XDG_CONFIG_HOME",
  ].flatMap((key) => {
    const value = process.env[key];
    return value ? [[key, value]] : [];
  }),
);
Object.assign(agentEnvironment, {
  AGENT_BROWSER_DEFAULT_TIMEOUT: "45000",
  AGENT_BROWSER_IDLE_TIMEOUT_MS: "60000",
  AGENT_BROWSER_NAMESPACE: SESSION,
});
let devServer;
let serverLog = "";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 10 * 1024 * 1024,
    timeout: options.timeout ?? 60_000,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed:\n${output}`);
  }

  return result.stdout.trim();
}

function agentBrowser(args) {
  const output = run(
    "agent-browser",
    ["--session", SESSION, "--json", ...args],
    { env: agentEnvironment },
  );
  const result = JSON.parse(output);

  if (!result.success) {
    throw new Error(result.error ?? `agent-browser ${args[0]} failed`);
  }

  return result.data;
}

function browserEval(source) {
  const encoded = Buffer.from(source).toString("base64");
  return agentBrowser(["eval", "--base64", encoded]).result;
}

function assertInBrowser(source, message) {
  assert.equal(browserEval(`Boolean(${source})`), true, message);
}

function setReceiptResponse(body) {
  agentBrowser(["network", "unroute", RECEIPT_ROUTE]);
  agentBrowser([
    "network",
    "route",
    RECEIPT_ROUTE,
    "--body",
    JSON.stringify(body),
  ]);
}

function collectRequests(value, requests = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectRequests(item, requests);
  } else if (value && typeof value === "object") {
    if (typeof value.method === "string" && typeof value.url === "string") {
      requests.push(value);
    }
    for (const item of Object.values(value)) collectRequests(item, requests);
  }
  return requests;
}

async function serverIsReady() {
  try {
    const response = await fetch(`${baseUrl}/programs`, {
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function choosePort() {
  const requested = Number(process.env.TEND_E2E_PORT);
  if (
    process.env.TEND_E2E_PORT &&
    (!Number.isInteger(requested) || requested < 1 || requested > 65_535)
  ) {
    throw new Error("TEND_E2E_PORT must be an integer from 1 to 65535.");
  }
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () => {
      reject(
        new Error(
          process.env.TEND_E2E_PORT
            ? `TEND_E2E_PORT ${requested} is already in use.`
            : "Could not reserve a local port for Tend.",
        ),
      );
    });
    probe.listen(requested || 0, "127.0.0.1", () => {
      const address = probe.address();
      const selected = typeof address === "object" && address
        ? address.port
        : null;
      probe.close((error) => {
        if (error || selected === null) {
          reject(error ?? new Error("Could not read the reserved port."));
        } else {
          resolve(selected);
        }
      });
    });
  });
}

async function startDevServer() {
  port = await choosePort();
  baseUrl = `http://localhost:${port}`;
  const nextBin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
  devServer = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
    cwd: ROOT,
    env: {
      ...process.env,
      APP_BASE_URL: baseUrl,
      TEND_ACCT_MUWEKMA: "",
      TEND_ACCT_RAMAYTUSH: "",
      TEND_CONNECT_DESTINATION_CHARGES: "0",
      TEND_DEMO: "0",
      TEND_DEMO_AUTH_BYPASS: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const stream of [devServer.stdout, devServer.stderr]) {
    stream.on("data", (chunk) => {
      serverLog = `${serverLog}${chunk}`.slice(-40_000);
    });
  }

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (devServer.exitCode !== null) {
      throw new Error(`Next.js exited before it was ready:\n${serverLog}`);
    }
    if (await serverIsReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Next.js did not start within 120 seconds:\n${serverLog}`);
}

async function stopDevServer() {
  if (!devServer || devServer.exitCode !== null) return;
  devServer.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => devServer.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (devServer.exitCode === null) devServer.kill("SIGKILL");
  if (devServer.exitCode === null) {
    await new Promise((resolve) => devServer.once("exit", resolve));
  }
}

async function checkDonationJourney() {
  const version = run("agent-browser", ["--version"]);
  assert.equal(version, "agent-browser 0.33.1");
  console.log(`✓ ${version}`);

  await startDevServer();
  agentBrowser(["open"]);
  agentBrowser(["set", "viewport", "390", "844"]);
  agentBrowser(["navigate", baseUrl]);
  agentBrowser(["wait", "--url", "**/programs"]);
  assert.deepEqual(browserEval("[window.innerWidth, window.innerHeight]"), [390, 844]);
  assertInBrowser(
    `location.pathname === "/programs" &&
      document.querySelector("h1")?.textContent?.includes("Indigenous-led contribution programs") &&
      document.documentElement.scrollWidth <= window.innerWidth`,
    "The Programs page must load at 390px without horizontal overflow.",
  );
  console.log("✓ root opens Programs at 390×844 without horizontal overflow");

  assertInBrowser(
    `(() => {
      const link = document.querySelector('a[href="/programs/ramaytush"]');
      return Boolean(link && link.textContent?.includes("Yunakin"));
    })()`,
    "Programs must link to the Ramaytush Yunakin detail.",
  );
  agentBrowser(["click", 'a[href="/programs/ramaytush"]']);
  agentBrowser(["wait", "--url", "**/programs/ramaytush"]);
  agentBrowser(["wait", "section.pledge-payment-panel"]);
  assertInBrowser(
    `(() => {
      const panel = document.querySelector("section.pledge-payment-panel");
      const button = panel?.querySelector("button.pledge-checkout-button");
      const official = document.querySelector(
        'a[href="https://ramaytush.kindful.com/?campaign=1199658"]'
      );
      return Boolean(
        panel &&
        button &&
        official?.textContent?.includes("Donate on the official site") &&
        !button.disabled &&
        /^Open \\$20\\.00 test checkout/.test(button.textContent?.trim() ?? "") &&
        document.documentElement.scrollWidth <= window.innerWidth
      );
    })()`,
    "Ramaytush must show its official link and an enabled $20 test checkout without overflow.",
  );
  agentBrowser(["click", "section.pledge-payment-panel button.pledge-checkout-button"]);
  agentBrowser(["wait", "--url", "https://checkout.stripe.com/**"]);

  const checkoutUrl = new URL(agentBrowser(["get", "url"]).url);
  assert.equal(checkoutUrl.protocol, "https:");
  assert.equal(checkoutUrl.hostname, "checkout.stripe.com");
  assert.match(`${checkoutUrl.pathname}${checkoutUrl.search}${checkoutUrl.hash}`, /cs_test_/);
  console.log("✓ donation redirects to a checkout.stripe.com cs_test_ URL");

  const sessionId = "cs_test_tend_receipt_e2e";
  const hash = `0x${"a".repeat(64)}`;
  const recipient = `0x${"b".repeat(40)}`;
  agentBrowser(["network", "requests", "--clear"]);
  agentBrowser(["navigate", "about:blank"]);
  setReceiptResponse({ status: "awaiting-confirmation", events: [] });
  agentBrowser([
    "navigate",
    `${baseUrl}/thanks?tribe=ramaytush&session_id=${sessionId}`,
  ]);
  agentBrowser(["wait", "--text", "Confirming your contribution."]);
  assertInBrowser(
    `(() => {
      const step = document.querySelector('[aria-label="Payment settlement route"] .tempo-route-step');
      return step?.dataset.active === "false" &&
        step.textContent?.includes("Awaiting confirmation") &&
        !document.body.textContent?.includes("Stripe verified the payment.");
    })()`,
    "The receipt must remain unverified while Stripe confirmation is pending.",
  );

  agentBrowser(["navigate", "about:blank"]);
  setReceiptResponse({ status: "awaiting-payment", events: [] });
  agentBrowser([
    "navigate",
    `${baseUrl}/thanks?tribe=ramaytush&session_id=${sessionId}`,
  ]);
  agentBrowser(["wait", "--fn", "document.body.innerText.includes('Payment pending')"]);
  assertInBrowser(
    `(() => {
      const step = document.querySelector('[aria-label="Payment settlement route"] .tempo-route-step');
      return step?.dataset.active === "false" &&
        !document.body.textContent?.includes("Stripe verified the payment.");
    })()`,
    "The receipt must remain unverified while payment is pending.",
  );

  agentBrowser(["navigate", "about:blank"]);
  setReceiptResponse({
    status: "complete",
    events: [
      {
        type: "ready",
        amountCents: 2000,
        interval: "once",
        organization: "Ramaytush Ohlone",
        paymentMethod: "Card",
        recipient,
        settlements: 1,
        streamDurationSeconds: 5,
        streamIntervalSeconds: 5,
        stripeReceipt: sessionId,
      },
      {
        type: "settlement",
        amountCents: 2000,
        hash,
        index: 1,
        streamedCents: 2000,
        totalCents: 2000,
      },
      {
        type: "complete",
        amountCents: 2000,
        lastHash: hash,
        recipient,
        settlements: 1,
      },
    ],
  });
  agentBrowser([
    "navigate",
    `${baseUrl}/thanks?tribe=ramaytush&session_id=${sessionId}`,
  ]);
  agentBrowser(["wait", "--text", "Every settlement landed."]);
  assertInBrowser(
    `(() => {
      const link = [...document.querySelectorAll("a")]
        .find((item) => item.textContent?.includes("Tempo transaction"));
      return link?.href === "https://explore.testnet.tempo.xyz/tx/${hash}" &&
        document.documentElement.scrollWidth <= window.innerWidth;
    })()`,
    "The completed mobile receipt must expose the Tempo transaction without overflow.",
  );

  const requests = collectRequests(
    agentBrowser(["network", "requests", "--filter", "/api/tempo/stream"]),
  ).filter((request) => request.url.includes("/api/tempo/stream"));
  assert.ok(requests.length >= 3, "The receipt must poll its status endpoint.");
  assert.ok(
    requests.every((request) => request.method === "GET"),
    "Receipt polling must use GET only.",
  );
  assert.ok(
    requests.every(
      (request) => new URL(request.url).searchParams.get("sessionId") === sessionId,
    ),
    "Every receipt poll must include the Checkout session ID.",
  );
  console.log("✓ receipt stays unverified until GET-only polling reports completion");
  console.log("✓ no payment details were entered and no payment was completed");
}

try {
  await checkDonationJourney();
} catch (error) {
  if (serverLog) console.error(`\nNext.js output:\n${serverLog}`);
  throw error;
} finally {
  try {
    agentBrowser(["close"]);
  } catch {
    // The browser may never have opened.
  }
  await stopDevServer();
}
