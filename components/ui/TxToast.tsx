"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const TX_TOAST_EVENT = "whop:tx-toast";

export interface TxToastDetail {
  type: "deposit" | "payout" | "split" | "trade";
  title: string;
  amount: string;
  subtitle?: string;
  icon?: "arrow-down" | "check" | "split" | "zap";
}

export function dispatchTxToast(detail: TxToastDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TX_TOAST_EVENT, { detail }));
}

function ToastIcon({ icon, type }: { icon?: TxToastDetail["icon"]; type: TxToastDetail["type"] }) {
  const color =
    type === "deposit" ? "text-green-400 bg-green-400/10" :
    type === "payout" ? "text-[#8B5CF6] bg-[#8B5CF6]/10" :
    type === "split" ? "text-blue-400 bg-blue-400/10" :
    "text-[#FA4616] bg-[#FA4616]/10";

  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {(icon === "check" || type === "payout") ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (icon === "split" || type === "split") ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
      )}
    </div>
  );
}

interface ToastItem extends TxToastDetail {
  id: string;
  phase: "enter" | "visible" | "exit";
}

function ToastCard({ toast, onDone }: { toast: ToastItem; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast.phase === "exit") {
      const el = ref.current;
      if (!el) return;
      el.style.animation = "toast-exit 0.25s ease-in forwards";
      const onEnd = () => onDone();
      el.addEventListener("animationend", onEnd);
      return () => el.removeEventListener("animationend", onEnd);
    }
  }, [toast.phase, onDone]);

  return (
    <div
      ref={ref}
      style={{ animation: "toast-enter 0.3s ease-out forwards" }}
      className="px-4 py-3 rounded-2xl border border-white/[0.08] bg-[#1a1a1a] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 min-w-[280px] max-w-[380px] pointer-events-auto"
    >
      <ToastIcon icon={toast.icon} type={toast.type} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-white truncate">{toast.title}</div>
        {toast.subtitle && (
          <div className="text-[11px] text-zinc-500 truncate">{toast.subtitle}</div>
        )}
      </div>
      <span className={`text-[14px] font-mono font-bold shrink-0 ${
        toast.type === "deposit" ? "text-green-400" :
        toast.type === "payout" ? "text-[#8B5CF6]" :
        "text-white"
      }`}>
        {toast.amount}
      </span>
    </div>
  );
}

export function TxToastProvider() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [queue, setQueue] = useState<ToastItem[]>([]);

  const handleToast = useCallback((e: Event) => {
    const detail = (e as CustomEvent<TxToastDetail>).detail;
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setQueue((prev) => [...prev, { ...detail, id, phase: "enter" as const }]);

    // Mark visible
    requestAnimationFrame(() => {
      setQueue((prev) =>
        prev.map((t) => (t.id === id && t.phase === "enter" ? { ...t, phase: "visible" as const } : t))
      );
    });

    // Start exit after 3s
    setTimeout(() => {
      setQueue((prev) =>
        prev.map((t) => (t.id === id ? { ...t, phase: "exit" as const } : t))
      );
    }, 3000);
  }, []);

  useEffect(() => {
    window.addEventListener(TX_TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TX_TOAST_EVENT, handleToast);
  }, [handleToast]);

  // On mobile, toasts are handled by PortfolioSheet — skip rendering
  if (isMobile) return null;

  return (
    <>
      <style>{`
        @keyframes toast-enter {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-exit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
      `}</style>
      <div
        className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-start gap-2 p-4 pointer-events-none"
        style={{ pointerEvents: "none" }}
      >
        {queue.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDone={() => setQueue((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </>
  );
}
