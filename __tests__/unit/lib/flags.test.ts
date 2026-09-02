import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { billingEnabled, statusAposAprovacao } from "@/lib/billing/flags"

const agora = new Date("2026-09-02T15:00:00.000Z")
const futuro = new Date("2026-10-01T02:59:59.999Z")
const passado = new Date("2026-08-01T02:59:59.999Z")

describe("billingEnabled", () => {
  const original = process.env.BILLING_ENABLED
  afterAll(() => {
    if (original === undefined) delete process.env.BILLING_ENABLED
    else process.env.BILLING_ENABLED = original
  })

  it("so liga com a string exata 'true'", () => {
    delete process.env.BILLING_ENABLED
    expect(billingEnabled()).toBe(false)
    process.env.BILLING_ENABLED = "1"
    expect(billingEnabled()).toBe(false)
    process.env.BILLING_ENABLED = "true"
    expect(billingEnabled()).toBe(true)
  })
})

describe("statusAposAprovacao", () => {
  beforeEach(() => {
    delete process.env.BILLING_ENABLED
  })

  it("cobranca desligada publica direto, sempre", () => {
    expect(
      statusAposAprovacao({ firstPublishedAt: null, paidUntil: null }, false, agora)
    ).toBe("PUBLISHED")
    expect(
      statusAposAprovacao({ firstPublishedAt: null, paidUntil: passado }, false, agora)
    ).toBe("PUBLISHED")
  })

  it("vigencia paga em curso volta ao ar sem nova cobranca (edicao re-moderada)", () => {
    expect(
      statusAposAprovacao({ firstPublishedAt: passado, paidUntil: futuro }, true, agora)
    ).toBe("PUBLISHED")
  })

  it("vigencia paga que terminou exige renovacao", () => {
    // firstPublishedAt preenchido NAO pode dar publicacao gratis aqui: quem ja
    // pagou uma vez e deixou vencer renova, nao ganha vigencia infinita.
    expect(
      statusAposAprovacao({ firstPublishedAt: passado, paidUntil: passado }, true, agora)
    ).toBe("AWAITING_PAYMENT")
  })

  it("legado do lancamento (publicou gratis, nunca pagou) continua gratis", () => {
    expect(
      statusAposAprovacao({ firstPublishedAt: passado, paidUntil: null }, true, agora)
    ).toBe("PUBLISHED")
  })

  it("anuncio novo paga antes da primeira publicacao", () => {
    expect(
      statusAposAprovacao({ firstPublishedAt: null, paidUntil: null }, true, agora)
    ).toBe("AWAITING_PAYMENT")
  })

  it("pagou durante a analise e nunca publicou: aprovar publica sem cobrar de novo", () => {
    // Edicao re-moderada com Pix pago no meio: paidUntil ja esta gravado e a
    // aprovacao nao pode mandar de volta para o caixa.
    expect(
      statusAposAprovacao({ firstPublishedAt: null, paidUntil: futuro }, true, agora)
    ).toBe("PUBLISHED")
  })

  it("vigencia terminando exatamente agora ja conta como vencida", () => {
    expect(
      statusAposAprovacao({ firstPublishedAt: null, paidUntil: agora }, true, agora)
    ).toBe("AWAITING_PAYMENT")
  })
})
