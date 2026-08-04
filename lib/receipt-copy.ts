export function terminalSettlementErrorCopy(
  settled: number,
  total: number,
) {
  const state =
    settled > 0 && total > 0
      ? `The Tempo testnet transfers stopped after ${settled} of ${total} test transfers settled.`
      : "The Tempo testnet transfers stopped before a test transfer settled.";

  return `${state} Copy the session ID and send it to the test operator. Do not retry this transfer.`;
}

export function terminalPaymentFailureRecoveryCopy() {
  return "This Checkout session will not be retried. Start a new test pledge to try another payment.";
}

export function awaitingPaymentUpdateCopy() {
  return {
    announcement:
      "No Stripe test payment update yet. Keep this page open while it checks again.",
    heading: "Waiting for a Stripe update.",
    intro:
      "No payment update for this Checkout session yet. Keep this page open.",
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
      "No Stripe update after two minutes. Copy the session ID and send it to the test operator.",
    heading: "Still no Stripe update.",
    intro:
      "No Stripe update arrived after two minutes. Copy the session ID and send it to the test operator.",
    panel:
      "Still checking. The Stripe webhook may not be reaching the server.",
    receiptConfirmation: "No Stripe update after two minutes",
    receiptDetail: "no Stripe update after two minutes of checks",
    receiptStatusLabel: "No Stripe update",
    stateLabel: "Still waiting for Stripe",
  } as const;
}

export function awaitingPaidTestPaymentCopy() {
  return {
    announcement:
      "Stripe has not marked this test payment as paid. Keep this page open.",
    heading: "Stripe has not marked the test payment as paid.",
    intro:
      "Checkout updated without a paid status. Keep this page open while Stripe is checked again.",
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
      "Test payment verified. The first testnet transfer is being prepared.",
    heading: "Setting up the first testnet transfer.",
    intro:
      "Stripe verified the test payment. The first pathUSD transfer is being prepared on Tempo testnet.",
    panel:
      "Setting up the first Tempo testnet transfer. Keep this page open.",
    stateLabel: "Setting up first transfer",
  } as const;
}

export function receiptRefreshRecoveryCopy(hasConfirmedDetails: boolean) {
  const state = hasConfirmedDetails
    ? "The receipt could not refresh. The last confirmed details remain below."
    : "The test receipt could not load.";

  return `${state} Use Check receipt again to request the latest saved status. Payment and Tempo transfer retries stay disabled.`;
}
