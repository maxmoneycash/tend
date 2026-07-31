const TEMPO_TRANSACTION_ID = /^0x[a-fA-F0-9]{64}$/;
const TEMPO_TESTNET_EXPLORER = "https://explore.testnet.tempo.xyz";

export function tempoTestnetTransactionUrl(transactionId?: string) {
  if (!transactionId || !TEMPO_TRANSACTION_ID.test(transactionId)) return null;

  return new URL(`/tx/${transactionId}`, TEMPO_TESTNET_EXPLORER).toString();
}
