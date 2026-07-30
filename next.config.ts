import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Mirrors the shelby-content-rewards build config — the ported component
  // tree was written under this flag. Tend's own files are typechecked
  // separately via `npx tsc --noEmit`.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
