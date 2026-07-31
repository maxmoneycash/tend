import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCheckoutCancelUrl,
  buildCheckoutRequest,
  buildCheckoutResumePath,
  buildPledgeCheckoutIntent,
  pledgeCheckoutButtonLabel,
  pledgeCheckoutCanceledError,
  pledgeCheckoutError,
  resolvePledgeProgram,
  restorePledgeSelection,
} from "../lib/pledge-flow-state.ts";

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
    custom: "",
    interval: "month",
    streamDurationSeconds: 60,
    streamIntervalSeconds: 5,
    tribeId: "muwekma",
  });
  assert.equal(
    resolvePledgeProgram(null, programs, restored.tribeId)?.name,
    "Muwekma Ohlone Tribe",
  );

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
      selectedAmount: restored.amount,
    }),
    "Try Stripe test checkout again",
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
      selectedAmount: intent.amountCents / 100,
    }),
    "Try Stripe test checkout again",
  );
});
