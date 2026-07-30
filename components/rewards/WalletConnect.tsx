"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  groupAndSortWallets,
} from "@aptos-labs/wallet-adapter-core";
import type { AuthMessage } from "@/lib/rewards-siwa";

const STORAGE_KEY = "rewards_token";

function serializeAuthMessage(msg: AuthMessage): string {
  return [
    `${msg.domain} wants you to sign in with your Aptos account:`,
    msg.address,
    "",
    msg.statement,
    "",
    `URI: https://${msg.domain}`,
    `Version: 1`,
    `Chain ID: ${msg.chainId}`,
    `Nonce: ${msg.nonce}`,
    `Issued At: ${msg.issuedAt}`,
    `Expiration Time: ${msg.expirationTime}`,
  ].join("\n");
}

type AuthState =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "verifying" }
  | { status: "authenticated"; token: string; role: string }
  | { status: "error"; message: string };

/**
 * Wallet connection via Google login (Aptos Connect keyless accounts).
 * No wallet extensions needed — users sign in with their Google account.
 */
export function WalletConnect() {
  const {
    connected,
    account,
    wallet,
    connect,
    disconnect,
    signMessage,
    wallets,
  } = useWallet();

  const [auth, setAuth] = useState<AuthState>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const address = account?.address?.toString() ?? "";
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Separate social login wallets from extension wallets
  const { petraWebWallets } = groupAndSortWallets(wallets);

  useEffect(() => {
    if (!connected || !address) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAuth({ status: "authenticated", token: stored, role: "creator" });
    }
  }, [connected, address]);

  const authenticate = useCallback(async () => {
    if (!account?.address || !account?.publicKey) {
      setAuth({ status: "error", message: "Wallet not connected" });
      return;
    }

    try {
      setAuth({ status: "signing" });
      const nonceRes = await fetch(
        `/api/rewards/auth/nonce?address=${encodeURIComponent(address)}`,
      );
      if (!nonceRes.ok) {
        const body = await nonceRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch nonce");
      }
      const { nonce, message: authMessage } = (await nonceRes.json()) as {
        nonce: string;
        message: AuthMessage;
      };

      const serialized = serializeAuthMessage(authMessage);
      const signResult = await signMessage({
        message: serialized,
        nonce,
      });

      const signatureHex =
        typeof signResult.signature === "string"
          ? signResult.signature
          : signResult.signature.toString();

      const publicKeyHex = Array.isArray(account.publicKey)
        ? account.publicKey[0].toString()
        : account.publicKey.toString();

      setAuth({ status: "verifying" });
      const verifyRes = await fetch("/api/rewards/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          message: authMessage,
          signature: signatureHex,
          publicKey: publicKeyHex,
        }),
      });

      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Verification failed");
      }

      const { token, role } = (await verifyRes.json()) as {
        token: string;
        address: string;
        role: string;
      };

      localStorage.setItem(STORAGE_KEY, token);
      setAuth({ status: "authenticated", token, role });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setAuth({ status: "error", message });
    }
  }, [account, address, signMessage]);

  useEffect(() => {
    if (
      connected &&
      address &&
      auth.status === "idle" &&
      !localStorage.getItem(STORAGE_KEY)
    ) {
      authenticate();
    }
  }, [connected, address, auth.status, authenticate]);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ status: "idle" });
    disconnect();
  }, [disconnect]);

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleGoogleLogin = useCallback(
    async (walletName: string) => {
      setShowSelector(false);
      try {
        await connect(walletName);
      } catch {
        // User cancelled
      }
    },
    [connect],
  );

  // ── Not connected ──────────────────────────────────────────
  if (!connected) {
    return (
      <div className="relative">
        {/* Primary: Google login button */}
        {petraWebWallets && petraWebWallets.length > 0 ? (
          <button
            onClick={() => handleGoogleLogin(petraWebWallets[0].name)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        ) : (
          <button
            onClick={() => setShowSelector(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[13px] font-medium text-white hover:bg-white/[0.10] transition-colors"
          >
            Sign In
          </button>
        )}

        {/* Fallback: show all available wallets */}
        {showSelector && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSelector(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 w-[260px] bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[12px] text-zinc-500 font-medium">
                  Choose a wallet
                </p>
              </div>
              <div className="p-2">
                {wallets.length === 0 && (
                  <p className="text-[12px] text-zinc-600 text-center py-4">
                    No wallets detected
                  </p>
                )}
                {wallets.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => handleGoogleLogin(w.name)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    {w.icon ? (
                      <img
                        src={w.icon}
                        alt={w.name}
                        className="w-6 h-6 rounded-md"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-white/[0.08] flex items-center justify-center text-[11px] font-bold text-zinc-400">
                        {w.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-[13px] font-medium text-white">
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Connected ──────────────────────────────────────────────
  return (
    <div className="flex items-center gap-2">
      {auth.status === "authenticated" ? (
        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Connected
        </span>
      ) : auth.status === "signing" || auth.status === "verifying" ? (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-[10px] font-medium">
          <div className="w-3 h-3 border-[1.5px] border-yellow-400 border-t-transparent rounded-full animate-spin" />
          {auth.status === "signing" ? "Signing..." : "Verifying..."}
        </span>
      ) : auth.status === "error" ? (
        <button
          onClick={authenticate}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] font-medium hover:bg-red-500/15 transition-colors"
          title={auth.message}
        >
          Retry
        </button>
      ) : null}

      <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.08] rounded-lg">
        <button
          onClick={handleCopyAddress}
          className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-white hover:bg-white/[0.04] rounded-l-lg transition-colors"
          title={copied ? "Copied!" : "Copy address"}
        >
          {wallet?.icon && (
            <img
              src={wallet.icon}
              alt=""
              className="w-4 h-4 rounded-[3px]"
            />
          )}
          <span className="font-mono">{shortAddress}</span>
          {copied && (
            <svg
              className="w-3.5 h-3.5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          )}
        </button>
        <button
          onClick={handleDisconnect}
          className="px-2 py-2 text-zinc-500 hover:text-red-400 rounded-r-lg hover:bg-white/[0.04] transition-colors"
          title="Disconnect"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
