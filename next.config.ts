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
  // googleadservices/doubleclick/googlesyndication: pings de conversão do
  // Google Ads (AW-*) — sem eles o gtag carrega mas a conversão é bloqueada.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.googlesyndication.com https://*.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.google.com.br`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://viacep.com.br https://*.googlesyndication.com https://*.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.google.com.br`,
  `frame-src 'self' https://td.doubleclick.net https://www.googletagmanager.com`,
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
  // Turbopack was inferring d:\Projects as workspace root, breaking
  // resolution of `@import "tailwindcss"` in globals.css. Pin the root
  // to this package (dev/build always run from the package dir).
  turbopack: {
    root: process.cwd(),
  },
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
