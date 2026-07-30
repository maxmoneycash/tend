"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { type ReactNode } from "react";

/**
 * Wallet provider for Content Rewards.
 * Uses Aptos Connect (Google/Apple login) — no wallet extensions needed.
 * Configured for Aptos testnet (contracts + USDT payouts).
 */
export function RewardsWalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      optInWallets={[]}
      dappConfig={{
        network: Network.TESTNET,
        aptosConnectDappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
