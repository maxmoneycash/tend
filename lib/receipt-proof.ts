const TEMPO_TRANSACTION_ID = /^0x[a-fA-F0-9]{64}$/;
const TEMPO_TESTNET_EXPLORER = "https://explore.testnet.tempo.xyz";
const STRIPE_RECEIPT_HOST = "pay.stripe.com";

export function tempoTestnetTransactionUrl(transactionId?: string) {
  if (!transactionId || !TEMPO_TRANSACTION_ID.test(transactionId)) return null;

  return new URL(`/tx/${transactionId}`, TEMPO_TESTNET_EXPLORER).toString();
}

export function stripeHostedReceiptUrl(receiptUrl?: string) {
  if (!receiptUrl) return null;

  try {
    const url = new URL(receiptUrl);
    const isHostedReceipt =
      url.protocol === "https:" &&
      url.hostname === STRIPE_RECEIPT_HOST &&
      url.port === "" &&
      url.username === "" &&
      url.password === "" &&
      url.pathname.startsWith("/receipts/");

    return isHostedReceipt ? url.toString() : null;
  } catch {
    return null;
  }
}
