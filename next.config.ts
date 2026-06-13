import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows CI/sandbox builds to write somewhere other than .next
  // (e.g. NEXT_DIST_DIR=/tmp/paddockme-dist npx next build). Defaults to .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
