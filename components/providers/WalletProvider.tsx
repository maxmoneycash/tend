"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { type ReactNode } from "react";

const ACTIVE_NETWORK =
  process.env.NEXT_PUBLIC_APTOS_NETWORK === "mainnet"
    ? Network.MAINNET
    : Network.TESTNET;

// Register X-Chain wallet derivation at module level.
// These dynamically import and register EIP-6963 (Ethereum) and Wallet-Standard
// (Solana) adapters that derive Aptos accounts from non-Aptos wallets (AIP-113).
if (typeof window !== "undefined") {
  import("@aptos-labs/derived-wallet-ethereum").then(
    ({ setupAutomaticEthereumWalletDerivation }) => {
      setupAutomaticEthereumWalletDerivation({
        defaultNetwork: ACTIVE_NETWORK,
      });
    }
  );
  import("@aptos-labs/derived-wallet-solana").then(
    ({ setupAutomaticSolanaWalletDerivation }) => {
      setupAutomaticSolanaWalletDerivation({
        defaultNetwork: ACTIVE_NETWORK,
      });
    }
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{
        network: ACTIVE_NETWORK,
        aptosConnectDappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
