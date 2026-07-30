import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tend — a land tax for the land you live on",
  description:
    "Locate whose ancestral Ohlone land you live on and start a voluntary recurring land tax that goes 100% to the tribe. Humans pay by card; machines pay over Stripe MPP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <header className="mx-auto w-full max-w-4xl px-6 py-6 flex items-center justify-between">
          <a
            href="/"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Tend
          </a>
          <nav className="flex items-center gap-5 text-sm font-medium text-faded">
            <a href="/variants" className="hover:text-ink">
              Variants
            </a>
            <a href="/dashboard" className="hover:text-ink">
              Dashboards
            </a>
            <a href="/auth/login?returnTo=/dashboard" className="hover:text-ink">
              Tribal sign-in
            </a>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="rule mt-16">
          <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-faded space-y-2">
            <p>
              Tend is a hackathon prototype (Auth0 × Stripe, July 2026). It is
              not affiliated with, or endorsed by, the Association of Ramaytush
              Ohlone or the Muwekma Ohlone Tribe — nothing launches in a
              tribe&apos;s name without that tribe&apos;s direction.
            </p>
            <p>
              Where territorial definitions differ, Tend shows every tribe
              whose published definition includes your county and lets you
              choose — it never arbitrates boundaries. 100% of every
              contribution goes to the tribe; the platform takes nothing.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
