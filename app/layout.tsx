import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { RevealManager } from "@/components/site/RevealManager";

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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&family=Spline+Sans+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <RevealManager />
        <header className="mx-auto w-full max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-[1.55rem] font-extrabold tracking-tight leading-none"
          >
            Tend
            <span className="text-tide">.</span>
          </Link>
          <nav className="flex items-center gap-6 font-display text-sm font-semibold">
            <Link href="/dashboard" className="text-faded hover:text-ink">
              Dashboards
            </Link>
            <Link href="/variants" className="text-faded hover:text-ink">
              Variants
            </Link>
            <a
              href="/auth/login?returnTo=/dashboard"
              className="text-faded hover:text-ink"
            >
              Tribal sign-in
            </a>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="band noise mt-24">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <p className="display-2">
              Tend the land
              <br />
              you live on.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 text-[0.95rem] leading-relaxed opacity-90">
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
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-paper/25 pt-5 font-display text-xs font-medium opacity-75">
              <span>Ramaytush &amp; Muwekma Ohlone land · San Francisco Bay</span>
              <span>humans pay by card · machines pay by MPP</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
