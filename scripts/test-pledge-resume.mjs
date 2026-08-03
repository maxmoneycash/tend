import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildCheckoutCancelUrl,
  buildCheckoutRequest,
  buildCheckoutResumePath,
  buildPledgeCheckoutIntent,
  pledgeAmountReviewLabel,
  pledgeCheckoutButtonLabel,
  pledgeCheckoutCanceledError,
  pledgeCheckoutError,
  pledgeResumeError,
  pledgeStripeRecordLabel,
  pledgeTempoPlanExplanation,
  resolvePledgeProgram,
  restorePledgeDraft,
  restorePledgeSelection,
} from "../lib/pledge-flow-state.ts";

const pledgeFlowSource = readFileSync(
  new URL("../components/PledgeFlow.tsx", import.meta.url),
  "utf8",
);

test("a restored pledge keeps its selection, failure, and retry action", () => {
  const intent = {
    tribeId: "muwekma",
    amountCents: 7350,
    interval: "month",
    streamDurationSeconds: 60,
    streamIntervalSeconds: 5,
    returnTo: "/pledge",
  };
  const programs = [
    { id: "ramaytush", name: "Ramaytush Ohlone" },
    { id: "muwekma", name: "Muwekma Ohlone Tribe" },
  ];

  const restored = restorePledgeSelection(intent);
  assert.deepEqual(restored, {
    amount: 73.5,
    custom: "73.50",
    interval: "month",
    streamDurationSeconds: 60,
    streamIntervalSeconds: 5,
    tribeId: "muwekma",
  });
  assert.equal(
    resolvePledgeProgram(null, programs, restored.tribeId)?.name,
    "Muwekma Ohlone Tribe",
  );
  assert.match(pledgeFlowSource, /value=\{custom\}/);

  const checkoutError = pledgeCheckoutError(
    new Error("Sign-in did not finish. Sign in again to continue."),
    false,
  );
  assert.equal(
    checkoutError,
    "Sign-in did not finish. Sign in again to continue.",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: true,
      checkoutError,
      demo: false,
      interval: restored.interval,
      selectedAmount: restored.amount,
    }),
    "Try Stripe test checkout again",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: true,
      checkoutError: null,
      demo: false,
      interval: restored.interval,
      selectedAmount: restored.amount,
    }),
    "Open Stripe checkout for a $73.50 monthly test subscription (no real charge)",
  );
  assert.deepEqual(
    buildPledgeCheckoutIntent({
      interval: restored.interval,
      returnTo: "/pledge",
      selectedAmount: restored.amount,
      streamDurationSeconds: restored.streamDurationSeconds,
      streamIntervalSeconds: restored.streamIntervalSeconds,
      tribeId: restored.tribeId,
    }),
    intent,
  );
});

test("a canceled checkout returns to a visible retry with its intent", () => {
  const intent = {
    tribeId: "ramaytush",
    amountCents: 5000,
    interval: "year",
    streamDurationSeconds: 30,
    streamIntervalSeconds: 2,
    returnTo: "/pledge",
  };
  const resumePath = buildCheckoutResumePath(intent);
  assert.equal(restorePledgeSelection(intent).custom, "");

  assert.deepEqual(buildCheckoutRequest(intent, true), {
    ...intent,
    returnTo: resumePath,
    loginReturnTo: resumePath,
  });
  assert.equal(
    buildCheckoutCancelUrl("https://tend.example", resumePath),
    "https://tend.example/pledge?resume=checkout&t=ramaytush&a=5000&i=year&d=30&c=2&canceled=1",
  );
  assert.equal(
    pledgeCheckoutCanceledError(false),
    "Stripe test checkout was canceled. Your saved details are ready to review.",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: true,
      checkoutError: pledgeCheckoutCanceledError(false),
      demo: false,
      interval: intent.interval,
      selectedAmount: intent.amountCents / 100,
    }),
    "Try Stripe test checkout again",
  );
});

test("a rejected checkout return keeps valid details and gives a recovery action", () => {
  const restored = restorePledgeDraft({
    amountCents: 7350,
    interval: null,
    streamDurationSeconds: 60,
    streamIntervalSeconds: 5,
    tribeId: "muwekma",
  });

  assert.deepEqual(restored, {
    amount: 73.5,
    custom: "73.50",
    streamDurationSeconds: 60,
    streamIntervalSeconds: 5,
    tribeId: "muwekma",
  });
  assert.equal(
    pledgeResumeError({ demo: false, hasProgram: true }),
    "We couldn’t restore every saved checkout detail. Review the amount and timing below, then try Stripe test checkout again.",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: true,
      checkoutError: pledgeResumeError({ demo: false, hasProgram: true }),
      demo: false,
      interval: "once",
      selectedAmount: restored.amount,
    }),
    "Try Stripe test checkout again",
  );
  assert.deepEqual(
    buildPledgeCheckoutIntent({
      interval: "once",
      returnTo: "/pledge",
      selectedAmount: restored.amount,
      streamDurationSeconds: restored.streamDurationSeconds,
      streamIntervalSeconds: restored.streamIntervalSeconds,
      tribeId: restored.tribeId,
    }),
    {
      amountCents: 7350,
      interval: "once",
      returnTo: "/pledge",
      streamDurationSeconds: 60,
      streamIntervalSeconds: 5,
      tribeId: "muwekma",
    },
  );
  assert.equal(
    pledgeResumeError({ demo: false, hasProgram: false }),
    "We couldn’t restore the saved program. Enter your address or choose a county to rebuild the test checkout.",
  );
});

test("the pledge names the Stripe record and Tempo boundary before checkout", () => {
  assert.equal(
    pledgeStripeRecordLabel("once"),
    "One-time test payment",
  );
  assert.equal(
    pledgeStripeRecordLabel("month"),
    "Monthly test subscription",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: true,
      checkoutError: null,
      demo: false,
      interval: "year",
      selectedAmount: 100,
    }),
    "Open Stripe checkout for a $100.00 yearly test subscription (no real charge)",
  );
  assert.equal(
    pledgeTempoPlanExplanation("once"),
    "If checkout succeeds, Stripe records a one-time test payment. Tend attempts this Tempo testnet plan after Stripe confirms the payment.",
  );
  assert.equal(
    pledgeTempoPlanExplanation("month"),
    "If checkout succeeds, Stripe creates a monthly test subscription. Tend attempts this Tempo testnet plan after Stripe confirms the first payment. Later subscription invoices do not trigger another attempt.",
  );
  assert.match(
    pledgeFlowSource,
    /Review the Stripe test payment or subscription and timing below before continuing\./,
  );
  assert.match(pledgeFlowSource, /"If checkout succeeds"/);
  assert.doesNotMatch(pledgeFlowSource, /Stripe will record/);
});

test("an invalid amount names the fix instead of promising a $0.00 checkout", () => {
  assert.equal(
    pledgeAmountReviewLabel({ amountValid: true, selectedAmount: 25.5 }),
    "$25.50",
  );
  assert.equal(
    pledgeAmountReviewLabel({ amountValid: false, selectedAmount: 0.5 }),
    "Not set",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: false,
      checkoutError: null,
      demo: false,
      interval: "once",
      selectedAmount: 0.5,
    }),
    "Enter a test amount from $1 to $10,000",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: false,
      checkoutError: null,
      demo: true,
      interval: "once",
      selectedAmount: 0.5,
    }),
    "Enter a sample amount from $1 to $10,000",
  );
  assert.equal(
    pledgeCheckoutButtonLabel({
      amountValid: false,
      checkoutError: pledgeCheckoutCanceledError(false),
      demo: false,
      interval: "once",
      selectedAmount: 0.5,
    }),
    "Try Stripe test checkout again",
  );
  assert.match(
    pledgeFlowSource,
    /pledgeAmountReviewLabel\(\{ amountValid, selectedAmount \}\)/,
  );
  assert.doesNotMatch(pledgeFlowSource, /\$\{selectedAmount\}/);
  assert.doesNotMatch(pledgeFlowSource, /\$0\.00/);
});

test("checkout errors focus the enabled retry linked to the alert", () => {
  assert.match(
    pledgeFlowSource,
    /const checkoutButtonRef = useRef<HTMLButtonElement>\(null\);/,
  );
  assert.match(
    pledgeFlowSource,
    /if \(!checkoutError \|\| busyAction !== null\) return;\s+checkoutButtonRef\.current\?\.focus\(\);/,
  );
  assert.match(
    pledgeFlowSource,
    /<button\s+ref=\{checkoutButtonRef\}\s+type="button"\s+onClick=\{checkout\}\s+disabled=\{busy \|\| !amountValid\}\s+className="pledge-checkout-button"/,
  );
  assert.match(
    pledgeFlowSource,
    /className="pledge-checkout-button"[\s\S]{0,250}checkoutError \? "pledge-checkout-error" : undefined/,
  );
});

test("a rejected return without a program focuses its recovery field", () => {
  assert.match(
    pledgeFlowSource,
    /const addressInputRef = useRef<HTMLInputElement>\(null\);/,
  );
  assert.match(
    pledgeFlowSource,
    /if \(!resumeError \|\| busyAction !== null\) return;\s+addressInputRef\.current\?\.focus\(\);/,
  );
  assert.match(
    pledgeFlowSource,
    /<input\s+ref=\{addressInputRef\}[\s\S]{0,500}resumeError\s+\? "pledge-location-help pledge-resume-error"/,
  );
  assert.match(
    pledgeFlowSource,
    /<p id="pledge-resume-error" className="pledge-error" role="alert">/,
  );
});

test("editing a failed pledge clears stale recovery before changing intent", () => {
  for (const handler of [
    "chooseProgram",
    "chooseInterval",
    "chooseAmount",
    "changeCustomAmount",
    "chooseStreamDuration",
    "chooseStreamInterval",
  ]) {
    assert.match(
      pledgeFlowSource,
      new RegExp(
        `function ${handler}\\([^)]*\\) \\{\\s+setCheckoutError\\(null\\);`,
      ),
    );
  }

  assert.match(pledgeFlowSource, /onClick=\{\(\) => chooseProgram\(tribe\.id\)\}/);
  assert.match(pledgeFlowSource, /onClick=\{\(\) => chooseAmount\(chip\)\}/);
  assert.match(
    pledgeFlowSource,
    /onChange=\{\(event\) =>\s+changeCustomAmount\(event\.target\.value\)\s+\}/,
  );
  assert.match(pledgeFlowSource, /onDurationChange=\{chooseStreamDuration\}/);
  assert.match(pledgeFlowSource, /onIntervalChange=\{chooseStreamInterval\}/);
});
