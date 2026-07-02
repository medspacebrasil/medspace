"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const STORAGE_KEY = "medspace:cookie-consent:v1"

type Consent = {
  essential: true
  analytics: boolean
  marketing: boolean
  decidedAt: string
  version: string
}

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    return (JSON.parse(raw) as Consent).marketing === true
  } catch {
    return false
  }
}

/**
 * Meta (Facebook/Instagram) Pixel.
 *
 * Unlike Google, Meta has no consent-mode fallback, so we gate the *loading*
 * of the pixel on marketing consent from {@link CookieBanner} (LGPD). Until
 * the user accepts marketing cookies, fbq is never defined and the conversion
 * helpers in {@link lib/analytics} are silent no-ops.
 *
 * Inert until NEXT_PUBLIC_FB_PIXEL_ID is set — safe to ship before we have the
 * pixel id from the Meta account.
 */
export function MetaPixel() {
  const pathname = usePathname()
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    setConsented(hasMarketingConsent())
    function onConsentChange(e: Event) {
      setConsented((e as CustomEvent<Consent>).detail?.marketing === true)
    }
    window.addEventListener("cookie-consent-changed", onConsentChange)
    return () =>
      window.removeEventListener("cookie-consent-changed", onConsentChange)
  }, [])

  // Track client-side navigations as PageView. The initial load is sent by the
  // init script below, so skip the first render to avoid a duplicate.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!pathname) return
    window.fbq?.("track", "PageView")
  }, [pathname])

  if (!PIXEL_ID || !consented) return null

  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  )
}
