"use client";

import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { WalletSelector } from "@/components/wallet/WalletSelector";
import { WalletAccountModal } from "@/components/wallet/WalletAccountModal";
import { getChainFromWallet } from "@/lib/wallet-utils";
import { BALANCE_UPDATE_EVENT, YIELD_CLAIM_EVENT, DRAWER_TOGGLE_EVENT, type BalanceUpdateDetail, type YieldClaimDetail } from "@/lib/portfolio-events";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const NAV_ITEMS = [
  { href: "/earn", label: "Earn" },
  { href: "/trade", label: "Trade" },
  { href: "/send", label: "Send" },
  { href: "/rewards", label: "Rewards" },
];

export function Header() {
  const { connected, account, wallet } = useWallet();
  const pathname = usePathname();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const addressStr = account?.address?.toString() ?? "";
  const shortAddress = addressStr
    ? `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
    : "";

  const chain = wallet ? getChainFromWallet(wallet) : null;
  const isXChain = chain === "ethereum" || chain === "solana";
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [balance, setBalance] = useState(4218.32);

  useEffect(() => {
    const onBalanceUpdate = (e: Event) => {
      const d = (e as CustomEvent<BalanceUpdateDetail>).detail;
      setBalance((prev) => prev + d.delta);
    };
    const onYieldClaim = (e: Event) => {
      const d = (e as CustomEvent<YieldClaimDetail>).detail;
      setBalance((prev) => prev + d.claimed);
    };
    window.addEventListener(BALANCE_UPDATE_EVENT, onBalanceUpdate);
    window.addEventListener(YIELD_CLAIM_EVENT, onYieldClaim);
    return () => {
      window.removeEventListener(BALANCE_UPDATE_EVENT, onBalanceUpdate);
      window.removeEventListener(YIELD_CLAIM_EVENT, onYieldClaim);
    };
  }, []);

  const handleWalletClick = () => {
    if (connected) {
      setAccountModalOpen(true);
    } else {
      setSelectorOpen(true);
    }
  };

  return (
    <>
      <header className="relative z-50 isolate border-b border-white/[0.06] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white shrink-0">
              <svg className="h-8 w-auto" viewBox="0 0 150 40.194" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 64.475 32.423 L 59.054 10.811 L 63.891 10.811 L 67.525 25.769 L 67.586 25.769 L 72.823 10.811 L 76.981 10.811 L 82.218 25.769 L 82.279 25.769 L 85.945 10.811 L 90.75 10.811 L 85.328 32.423 L 80.401 32.423 L 74.917 17.976 L 74.856 17.976 L 69.342 32.423 Z M 92.231 10.811 L 96.79 10.811 L 96.79 17.976 L 96.852 17.976 C 97.254 17.235 98.051 16.645 98.984 16.246 C 99.848 15.876 101.104 15.641 102.212 15.635 C 103.431 15.629 105.117 15.942 106.308 16.559 C 107.519 17.216 108.434 18.099 109.049 19.207 C 109.706 20.357 110.035 21.651 110.035 23.089 L 110.035 32.422 L 105.477 32.422 L 105.477 23.704 C 105.477 22.432 105.096 21.446 104.336 20.746 C 103.577 20.049 102.539 19.699 101.225 19.699 C 99.91 19.699 98.863 20.068 98.021 20.808 C 97.2 21.547 96.79 22.513 96.79 23.704 L 96.79 32.422 L 92.231 32.422 Z M 111.622 24.26 C 111.622 22.967 111.868 21.786 112.361 20.718 C 112.854 19.651 113.526 18.742 114.378 17.992 C 115.231 17.242 116.212 16.663 117.32 16.251 C 118.429 15.841 119.599 15.635 120.832 15.635 C 122.065 15.635 123.301 15.846 124.421 16.266 C 125.54 16.688 126.516 17.273 127.347 18.022 C 128.178 18.771 128.836 19.675 129.319 20.732 C 129.8 21.789 130.042 22.965 130.042 24.259 C 130.042 25.552 129.795 26.759 129.304 27.816 C 128.811 28.874 128.144 29.778 127.301 30.527 C 126.459 31.277 125.479 31.856 124.36 32.268 C 123.241 32.678 122.065 32.884 120.833 32.884 C 119.601 32.884 118.395 32.673 117.275 32.253 C 116.156 31.831 115.18 31.241 114.349 30.481 C 113.517 29.721 112.855 28.814 112.362 27.755 C 111.869 26.697 111.624 25.532 111.624 24.259 Z M 125.484 24.26 C 125.484 22.864 125.058 21.745 124.205 20.902 C 123.353 20.061 122.229 19.64 120.833 19.64 C 120.155 19.64 119.529 19.754 118.954 19.978 C 118.378 20.204 117.886 20.517 117.475 20.918 C 117.064 21.319 116.746 21.807 116.521 22.381 C 116.294 22.957 116.182 23.582 116.182 24.26 C 116.182 24.938 116.294 25.56 116.521 26.124 C 116.746 26.689 117.07 27.177 117.49 27.587 C 117.912 27.998 118.403 28.316 118.969 28.542 C 119.534 28.768 120.155 28.88 120.833 28.88 C 121.511 28.88 122.136 28.768 122.712 28.542 C 123.286 28.316 123.779 28.003 124.191 27.602 C 124.601 27.201 124.919 26.714 125.146 26.139 C 125.372 25.565 125.484 24.938 125.484 24.26 Z M 131.692 15.629 L 136.066 15.629 L 136.066 17.976 L 136.128 17.976 C 136.413 17.358 137.616 16.328 138.561 16.051 C 139.491 15.776 140.456 15.636 141.426 15.635 C 142.658 15.635 143.787 15.861 144.815 16.313 C 145.841 16.765 146.729 17.382 147.479 18.161 C 148.229 18.942 148.814 19.855 149.235 20.902 C 149.656 21.95 149.866 23.069 149.866 24.26 C 149.866 25.451 149.655 26.632 149.235 27.679 C 148.814 28.727 148.228 29.635 147.479 30.406 C 146.729 31.175 145.836 31.782 144.8 32.223 C 143.762 32.664 142.638 32.885 141.427 32.885 C 141.037 32.885 140.601 32.849 140.118 32.778 C 139.638 32.706 139.164 32.598 138.701 32.454 C 138.245 32.313 137.802 32.133 137.377 31.915 C 136.955 31.699 136.601 31.448 136.314 31.161 L 136.252 31.161 L 136.252 39.354 L 131.694 39.354 L 131.694 15.629 Z M 145.306 24.26 C 145.306 22.864 144.885 21.75 144.044 20.918 C 143.201 20.087 142.082 19.671 140.686 19.671 C 140.193 19.671 139.685 19.754 139.162 19.916 C 138.65 20.075 138.166 20.314 137.73 20.626 C 137.308 20.924 136.947 21.3 136.668 21.735 C 136.391 22.166 136.251 22.659 136.251 23.214 L 136.251 25.278 C 136.251 25.997 136.461 26.623 136.882 27.157 C 137.302 27.691 137.832 28.102 138.469 28.388 C 139.126 28.717 139.875 28.881 140.717 28.881 C 142.092 28.881 143.201 28.455 144.044 27.603 C 144.885 26.75 145.306 25.636 145.306 24.261 Z" fill="currentColor"/>
                <path d="M 8.403 6.892 C 5.041 6.892 2.723 8.367 0.97 10.035 C 0.97 10.035 0.261 10.706 0.27 10.727 L 7.636 18.092 L 15 10.727 C 13.605 8.807 10.976 6.892 8.403 6.892 Z M 26.588 6.893 C 23.226 6.893 20.909 8.368 19.155 10.036 C 19.155 10.036 18.508 10.69 18.479 10.728 L 9.375 19.834 L 16.729 27.187 L 33.186 10.728 C 31.791 8.808 29.163 6.893 26.588 6.893 Z M 44.827 6.892 C 41.465 6.892 39.148 8.367 37.394 10.035 C 37.394 10.035 36.72 10.694 36.695 10.727 L 18.483 28.941 L 20.41 30.869 C 23.393 33.851 28.274 33.851 31.257 30.869 L 51.401 10.727 L 51.424 10.727 C 50.03 8.807 47.402 6.892 44.827 6.892 Z" fill="#FA4616"/>
              </svg>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent(DRAWER_TOGGLE_EVENT))}
                className="px-3.5 py-1.5 rounded-lg text-[14px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Portfolio
              </button>
            </nav>
          </div>

          {/* Right: balance + wallet button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isDesktop) window.dispatchEvent(new CustomEvent(DRAWER_TOGGLE_EVENT));
              }}
              className="hidden md:flex items-center gap-1.5 text-[13px] font-mono tabular-nums text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-zinc-600">Balance</span>
              <span className="text-white font-semibold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </button>
            {connected ? (
              <button
                onClick={handleWalletClick}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[14px] font-medium bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
              >
                {wallet?.icon && (
                  <img src={wallet.icon} alt="" className="w-4 h-4 rounded-[4px]" />
                )}
                {shortAddress}
                {isXChain && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-accent/15 text-accent leading-none">
                    X-CHAIN
                  </span>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleWalletClick}
                  className="hidden sm:block text-[14px] font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleWalletClick}
                  className="px-5 py-2 rounded-[10px] text-[14px] font-semibold bg-[#1754d8] text-white hover:bg-[#1e63e6] transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Wallet modals */}
      <WalletSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
      />
      <WalletAccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </>
  );
}

export function SignOutButton({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const isDark = variant === "dark";

  return (
    <button
      className={`flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
        isDark
          ? "text-white/40 bg-white/[0.06] hover:bg-white/10 hover:text-white/70"
          : "text-black/50 hover:text-black/70"
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      </svg>
      Sign out
    </button>
  );
}
