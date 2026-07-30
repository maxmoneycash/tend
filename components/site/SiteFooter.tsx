"use client";

import { usePathname } from "next/navigation";

/** The original landing carries its own footer; this one serves the app
 * surfaces and stays off "/" so the landing renders exactly as built. */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="mt-24 border-t border-black/[0.08] bg-[#efefef]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="font-display text-[24px] font-bold text-[#111111]">
          Tend the land you live on.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 text-[12px] leading-relaxed text-[#6b6b6b]">
          <p>
            Tend is a hackathon prototype (Auth0 × Stripe, July 2026). It is
            not affiliated with, or endorsed by, the Association of Ramaytush
            Ohlone or the Muwekma Ohlone Tribe — nothing launches in a
            tribe&apos;s name without that tribe&apos;s direction.
          </p>
          <p>
            Where territorial definitions differ, Tend shows every tribe whose
            published definition includes your county and lets you choose — it
            never arbitrates boundaries. Tend takes no platform fee; payment
            processing fees may apply.
          </p>
        </div>
        <div className="mt-8 pt-5 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#8a8a8a] uppercase tracking-wider">
          <span>Ramaytush &amp; Muwekma Ohlone land · San Francisco Bay</span>
          <span>humans pay by card · MPP prototype for machines</span>
        </div>
      </div>
    </footer>
  );
}
