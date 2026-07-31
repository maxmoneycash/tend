import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  awaitingPaymentUpdateCopy,
  terminalPaymentFailureRecoveryCopy,
  terminalSettlementErrorCopy,
} from "../lib/receipt-copy.ts";

const [receipt, stream, route] = await Promise.all([
  readFile(new URL("../components/DonationReceipt.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/TempoStream.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/api/tempo/stream/route.ts", import.meta.url), "utf8"),
]);

assert.equal(
  terminalSettlementErrorCopy(2, 5),
  "The Tempo testnet transfers stopped after 2 of 5 test transfers settled. Use Copy session ID on the receipt and send that ID to the Tend operator running this test. Do not retry this transfer.",
  "A partial terminal failure must name the settled count and the safe operator handoff.",
);
assert.equal(
  terminalSettlementErrorCopy(0, 5),
  "The Tempo testnet transfers stopped before a test transfer settled. Use Copy session ID on the receipt and send that ID to the Tend operator running this test. Do not retry this transfer.",
  "A terminal failure before settlement must still name the safe operator handoff.",
);
assert.equal(
  terminalPaymentFailureRecoveryCopy(),
  "Tend will not retry this Checkout session. Start a new test pledge to try another test payment.",
  "A terminal payment failure must direct the donor to a new test pledge.",
);
assert.deepEqual(awaitingPaymentUpdateCopy(), {
  announcement:
    "Tend has not received a Stripe test payment update yet. Keep this page open while Tend checks again.",
  heading: "Waiting for a Stripe update.",
  intro:
    "Tend has not received a test payment update for this Checkout session. Keep this page open while Tend checks again.",
  panel: "Checking again for a Stripe test payment update.",
  receiptConfirmation: "Waiting for a Stripe test payment update",
  receiptDetail: "waiting for a Stripe test payment update",
  receiptStatusLabel: "Waiting for update",
  stateLabel: "Waiting for Stripe update",
});
assert.match(
  route,
  /if \(!state\)[\s\S]*?status: "awaiting-confirmation", events: \[\]/,
  "A missing payment record must reach the client as awaiting-confirmation.",
);
assert.match(
  route,
  /state\.paymentStatus === "failed"[\s\S]*?status: "payment-failed", events: \[\]/,
  "A stored failed payment must reach the client as a terminal payment failure.",
);
assert.match(
  route,
  /return Response\.json\(\{ status: state\.tempoStatus, events: state\.events \}\)/,
  "The receipt route must pass the stored terminal status and events to the client.",
);
assert.match(
  stream,
  /status === "error"[\s\S]*?terminalSettlementErrorCopy\([\s\S]*?settlements\.length,[\s\S]*?totalSettlements/,
  "The terminal UI must build its recovery copy from the confirmed settlement count.",
);
assert.match(
  stream,
  /const paymentFailureRecovery = paymentFailed[\s\S]*?terminalPaymentFailureRecoveryCopy\(\)/,
  "The payment-failed view must use the terminal payment recovery copy.",
);
assert.match(
  stream,
  /case "awaiting-confirmation":\s*return awaitingPaymentUpdateCopy\(\)/,
  "The missing-record state must use the honest waiting copy.",
);
assert.match(
  stream,
  /role="status"[\s\S]*?aria-live="polite"[\s\S]*?\{error \? "" : viewCopy\.announcement\}/,
  "The waiting state must announce status changes without interrupting the donor.",
);
assert.match(
  stream,
  /unverifiedConfirmation=\{awaitingPaymentUpdate\?\.receiptConfirmation\}[\s\S]*?unverifiedDetail=\{awaitingPaymentUpdate\?\.receiptDetail\}[\s\S]*?unverifiedStatusLabel=\{awaitingPaymentUpdate\?\.receiptStatusLabel\}/,
  "The receipt card must use the same waiting state as the surrounding panel.",
);
assert.match(
  stream,
  /const canRetry = Boolean\(requestError\) \|\| status === "unavailable";/,
  "Only transient receipt failures may expose the retry action.",
);
assert.match(
  stream,
  /role="alert" aria-atomic="true">\s*\{errorAnnouncement\}/s,
  "The failure state and its recovery action must be announced together.",
);
assert.match(
  stream,
  /paymentFailed \? \(\s*<Link href="\/pledge" className="btn tnd-btn-primary">\s*Start a new test pledge\s*<\/Link>/s,
  "A terminal payment failure must link to a new test pledge instead of a receipt retry.",
);
assert.match(
  receipt,
  /const copyValue = reference \?\? lastHash \?\? "";/,
  "The support copy action must prefer the Checkout session ID.",
);
assert.match(
  receipt,
  /<dt>Checkout session ID<\/dt>/,
  "The receipt must name the copied Checkout identifier.",
);
assert.match(
  receipt,
  /reference\s*\? "Copy session ID"\s*:\s*"Copy transaction ID"/s,
  "The visible copy action must name the identifier it copies.",
);

console.log("Receipt state source checks passed.");
