import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV !== "production"

/**
 * Content Security Policy.
 *
 * Next.js (App Router) and our inline GA bootstrap script require
 * 'unsafe-inline' for script-src; in dev, React Fast Refresh also needs
 * 'unsafe-eval'. External origins are limited to what the app actually uses:
 * Supabase (DB images/storage), Google Analytics/Tag Manager and ViaCEP
 * (CEP lookup in the signup form).
 *
 * Hardening path (not done here to avoid breaking SSR/streaming without a
 * full deploy test): switch to a nonce-based CSP generated in middleware.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://viacep.com.br`,
  `frame-src 'self'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Defense-in-depth against clickjacking (frame-ancestors above is the modern equivalent)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
