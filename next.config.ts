import type { NextConfig } from "next";

const indexingEnabled = process.env.SEO_INDEX === "true";

const nextConfig: NextConfig = {
  async headers() {
    const privateRules = [
      {
        source: "/santa-admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];

    if (indexingEnabled) return privateRules;

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      ...privateRules,
    ];
  },
};

export default nextConfig;
