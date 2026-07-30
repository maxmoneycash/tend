import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tend — a land tax for the land you live on",
  description:
    "Find Indigenous-led contribution programs connected to where you live. Humans can contribute by card; machines can pay over Stripe MPP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Figtree:wght@500;600&family=Geist+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <header
          className="sticky top-0 z-50"
          style={{
            background: "rgba(21,21,21,0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-3.5 flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-[19px] font-bold tracking-tight text-white"
            >
              Tend
              <span className="text-[#FA4616]">.</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/programs"
                className="px-3.5 py-2 rounded-lg text-[12px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
              >
                Programs
              </Link>
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-lg text-[12px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
              >
                Dashboards
              </Link>
              <Link
                href="/variants"
                className="px-3.5 py-2 rounded-lg text-[12px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
              >
                Variants
              </Link>
              <a
                href="/auth/login?returnTo=/dashboard"
                className="ml-2 bg-[#1754d8] text-white hover:bg-[#1e63e6] px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              >
                Tribal sign-in
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-24 border-t border-white/[0.06] bg-[#0f0f0f]">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <p className="font-display text-[24px] font-bold text-white">
              Tend the land you live on.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 text-[12px] leading-relaxed text-zinc-500">
              <p>
                Tend is a hackathon prototype (Auth0 × Stripe, July 2026). It
                is not affiliated with, or endorsed by, the Association of
                Ramaytush Ohlone or the Muwekma Ohlone Tribe — nothing
                launches in a tribe&apos;s name without that tribe&apos;s
                direction.
              </p>
              <p>
                Where territorial definitions differ, Tend shows every tribe
                whose published definition includes your county and lets you
                choose — it never arbitrates boundaries. Tend takes no
                platform fee; payment processing fees may apply.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
              <span>Ramaytush &amp; Muwekma Ohlone land · San Francisco Bay</span>
              <span>humans pay by card · machines pay by MPP</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
