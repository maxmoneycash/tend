import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/rewards/:path*",
        destination: "/programs",
        permanent: true,
      },
      {
        source: "/campaigns/:path*",
        destination: "/programs",
        permanent: true,
      },
      {
        source: "/onboarding/:path*",
        destination: "/programs",
        permanent: true,
      },
      {
        source: "/variants",
        destination: "/programs",
        permanent: true,
      },
    ];
  },
  // TypeScript is checked separately via `npx tsc --noEmit`.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
