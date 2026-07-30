"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type { AuthMessage } from "@/lib/rewards-siwa";
import type {
  Submission,
  KeeperLog,
  KeeperState,
  Clipper,
  PayoutTx,
  Campaign,
} from "@/lib/rewards-types";
import {
  mkSub,
  mkLogs,
  sh,
  generateTxHash,
  fmtUSD,
  MOCK_CLIPPERS,
} from "@/lib/rewards-mock";
import { dispatchTxToast } from "@/components/ui/TxToast";
import { dispatchPortfolioActivity } from "@/lib/portfolio-events";

type RewardsMode = "mock" | "api";

interface RewardsContextType {
  subs: Submission[];
  keeper: KeeperState;
  logs: KeeperLog[];
  totalEarned: number;
  totalViews: number;
  totalPacks: number;
  flaggedCount: number;
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  clippers: Clipper[];
  payoutTxs: PayoutTx[];
  handlePayout: (idx: number) => void;
  payingIdx: number | null;
  loading: boolean;
  mode: RewardsMode;
  apiAvailable: boolean;
  walletAddress: string;
  walletConnected: boolean;
  authStatus: "idle" | "signing" | "verifying" | "authenticated" | "error";
}

const RewardsContext = createContext<RewardsContextType | null>(null);

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error("useRewards must be within RewardsProvider");
  return ctx;
}

/* ─── SIWA helpers ────────────────────────────── */

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

/* ─── Auth + fetch helpers ─────────────────────── */

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
}

/* ─── API helpers ──────────────────────────────── */

async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/rewards/health", { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok" && data.database === true;
  } catch {
    return false;
  }
}

async function apiFetchCampaigns(): Promise<Campaign[]> {
  const res = await apiFetch("/api/rewards/campaigns");
  if (!res.ok) return [];
  return res.json();
}

async function apiFetchSubmissions(): Promise<Submission[]> {
  const res = await apiFetch("/api/rewards/me/submissions");
  if (!res.ok) return [];
  return res.json();
}

async function apiFetchKeeperStatus(): Promise<KeeperState | null> {
  const res = await apiFetch("/api/rewards/keeper/status");
  if (!res.ok) return null;
  return res.json();
}

async function apiCreateCampaign(c: Campaign): Promise<Campaign | null> {
  const res = await apiFetch("/api/rewards/campaigns", {
    method: "POST",
    body: JSON.stringify(c),
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiClaimPayout(submissionId: string): Promise<PayoutTx | null> {
  const res = await apiFetch(`/api/rewards/submissions/${submissionId}/claim`, {
    method: "POST",
  });
  if (!res.ok) return null;
  return res.json();
}

/* ─── Provider ─────────────────────────────────── */

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { connected, account, signMessage } = useWallet();
  const walletAddress = account?.address?.toString() ?? "";

  const [authStatus, setAuthStatus] = useState<
    "idle" | "signing" | "verifying" | "authenticated" | "error"
  >("idle");
  const [mode, setMode] = useState<RewardsMode>("mock");
  const [apiAvailable, setApiAvailable] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [logs, setLogs] = useState<KeeperLog[]>([]);
  const [keeper, setKeeper] = useState<KeeperState>({
    polling: false,
    cycle: 0,
    reports: 0,
  });
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalPacks, setTotalPacks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clippers, setClippers] = useState<Clipper[]>(MOCK_CLIPPERS);
  const [payoutTxs, setPayoutTxs] = useState<PayoutTx[]>([]);
  const [payingIdx, setPayingIdx] = useState<number | null>(null);
  const clippersRef = useRef(clippers);
  clippersRef.current = clippers;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  /* ─── Health check on mount ──────────────────── */

  useEffect(() => {
    let cancelled = false;
    checkApiHealth().then((ok) => {
      if (cancelled) return;
      setApiAvailable(ok);
      if (ok) setMode("api");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Auto-auth: SIWA when wallet connected ──── */

  useEffect(() => {
    if (!connected || !walletAddress || !account?.publicKey) return;
    // Already have a token
    if (localStorage.getItem(STORAGE_KEY)) {
      setAuthStatus("authenticated");
      return;
    }

    let cancelled = false;

    async function doSiwa() {
      try {
        setAuthStatus("signing");

        // 1. Fetch nonce
        const nonceRes = await fetch(
          `/api/rewards/auth/nonce?address=${encodeURIComponent(walletAddress)}`
        );
        if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
        const { nonce, message: authMessage } = (await nonceRes.json()) as {
          nonce: string;
          message: AuthMessage;
        };

        if (cancelled) return;

        // 2. Sign message
        const serialized = serializeAuthMessage(authMessage);
        const signResult = await signMessage({
          message: serialized,
          nonce,
        });

        const signatureHex =
          typeof signResult.signature === "string"
            ? signResult.signature
            : signResult.signature.toString();

        const publicKeyHex = Array.isArray(account!.publicKey)
          ? account!.publicKey[0].toString()
          : account!.publicKey.toString();

        if (cancelled) return;

        // 3. Verify and get JWT
        setAuthStatus("verifying");
        const verifyRes = await fetch("/api/rewards/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: walletAddress,
            message: authMessage,
            signature: signatureHex,
            publicKey: publicKeyHex,
          }),
        });

        if (!verifyRes.ok) throw new Error("Verification failed");
        const { token } = (await verifyRes.json()) as { token: string };

        if (cancelled) return;

        localStorage.setItem(STORAGE_KEY, token);
        setAuthStatus("authenticated");
      } catch {
        if (!cancelled) setAuthStatus("error");
      }
    }

    doSiwa();
    return () => {
      cancelled = true;
    };
  }, [connected, walletAddress, account?.publicKey, signMessage]);

  /* ─── Mock init ──────────────────────────────── */

  useEffect(() => {
    if (mode !== "mock") return;

    const timer = setTimeout(() => {
      const initial = Array.from({ length: 5 }, (_, x) => mkSub(x));
      setSubs(initial);
      setTotalEarned(initial.reduce((s, x) => s + x.earned, 0));
      setTotalViews(initial.reduce((s, x) => s + x.views, 0));
      setTotalPacks(initial.length * 3);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [mode]);

  /* ─── API init ───────────────────────────────── */

  useEffect(() => {
    if (mode !== "api") return;
    let cancelled = false;

    async function load() {
      const [apiSubs, apiCampaigns] = await Promise.all([
        apiFetchSubmissions(),
        apiFetchCampaigns(),
      ]);
      if (cancelled) return;

      setSubs(apiSubs);
      setCampaigns(apiCampaigns);
      setTotalEarned(apiSubs.reduce((s, x) => s + x.earned, 0));
      setTotalViews(apiSubs.reduce((s, x) => s + x.views, 0));
      setTotalPacks(apiSubs.length);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  /* ─── Mock keeper loop ───────────────────────── */

  useEffect(() => {
    if (mode !== "mock" || loading) return;

    const iv = setInterval(() => {
      setKeeper((k) => ({ ...k, polling: true, cycle: k.cycle + 1 }));

      setSubs((prev) => {
        if (!prev.length) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const s = { ...prev[idx] };
        const nv = Math.floor(Math.random() * 3000) + 200;
        s.prevViews = s.views;
        s.views += nv;
        s.earned = +((s.views / 1000) * 2).toFixed(2);
        s.botScore = Math.max(
          0,
          Math.min(100, s.botScore + Math.floor(Math.random() * 5) - 2)
        );
        s.status =
          s.botScore >= 85
            ? "flagged"
            : s.views > 50000
              ? "approved"
              : "processing";
        s.evidenceHash = "sha256:" + sh();
        s.txHash = generateTxHash();
        s.shelbyBlob = `cr/evidence/${sh().slice(0, 8)}/${Date.now()}.json`;
        s.lastUpdate = Date.now();

        const newLogs = mkLogs(s).map((l, i) => ({
          ...l,
          id: Date.now() + i,
          ts: new Date().toISOString().slice(11, 19),
        }));
        setLogs((p) => [...p.slice(-50), ...newLogs]);
        setTotalViews((v) => v + nv);
        setTotalEarned((e) => e + (nv / 1000) * 2);
        setTotalPacks((p) => p + 1);

        const n = [...prev];
        n[idx] = s;
        return n;
      });

      setTimeout(
        () => setKeeper((k) => ({ ...k, polling: false, reports: k.reports + 1 })),
        1200
      );
    }, 4000);
    return () => clearInterval(iv);
  }, [mode, loading]);

  /* ─── API keeper polling ─────────────────────── */

  useEffect(() => {
    if (mode !== "api" || loading) return;

    const iv = setInterval(async () => {
      const [status, apiSubs] = await Promise.all([
        apiFetchKeeperStatus(),
        apiFetchSubmissions(),
      ]);

      if (modeRef.current !== "api") return;

      if (status) {
        setKeeper(status);
      }
      if (apiSubs) {
        setSubs(apiSubs);
        setTotalEarned(apiSubs.reduce((s, x) => s + x.earned, 0));
        setTotalViews(apiSubs.reduce((s, x) => s + x.views, 0));
        setTotalPacks(apiSubs.length);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [mode, loading]);

  const flaggedCount = subs.filter((s) => s.botScore >= 85).length;

  /* ─── addCampaign ────────────────────────────── */

  const addCampaign = useCallback(
    (c: Campaign) => {
      if (modeRef.current === "api") {
        apiCreateCampaign(c).then((created) => {
          if (created) {
            setCampaigns((prev) => [...prev, created]);
          }
        });
      } else {
        setCampaigns((prev) => [
          ...prev,
          {
            ...c,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: "active",
            paid: 0,
            views: 0,
            subsCount: 0,
          },
        ]);
      }
    },
    []
  );

  /* ─── handlePayout ───────────────────────────── */

  const handlePayout = useCallback(
    (idx: number) => {
      const c = clippersRef.current[idx];
      if (c.paid || payingIdx !== null) return;

      setPayingIdx(idx);

      if (modeRef.current === "api") {
        // In API mode, POST to claim endpoint using clipper name as submission ID
        apiClaimPayout(c.handle).then((result) => {
          if (result) {
            setPayoutTxs((prev) => [result, ...prev]);
            setClippers((prev) =>
              prev.map((cc, i) => (i === idx ? { ...cc, paid: true } : cc))
            );

            dispatchTxToast({
              type: "payout",
              title: `Paid ${c.name}`,
              amount: fmtUSD(c.earned),
              subtitle: `${c.handle} \u2014 USDT on Aptos`,
              icon: "check",
            });

            dispatchPortfolioActivity({
              type: "Transfer",
              amount: -c.earned,
              hash: result.txHash,
            });
          }
          setPayingIdx(null);
        });
      } else {
        // Mock payout
        setTimeout(() => {
          const tx: PayoutTx = {
            id: crypto.randomUUID(),
            clipper: c.name,
            amount: c.earned,
            txHash: generateTxHash(),
            timestamp: Date.now(),
            status: "pending",
          };
          setPayoutTxs((prev) => [tx, ...prev]);

          setTimeout(() => {
            setPayoutTxs((prev) =>
              prev.map((t) =>
                t.id === tx.id ? { ...t, status: "confirmed" as const } : t
              )
            );
            setClippers((prev) =>
              prev.map((cc, i) => (i === idx ? { ...cc, paid: true } : cc))
            );
            setPayingIdx(null);

            dispatchTxToast({
              type: "payout",
              title: `Paid ${c.name}`,
              amount: fmtUSD(c.earned),
              subtitle: `${c.handle} \u2014 USDT on Aptos`,
              icon: "check",
            });

            dispatchPortfolioActivity({
              type: "Transfer",
              amount: -c.earned,
              hash: tx.txHash,
            });
          }, 1500);
        }, 800);
      }
    },
    [payingIdx]
  );

  return (
    <RewardsContext.Provider
      value={{
        subs,
        keeper,
        logs,
        totalEarned,
        totalViews,
        totalPacks,
        flaggedCount,
        campaigns,
        addCampaign,
        clippers,
        payoutTxs,
        handlePayout,
        payingIdx,
        loading,
        mode,
        apiAvailable,
        walletAddress,
        walletConnected: connected,
        authStatus,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}
