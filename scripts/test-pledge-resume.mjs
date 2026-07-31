import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPledgeCheckoutIntent,
  pledgeCheckoutButtonLabel,
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
