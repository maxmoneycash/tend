"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface Balances {
  apt: { balance: string; formatted: string };
  tokens: Record<string, { symbol: string; balance: string; decimals: number }>;
}

export function WalletDisplay() {
  const { account, connected } = useWallet();
  const [balances, setBalances] = useState<Balances | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!account?.address) return;
    try {
      const res = await fetch(`/api/balance?address=${account.address}`);
      const data = await res.json();
      if (!data.error) setBalances(data);
    } catch {
      // Silently fail
    }
  }, [account?.address]);

  useEffect(() => {
    if (connected) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 15000);
      return () => clearInterval(interval);
    }
  }, [connected, fetchBalances]);

  if (!connected || !balances) return null;

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-card-border rounded-lg">
        <span className="text-muted">APT</span>
        <span className="font-mono font-medium">{balances.apt.formatted}</span>
      </div>
      {Object.values(balances.tokens).map((t) => (
        <div
          key={t.symbol}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-card-border rounded-lg"
        >
          <span className="text-muted">{t.symbol}</span>
          <span className="font-mono font-medium">
            {(Number(t.balance) / 10 ** t.decimals).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
