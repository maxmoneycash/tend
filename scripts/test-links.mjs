import { execFileSync } from "node:child_process";
import { tribes } from "../lib/tribes.ts";

const baseUrl = new URL(process.env.TEND_BASE_URL ?? "http://localhost:3100");
const timeoutMs = 3_000;
const pagePaths = [
  "/programs",
  "/pledge",
  "/thanks",
  "/dashboard",
  "/explorer",
  "/programs/muwekma",
  "/programs/ramaytush",
  "/auth/logout",
];
const legacyPaths = [
  "/rewards",
  "/rewards/old",
  "/campaigns",
  "/campaigns/old",
  "/onboarding",
  "/onboarding/old",
  "/variants",
];
const failures = [];

function currentHead() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function request(pathname) {
  try {
    const response = await fetch(new URL(pathname, baseUrl), {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { body: await response.text(), response };
  } catch (error) {
    const reason =
      error?.name === "TimeoutError"
        ? `timed out after ${timeoutMs} ms`
        : error?.message ?? String(error);
    failures.push(`${pathname}: ${reason}`);
    return null;
  }
}

const startingHead = currentHead();

for (const pathname of pagePaths) {
  const result = await request(pathname);
  if (!result) continue;

  const { response } = result;
  const contentType = response.headers.get("content-type") ?? "";
  const isPage = response.status >= 200 && response.status < 300;
  const isRedirect = response.status >= 300 && response.status < 400;
  if ((isPage && contentType.startsWith("text/html")) || isRedirect) {
    console.log(`PASS ${pathname}: ${response.status}`);
  } else {
    failures.push(
      `${pathname}: expected HTML or a redirect, received ${response.status} ${contentType || "without a content type"}`,
    );
  }
}

const programsUrl = new URL("/programs", baseUrl).href;
for (const pathname of legacyPaths) {
  const result = await request(pathname);
  if (!result) continue;

  const { response } = result;
  const location = response.headers.get("location");
  const destination = location ? new URL(location, baseUrl).href : "";
  if (response.status === 308 && destination === programsUrl) {
    console.log(`PASS ${pathname}: 308 ${destination}`);
  } else {
    failures.push(
      `${pathname}: expected 308 ${programsUrl}, received ${response.status} ${destination || "without a location"}`,
    );
  }
}

const fingerprintResponse = await request("/programs/ramaytush");
if (fingerprintResponse?.response.ok) {
  const sourceFingerprint = escapeHtml(tribes.ramaytush.blurb);
  if (fingerprintResponse.body.includes(sourceFingerprint)) {
    console.log("PASS /programs/ramaytush: matches committed program copy");
  } else {
    failures.push(
      "/programs/ramaytush: rendered copy does not match lib/tribes.ts",
    );
  }
} else if (fingerprintResponse) {
  failures.push(
    `/programs/ramaytush: fingerprint request returned ${fingerprintResponse.response.status}`,
  );
}

const endingHead = currentHead();
if (endingHead !== startingHead) {
  failures.push(`HEAD changed during the gate: ${startingHead} to ${endingHead}`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`Link gate failed at ${startingHead}.`);
  process.exitCode = 1;
} else {
  console.log(`Link gate passed at ${startingHead}.`);
}
