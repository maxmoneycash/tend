import type { Metadata } from "next";
import {
  Figtree,
  Geist_Mono,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Tend | Ohlone giving program guide",
  description:
    "Explore demonstration listings for Indigenous-led contribution programs and preview the test-mode donation flow.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${inter.variable} ${spaceGrotesk.variable} ${figtree.variable} ${geistMono.variable}`}
      lang="en"
    >
      <body className="min-h-screen flex flex-col antialiased">
        <main className="flex-1">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}
