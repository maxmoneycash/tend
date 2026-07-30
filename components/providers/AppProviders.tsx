"use client";

import { type ReactNode } from "react";
import { WalletProvider } from "./WalletProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
