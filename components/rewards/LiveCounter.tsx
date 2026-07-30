"use client";

import { useEffect, useRef } from "react";

/**
 * LiveCounter — A real-time ticking earnings counter.
 *
 * Uses requestAnimationFrame to smoothly project earnings forward
 * based on a calculated velocity (octas/second). Updates the DOM
 * directly via ref to avoid React re-renders at 60fps.
 *
 * When new confirmed data arrives (baseValue changes), it snaps
 * to the confirmed value and continues projecting from there.
 */
export function LiveCounter({
  baseValue,
  velocity,
  lastUpdate,
  decimals = 2,
}: {
  baseValue: number;    // confirmed on-chain earnings (octas)
  velocity: number;     // projected earnings rate (octas per second)
  lastUpdate: number;   // timestamp (ms) when baseValue was confirmed
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (velocity <= 0) {
      if (ref.current) ref.current.textContent = (baseValue / 1e6).toFixed(decimals);
      return;
    }

    let raf: number;

    const tick = () => {
      const elapsedSec = (Date.now() - lastUpdate) / 1000;
      const projected = baseValue + velocity * elapsedSec;
      if (ref.current) {
        ref.current.textContent = (projected / 1e6).toFixed(decimals);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [baseValue, velocity, lastUpdate, decimals]);

  return <span ref={ref}>{(baseValue / 1e6).toFixed(decimals)}</span>;
}

/**
 * PendingCounter — Shows earnings accumulating since the last on-chain settlement.
 *
 * Starts from $0.000000 and ticks up, making the velocity visually obvious
 * even when the total is large. Resets to 0 each time the keeper confirms
 * a new payout on-chain.
 */
export function PendingCounter({
  velocity,
  lastUpdate,
}: {
  velocity: number;     // octas per second
  lastUpdate: number;   // timestamp (ms) when last settlement was confirmed
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (velocity <= 0) {
      if (ref.current) ref.current.textContent = "0.000000";
      return;
    }

    let raf: number;

    const tick = () => {
      const elapsedSec = (Date.now() - lastUpdate) / 1000;
      const pending = velocity * elapsedSec;
      if (ref.current) {
        ref.current.textContent = (pending / 1e6).toFixed(6);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [velocity, lastUpdate]);

  return <span ref={ref}>0.000000</span>;
}

/**
 * Calculate earnings velocity from evidence pack history.
 *
 * Groups packs by submission, computes view velocity per submission,
 * then converts to earnings rate using the campaign's CPM rate.
 *
 * Returns octas per second (after 5% platform fee).
 */
export function calculateEarningsVelocity(
  packs: { submissionAddress: string | null; viewCount: number | null; generatedAt: string }[],
  cpmRate: number, // octas per 1000 views
): { octasPerSecond: number; viewsPerSecond: number; viewsPerHour: number } {
  if (packs.length < 2 || cpmRate <= 0) {
    return { octasPerSecond: 0, viewsPerSecond: 0, viewsPerHour: 0 };
  }

  // Sort chronologically
  const sorted = [...packs]
    .filter(p => p.viewCount != null)
    .sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

  if (sorted.length < 2) {
    return { octasPerSecond: 0, viewsPerSecond: 0, viewsPerHour: 0 };
  }

  // Group by submission
  const bySubmission = new Map<string, typeof sorted>();
  for (const p of sorted) {
    const key = p.submissionAddress || "unknown";
    if (!bySubmission.has(key)) bySubmission.set(key, []);
    bySubmission.get(key)!.push(p);
  }

  let totalViewsPerSecond = 0;

  for (const [, subPacks] of bySubmission) {
    if (subPacks.length < 2) continue;

    // Use last 10 packs for this submission to calculate average velocity
    const recent = subPacks.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const viewDelta = (last.viewCount || 0) - (first.viewCount || 0);
    const timeDelta = (new Date(last.generatedAt).getTime() - new Date(first.generatedAt).getTime()) / 1000;

    if (timeDelta > 0 && viewDelta > 0) {
      totalViewsPerSecond += viewDelta / timeDelta;
    }
  }

  // Convert views/sec to octas/sec: (views/sec) * (cpmRate octas / 1000 views)
  // Apply 5% platform fee: creator gets 95%
  const octasPerSecond = (totalViewsPerSecond * cpmRate / 1000) * 0.95;

  return {
    octasPerSecond,
    viewsPerSecond: totalViewsPerSecond,
    viewsPerHour: totalViewsPerSecond * 3600,
  };
}
