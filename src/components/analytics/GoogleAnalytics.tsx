"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

const GA_ID = "G-XMBZHGMXEH"
const STORAGE_KEY = "medspace:cookie-consent:v1"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type Consent = {
  essential: true
  analytics: boolean
  marketing: boolean
  decidedAt: string
}

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Consent
  } catch {
    return null
  }
}

/**
 * Google Analytics (GA4) gated by the cookie banner consent (LGPD).
 *
 * Uses Google Consent Mode v2: gtag loads but starts with all storage
 * "denied". When the user accepts analytics/marketing cookies in
 * {@link CookieBanner}, a "cookie-consent-changed" event upgrades the
 * relevant consent flags. Stored consent is re-applied on every load.
 */
export function GoogleAnalytics() {
  const pathname = usePathname()

  // Sync consent state with the cookie banner.
  useEffect(() => {
    function applyConsent(consent: Consent | null) {
      window.gtag?.("consent", "update", {
        analytics_storage: consent?.analytics ? "granted" : "denied",
        ad_storage: consent?.marketing ? "granted" : "denied",
        ad_user_data: consent?.marketing ? "granted" : "denied",
        ad_personalization: consent?.marketing ? "granted" : "denied",
      })
    }

    applyConsent(readConsent())

    function onConsentChange(e: Event) {
      applyConsent((e as CustomEvent<Consent>).detail)
    }
    window.addEventListener("cookie-consent-changed", onConsentChange)
    return () =>
      window.removeEventListener("cookie-consent-changed", onConsentChange)
  }, [])

  // Send a page_view on client-side navigation. The initial load is sent
  // by gtag's own config call below, so skip the first render to avoid a
  // duplicate (and to avoid losing it to a gtag-not-ready-yet race).
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!pathname) return
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  )
}
