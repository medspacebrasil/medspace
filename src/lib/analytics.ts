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

export const GA_MEASUREMENT_ID = "G-XMBZHGMXEH"
export const GOOGLE_ADS_ID = "AW-18151653017"

const ADS_CONVERSIONS = {
  // "Clique WhatsApp" — lead de médico (demanda).
  whatsappLead: `${GOOGLE_ADS_ID}/lCDSCJ3SvcscEJn9sM9D`,
  // "Cadastro" — cadastro de clínica/anunciante (oferta).
  registration: `${GOOGLE_ADS_ID}/GX1GCJrSvcscEJn9sM9D`,
} as const

declare global {
  interface Window {
    // gtag is declared in GoogleAnalytics.tsx; fbq is injected by MetaPixel.
    fbq?: (...args: unknown[]) => void
  }
}

/**
 * Identificação do anúncio que originou o contato. Sem isso o `generate_lead`
 * diz que houve um lead, mas não de quem — e a conversa comercial com a clínica
 * ("seu anúncio recebeu X contatos") depende justamente desse recorte.
 *
 * Os campos viram parâmetros de evento no GA4 e precisam estar registrados como
 * dimensões personalizadas (escopo de evento) para aparecerem nos relatórios.
 */
export interface LeadSource {
  listingId: string
  listingTitle: string
  /** CLINIC | EQUIPMENT | EDUCATION */
  listingType: string
  clinicName: string
  city?: string
}

function leadParams(source?: LeadSource) {
  if (!source) return {}
  return {
    listing_id: source.listingId,
    listing_title: source.listingTitle,
    listing_type: source.listingType,
    clinic_name: source.clinicName,
    ...(source.city ? { listing_city: source.city } : {}),
  }
}

/** Lead de médico — disparado no clique do botão de WhatsApp de um anúncio. */
export function trackWhatsAppLead(source?: LeadSource) {
  if (typeof window === "undefined") return
  window.gtag?.("event", "conversion", { send_to: ADS_CONVERSIONS.whatsappLead })
  // Também para o GA4: a conversão do Ads acima só é visível na conta do Google
  // Ads. O evento GA4 é o que permite atribuir o lead à origem do tráfego
  // (google / meta / orgânico) e comparar os canais.
  window.gtag?.("event", "generate_lead", {
    send_to: GA_MEASUREMENT_ID,
    method: "whatsapp",
    ...leadParams(source),
  })
  window.fbq?.("track", "Lead")
}

/** Cadastro de anunciante — disparado quando a tela de sucesso do cadastro aparece. */
export function trackRegistration() {
  if (typeof window === "undefined") return
  window.gtag?.("event", "conversion", { send_to: ADS_CONVERSIONS.registration })
  window.gtag?.("event", "sign_up", {
    send_to: GA_MEASUREMENT_ID,
    method: "site",
  })
  window.fbq?.("track", "CompleteRegistration")
}
