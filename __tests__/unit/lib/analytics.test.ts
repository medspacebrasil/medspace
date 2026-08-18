import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  trackWhatsAppLead,
  GA_MEASUREMENT_ID,
  type LeadSource,
} from "@/lib/analytics"

const source: LeadSource = {
  listingId: "clx123",
  listingTitle: "Consultório na Asa Sul",
  listingType: "CLINIC",
  clinicName: "Clínica Exemplo",
  city: "Brasília",
}

// Assinatura idêntica à declarada em window, senão o mock não é atribuível.
const spyFn = () => vi.fn((..._args: unknown[]) => {})
type SpyFn = ReturnType<typeof spyFn>

function gtagCalls(gtag: SpyFn, event: string) {
  return gtag.mock.calls.filter((c) => c[0] === "event" && c[1] === event)
}

describe("trackWhatsAppLead", () => {
  let gtag: SpyFn

  beforeEach(() => {
    gtag = spyFn()
    window.gtag = gtag
    window.fbq = spyFn()
  })

  afterEach(() => {
    delete window.gtag
    delete window.fbq
  })

  it("identifica o anúncio de origem no evento do GA4", () => {
    trackWhatsAppLead(source)

    const [call] = gtagCalls(gtag, "generate_lead")
    expect(call[2]).toMatchObject({
      send_to: GA_MEASUREMENT_ID,
      method: "whatsapp",
      listing_id: "clx123",
      listing_title: "Consultório na Asa Sul",
      listing_type: "CLINIC",
      clinic_name: "Clínica Exemplo",
      listing_city: "Brasília",
    })
  })

  it("dispara a conversão do Google Ads junto com o evento do GA4", () => {
    trackWhatsAppLead(source)

    expect(gtagCalls(gtag, "conversion")).toHaveLength(1)
    expect(gtagCalls(gtag, "generate_lead")).toHaveLength(1)
  })

  it("omite a cidade quando ela não é informada", () => {
    const { city: _city, ...semCidade } = source
    trackWhatsAppLead(semCidade)

    const [call] = gtagCalls(gtag, "generate_lead")
    expect(call[2]).not.toHaveProperty("listing_city")
    expect(call[2]).toMatchObject({ listing_id: "clx123" })
  })

  it("continua funcionando sem identificação, para não perder o lead", () => {
    trackWhatsAppLead()

    const [call] = gtagCalls(gtag, "generate_lead")
    expect(call[2]).toEqual({
      send_to: GA_MEASUREMENT_ID,
      method: "whatsapp",
    })
  })

  it("não quebra quando o gtag ainda não carregou", () => {
    delete window.gtag
    expect(() => trackWhatsAppLead(source)).not.toThrow()
  })
})
