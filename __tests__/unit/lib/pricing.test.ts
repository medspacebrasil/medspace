import { describe, it, expect } from "vitest"
import {
  publicationExpiry,
  priceFor,
  formatBRL,
  ASAAS_MIN_AMOUNT_CENTS,
} from "@/lib/billing/pricing"

describe("publicationExpiry", () => {
  it("termina às 23:59:59 de Brasília do último dia", () => {
    // 10h da manhã de Brasília em 19/08 = 13h UTC.
    const inicio = new Date("2026-08-19T13:00:00.000Z")
    const fim = publicationExpiry(inicio, 30)
    // 23:59:59 de Brasília = 02:59:59 UTC do dia seguinte.
    expect(fim.toISOString()).toBe("2026-09-18T02:59:59.999Z")
  })

  it("conta o dia da compra como primeiro dia", () => {
    const inicio = new Date("2026-08-19T13:00:00.000Z")
    const fim = publicationExpiry(inicio, 1)
    expect(fim.toISOString()).toBe("2026-08-20T02:59:59.999Z")
  })

  it("não encurta a vigência de quem compra tarde da noite", () => {
    // 23h de Brasília em 19/08 = 02h UTC de 20/08. O dia de Brasília ainda é 19.
    const tarde = new Date("2026-08-20T02:00:00.000Z")
    const cedo = new Date("2026-08-19T13:00:00.000Z")
    expect(publicationExpiry(tarde, 30).toISOString()).toBe(
      publicationExpiry(cedo, 30).toISOString()
    )
  })

  it("atravessa a virada de mês corretamente", () => {
    const inicio = new Date("2026-08-31T13:00:00.000Z")
    const fim = publicationExpiry(inicio, 30)
    expect(fim.toISOString()).toBe("2026-09-30T02:59:59.999Z")
  })
})

describe("catálogo de preços", () => {
  it("respeita o mínimo de cobrança do Asaas nos três tipos", () => {
    for (const tipo of ["CLINIC", "EQUIPMENT", "EDUCATION"] as const) {
      expect(priceFor(tipo).amountCents).toBeGreaterThanOrEqual(ASAAS_MIN_AMOUNT_CENTS)
    }
  })

  it("define duração positiva", () => {
    expect(priceFor("CLINIC").durationDays).toBeGreaterThan(0)
  })

  it("formata em reais", () => {
    expect(formatBRL(4900).replace(/ /g, " ")).toBe("R$ 49,00")
  })
})
