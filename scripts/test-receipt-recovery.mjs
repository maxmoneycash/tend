import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  awaitingPaidTestPaymentCopy,
  awaitingPaymentUpdateCopy,
  receiptRefreshRecoveryCopy,
  terminalPaymentFailureRecoveryCopy,
  terminalSettlementErrorCopy,
} from "../lib/receipt-copy.ts";
import {
  stripeHostedReceiptUrl,
  tempoTestnetTransactionUrl,
} from "../lib/receipt-proof.ts";

const [receipt, stream, route] = await Promise.all([
  readFile(new URL("../components/DonationReceipt.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/TempoStream.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/api/tempo/stream/route.ts", import.meta.url), "utf8"),
]);

const tempoTransactionId = `0x${"a".repeat(64)}`;

assert.equal(
  tempoTestnetTransactionUrl(tempoTransactionId),
  `https://explore.testnet.tempo.xyz/tx/${tempoTransactionId}`,
  "A valid transaction ID must open on the Tempo testnet explorer.",
);
assert.equal(
  tempoTestnetTransactionUrl("https://example.com/not-a-tempo-transaction"),
  null,
  "An unexpected transaction value must not become an external receipt link.",
);
assert.equal(
  stripeHostedReceiptUrl(
    "https://pay.stripe.com/receipts/payment/test_receipt_token",
  ),
  "https://pay.stripe.com/receipts/payment/test_receipt_token",
  "A Stripe-hosted receipt must keep its HTTPS receipt URL.",
);
assert.equal(
  stripeHostedReceiptUrl(
    "https://pay.stripe.com.example/receipts/payment/test_receipt_token",
  ),
  null,
  "A deceptive Stripe hostname must not become a receipt link.",
);
assert.equal(
  stripeHostedReceiptUrl("http://pay.stripe.com/receipts/payment/test"),
  null,
  "A hosted receipt must use HTTPS.",
);
assert.equal(
  stripeHostedReceiptUrl("https://pay.stripe.com/account"),
  null,
  "A Stripe URL outside the hosted receipt path must not become a receipt link.",
);

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
assert.deepEqual(awaitingPaidTestPaymentCopy(), {
  announcement:
    "Stripe has not marked this test payment as paid. Keep this page open while Tend checks again.",
  heading: "Stripe has not marked the test payment as paid.",
  intro:
    "Tend received a Checkout update without a paid status. Keep this page open while Tend checks Stripe again.",
  panel: "Checking again for a paid Stripe test payment.",
  receiptConfirmation: "Waiting for a paid Stripe status",
  receiptDetail: "not marked paid by Stripe",
  receiptStatusLabel: "Waiting for paid status",
  stateLabel: "Waiting for paid status (test mode)",
});
assert.equal(
  receiptRefreshRecoveryCopy(true),
  "Tend could not refresh this test receipt. The last confirmed details remain below. Use Check receipt again to request the latest saved status. Payment and Tempo transfer retries stay disabled.",
  "A failed refresh must preserve confirmed details and name the read-only recovery action.",
);
assert.equal(
  receiptRefreshRecoveryCopy(false),
  "Tend could not load this test receipt. Use Check receipt again to request the latest saved status. Payment and Tempo transfer retries stay disabled.",
  "An unavailable first load must name the read-only recovery action without claiming saved details.",
);
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
  /state\.paymentStatus !== "paid"[\s\S]*?status: "awaiting-payment", events: \[\]/,
  "A stored non-paid payment must reach the client as awaiting-payment.",
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
  /case "awaiting-payment":\s*return awaitingPaidTestPaymentCopy\(\)/,
  "A stored non-paid state must avoid claiming that Stripe calls the payment pending.",
);
assert.match(
  stream,
  /role="status"[\s\S]*?aria-live="polite"[\s\S]*?\{error \? "" : viewCopy\.announcement\}/,
  "The waiting state must announce status changes without interrupting the donor.",
);
assert.match(
  stream,
  /const unverifiedReceiptCopy =[\s\S]*?status === "awaiting-confirmation"[\s\S]*?awaitingPaymentUpdateCopy\(\)[\s\S]*?status === "awaiting-payment"[\s\S]*?awaitingPaidTestPaymentCopy\(\)/,
  "Each unverified server state must provide its exact receipt-card copy.",
);
assert.match(
  stream,
  /unverifiedConfirmation=\{unverifiedReceiptCopy\?\.receiptConfirmation\}[\s\S]*?unverifiedDetail=\{unverifiedReceiptCopy\?\.receiptDetail\}[\s\S]*?unverifiedStatusLabel=\{unverifiedReceiptCopy\?\.receiptStatusLabel\}/,
  "The receipt card must use the same unverified state as the surrounding panel.",
);
assert.match(
  stream,
  /const canRetry = Boolean\(requestError\) \|\| status === "unavailable";/,
  "Only transient receipt failures may expose the retry action.",
);
assert.match(
  stream,
  /fetch\([\s\S]*?\/api\/tempo\/stream\?sessionId=[\s\S]*?method: "GET"/,
  "Checking the receipt again must remain a read-only status request.",
);
assert.match(
  stream,
  /const unavailableRecovery =[\s\S]*?status === "unavailable"[\s\S]*?receiptRefreshRecoveryCopy\(stripeVerified\)[\s\S]*?const error =\s*unavailableRecovery \?\?/,
  "The unavailable state must use the exact recovery message for its visible error.",
);
assert.match(
  stream,
  /canRetry \? \([\s\S]*?<button[\s\S]*?setStatus\("connecting"\)[\s\S]*?setRetryKey[\s\S]*?Check receipt again/,
  "The unavailable recovery action must request the receipt status again.",
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
  /<dt>Last Tempo transaction ID<\/dt>/,
  "The receipt must identify the shortened Tempo proof value.",
);
assert.match(
  receipt,
  /href=\{lastTransactionUrl\}[\s\S]*?rel="noopener noreferrer"[\s\S]*?aria-label="View the last Tempo testnet transaction in a new tab"[\s\S]*?View Tempo transaction on testnet/,
  "The receipt proof link must name its destination and use the validated testnet URL.",
);
assert.match(
  receipt,
  /const stripeReceiptUrl = stripeHostedReceiptUrl\(receiptUrl\);/,
  "The receipt component must validate the stored Stripe URL before rendering it.",
);
assert.match(
  receipt,
  /href=\{stripeReceiptUrl\}[\s\S]*?rel="noopener noreferrer"[\s\S]*?aria-label="View the Stripe test receipt in a new tab"[\s\S]*?View Stripe test receipt/,
  "The Stripe receipt link must name its action and use the validated hosted URL.",
);
assert.match(
  receipt,
  /reference\s*\? "Copy session ID"\s*:\s*"Copy transaction ID"/s,
  "The visible copy action must name the identifier it copies.",
);

console.log("Receipt state and proof checks passed.");
