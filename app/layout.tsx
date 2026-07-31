import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Tend — a land tax for the land you live on",
  description:
    "Explore demonstration listings for Indigenous-led contribution programs and preview the test-mode donation flow.",
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
        <main className="flex-1">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}
