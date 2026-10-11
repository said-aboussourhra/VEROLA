import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Who may embed the site in a frame.
 * - Production: only this site, unless FRAME_ANCESTORS lists other origins
 *   (space separated, e.g. "https://preview.example.com").
 * - Development / live preview: any origin, so the preview can be shown.
 */
const frameAncestors =
  process.env.FRAME_ANCESTORS?.trim() || (isProd ? "'self'" : "*");

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + (isProd ? "" : " 'unsafe-eval'"),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      `frame-ancestors ${frameAncestors}`,
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Allow the sandbox live-preview domains to load dev assets and HMR.
  allowedDevOrigins: ["*.e2b.app"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
