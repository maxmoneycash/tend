export function terminalSettlementErrorCopy(
  settled: number,
  total: number,
) {
  const state =
    settled > 0 && total > 0
      ? `The Tempo testnet transfers stopped after ${settled} of ${total} test transfers settled.`
      : "The Tempo testnet transfers stopped before a test transfer settled.";

  return `${state} Use Copy session ID on the receipt and send that ID to the Tend operator running this test. Do not retry this transfer.`;
}

export function terminalPaymentFailureRecoveryCopy() {
  return "Tend will not retry this Checkout session. Start a new test pledge to try another test payment.";
}

export function awaitingPaymentUpdateCopy() {
  return {
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
  } as const;
}

export function prolongedAwaitingPaymentUpdateCopy() {
  return {
    announcement:
      "Tend still has no Stripe test payment update after two minutes of checks. Copy the session ID on the receipt and send it to the Tend operator running this test.",
    heading: "Still no Stripe update.",
    intro:
      "Two minutes of checks brought no Stripe test payment update for this Checkout session. The Stripe webhook may not be reaching this Tend server. Copy the session ID on the receipt and send it to the Tend operator running this test.",
    panel:
      "Still checking. The Stripe webhook may not be reaching this Tend server.",
    receiptConfirmation: "No Stripe update after two minutes",
    receiptDetail: "no Stripe update after two minutes of checks",
    receiptStatusLabel: "No Stripe update",
    stateLabel: "Still waiting for Stripe",
  } as const;
}

export function awaitingPaidTestPaymentCopy() {
  return {
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
  } as const;
}

export function preparingFirstTestnetTransferCopy() {
  return {
    announcement:
      "Test payment verified. Tend is setting up the first Tempo testnet transfer. Keep this page open for the next receipt update.",
    heading: "Setting up the first testnet transfer.",
    intro:
      "Stripe verified the test payment. Tend is setting up the first pathUSD transfer on Tempo’s public testnet. Keep this page open for the next receipt update.",
    panel:
      "Setting up the first Tempo testnet transfer. Keep this page open.",
    stateLabel: "Setting up first transfer",
  } as const;
}

export function receiptRefreshRecoveryCopy(hasConfirmedDetails: boolean) {
  const state = hasConfirmedDetails
    ? "Tend could not refresh this test receipt. The last confirmed details remain below."
    : "Tend could not load this test receipt.";

  return `${state} Use Check receipt again to request the latest saved status. Payment and Tempo transfer retries stay disabled.`;
}
