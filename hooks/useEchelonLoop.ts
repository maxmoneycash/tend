"use client";

import { useState, useCallback, useRef } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { buildAndSign } from "@/lib/tx-utils";
import { previewLoop, calculateNetApy } from "@/lib/echelon-loop";
import { ECHELON_MARKETS, ECHELON_EMODE_LTV, ECHELON_SAFETY_MARGIN, ECHELON_EMODE_ID } from "@/lib/constants";
import type { TimelineStep } from "@/components/demo/TransactionTimeline";
import type { LoopIteration } from "@/lib/echelon-loop";

export interface LoopPreviewResult {
  totalSupplied: number;
  totalBorrowed: number;
  effectiveLeverage: number;
  netApy: number;
  healthFactor: number;
  iterations: LoopIteration[];
  amplifiedYieldPerDay: number;
}

export type LoopStatus = "idle" | "previewing" | "running" | "done" | "error" | "unwinding";

export function useEchelonLoop() {
  const { signAndSubmitTransaction } = useWallet();
  const [status, setStatus] = useState<LoopStatus>("idle");
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [preview, setPreview] = useState<LoopPreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const updateStep = (index: number, update: Partial<TimelineStep>) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...update } : s)));
  };

  /**
   * Preview a loop (pure math, no wallet interaction).
   */
  const previewLoopConfig = useCallback(
    async (market: string, amount: number, loops: number) => {
      setStatus("previewing");
      setError(null);

      try {
        // Fetch real rates from Echelon mainnet
        const ratesRes = await fetch("/api/echelon/rates");
        const ratesData = await ratesRes.json();
        const marketRate = ratesData.rates?.find(
          (r: { symbol: string }) => r.symbol === market
        );

        const supplyApr = marketRate?.supplyApr ?? 5;
        const borrowApr = marketRate?.borrowApr ?? 8;

        const result = previewLoop({
          initialAmount: amount,
          targetLoops: loops,
          ltv: ECHELON_EMODE_LTV,
          safetyMargin: ECHELON_SAFETY_MARGIN,
          supplyApr,
          borrowApr,
        });

        const previewResult: LoopPreviewResult = {
          totalSupplied: result.totalSupplied,
          totalBorrowed: result.totalBorrowed,
          effectiveLeverage: result.effectiveLeverage,
          netApy: result.netApy,
          healthFactor: result.healthFactor,
          iterations: result.iterations,
          amplifiedYieldPerDay: result.amplifiedYieldPerDay,
        };

        setPreview(previewResult);
        setStatus("idle");
        return previewResult;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Preview failed";
        setError(msg);
        setStatus("error");
        return null;
      }
    },
    []
  );

  /**
   * Execute the loop — sequential wallet signing for each step.
   * Each step: supply → borrow (repeated N times), then final supply.
   * If user rejects any tx, loop stops safely.
   */
  const executeLoop = useCallback(
    async (market: string, amount: number, loops: number) => {
      if (!preview) return;
      abortRef.current = false;
      setStatus("running");
      setError(null);

      const marketAddr = ECHELON_MARKETS[market as keyof typeof ECHELON_MARKETS];
      if (!marketAddr) {
        setError(`Unknown market: ${market}`);
        setStatus("error");
        return;
      }

      const decimals = 6; // USDT/USDC = 6 decimals
      const toRaw = (humanAmount: number) => String(Math.floor(humanAmount * 10 ** decimals));

      // Build step list
      const stepList: TimelineStep[] = [
        { name: "Activate E-Mode (Stablecoin)", status: "pending" },
      ];
      for (let i = 0; i < loops; i++) {
        stepList.push({ name: `Loop ${i + 1}: Supply ${market}`, status: "pending" });
        stepList.push({ name: `Loop ${i + 1}: Borrow ${market}`, status: "pending" });
      }
      stepList.push({ name: `Final Supply ${market}`, status: "pending" });
      setSteps(stepList);

      let stepIndex = 0;

      // Helper to execute a single step
      const execStep = async (apiUrl: string, body: Record<string, unknown>) => {
        if (abortRef.current) throw new Error("Loop cancelled");
        updateStep(stepIndex, { status: "running" });
        try {
          const { hash } = await buildAndSign(apiUrl, body, signAndSubmitTransaction);
          updateStep(stepIndex, { status: "done", txHash: hash });
          stepIndex++;
          return hash;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transaction failed";
          updateStep(stepIndex, { status: "error", message: msg });
          throw err;
        }
      };

      try {
        // Step 0: Set E-Mode
        await execStep("/api/echelon/set-emode", { emodeId: ECHELON_EMODE_ID });

        // Loop iterations
        let currentAmount = amount;
        for (let i = 0; i < loops; i++) {
          // Supply
          await execStep("/api/echelon/supply", {
            market: marketAddr,
            amount: toRaw(currentAmount),
          });

          // Borrow
          const borrowAmount = currentAmount * ECHELON_EMODE_LTV * ECHELON_SAFETY_MARGIN;
          await execStep("/api/echelon/borrow", {
            market: marketAddr,
            amount: toRaw(borrowAmount),
          });

          currentAmount = borrowAmount;
        }

        // Final supply of last borrowed amount
        await execStep("/api/echelon/supply", {
          market: marketAddr,
          amount: toRaw(currentAmount),
        });

        setStatus("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Loop execution failed";
        setError(msg);
        setStatus("error");
      }
    },
    [preview, signAndSubmitTransaction]
  );

  /**
   * Unwind the loop — reverse order: repay → withdraw for each iteration.
   */
  const unwindLoop = useCallback(
    async (market: string, loops: number) => {
      abortRef.current = false;
      setStatus("unwinding");
      setError(null);

      const marketAddr = ECHELON_MARKETS[market as keyof typeof ECHELON_MARKETS];
      if (!marketAddr) {
        setError(`Unknown market: ${market}`);
        setStatus("error");
        return;
      }

      // Build unwind step list (reverse of loop)
      const stepList: TimelineStep[] = [];
      for (let i = loops; i >= 1; i--) {
        stepList.push({ name: `Unwind ${i}: Repay ${market}`, status: "pending" });
        stepList.push({ name: `Unwind ${i}: Withdraw ${market}`, status: "pending" });
      }
      stepList.push({ name: `Final Withdraw ${market}`, status: "pending" });
      setSteps(stepList);

      let stepIndex = 0;

      const execStep = async (apiUrl: string, body: Record<string, unknown>) => {
        if (abortRef.current) throw new Error("Unwind cancelled");
        updateStep(stepIndex, { status: "running" });
        try {
          const { hash } = await buildAndSign(apiUrl, body, signAndSubmitTransaction);
          updateStep(stepIndex, { status: "done", txHash: hash });
          stepIndex++;
          return hash;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transaction failed";
          updateStep(stepIndex, { status: "error", message: msg });
          throw err;
        }
      };

      try {
        // Repay all + withdraw all for each loop iteration (reverse order)
        for (let i = loops; i >= 1; i--) {
          await execStep("/api/echelon/repay", { market: marketAddr, amount: "all" });
          await execStep("/api/echelon/withdraw", { market: marketAddr, amount: "all" });
        }
        // Final withdraw
        await execStep("/api/echelon/withdraw", { market: marketAddr, amount: "all" });

        setStatus("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unwind failed";
        setError(msg);
        setStatus("error");
      }
    },
    [signAndSubmitTransaction]
  );

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setSteps([]);
    setPreview(null);
    setError(null);
    abortRef.current = false;
  }, []);

  return {
    status,
    steps,
    preview,
    error,
    previewLoopConfig,
    executeLoop,
    unwindLoop,
    cancel,
    reset,
    calculateNetApy,
  };
}
