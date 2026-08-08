import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  /**
   * Serve from the apex only.
   *
   * `lib/site.ts` sets the canonical host, and every canonical tag, sitemap
   * entry, RSS link, and og:url is built from it. If www also serves 200 then
   * both hosts answer for every page and the signals split. Vercel's dashboard
   * can do this as a domain-level redirect, which is marginally better because
   * it never reaches the app — this lives here so the rule is version
   * controlled and survives a dashboard change. Having both is harmless.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nithishkannanm.com" }],
        destination: "https://nithishkannanm.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
