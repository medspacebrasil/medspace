/**
 * Client-side conversion tracking for the ad campaigns (Google Ads + Meta).
 *
 * Google Ads conversions go through gtag and automatically respect Google
 * Consent Mode v2 (configured in {@link GoogleAnalytics}): without marketing
 * consent, gtag sends cookieless/modeled pings instead of cookie-based ones.
 *
 * Meta Pixel events only do something once the pixel is loaded, and
 * {@link MetaPixel} only loads it after the user grants marketing consent in
 * the cookie banner. So `window.fbq?.(...)` is a natural no-op without
 * consent — LGPD-safe by construction.
 *
 * IDs/labels below are public (they ship in the page source anyway), so they
 * live in code like the GA measurement id.
 */

const GOOGLE_ADS_ID = "AW-18129650685"

const ADS_CONVERSIONS = {
  // "Clique WhatsApp" — lead de médico (demanda).
  whatsappLead: `${GOOGLE_ADS_ID}/HElDCNGWqskcEP2H8sRD`,
  // "Cadastro" — cadastro de clínica/anunciante (oferta).
  registration: `${GOOGLE_ADS_ID}/Jh9oCJ7dwskcEP2H8sRD`,
} as const

declare global {
  interface Window {
    // gtag is declared in GoogleAnalytics.tsx; fbq is injected by MetaPixel.
    fbq?: (...args: unknown[]) => void
  }
}

/** Lead de médico — disparado no clique do botão de WhatsApp de um anúncio. */
export function trackWhatsAppLead() {
  if (typeof window === "undefined") return
  window.gtag?.("event", "conversion", { send_to: ADS_CONVERSIONS.whatsappLead })
  window.fbq?.("track", "Lead")
}

/** Cadastro de anunciante — disparado quando a tela de sucesso do cadastro aparece. */
export function trackRegistration() {
  if (typeof window === "undefined") return
  window.gtag?.("event", "conversion", { send_to: ADS_CONVERSIONS.registration })
  window.fbq?.("track", "CompleteRegistration")
}
