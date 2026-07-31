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
