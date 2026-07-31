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
