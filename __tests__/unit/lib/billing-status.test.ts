import { describe, it, expect } from "vitest"
import {
  situacaoPedido,
  cobrancaDoPedido,
  podePagar,
  rotuloPagar,
  fraseVigencia,
  SITUACAO,
  ORIGEM_LABEL,
  formaPagamentoLabel,
  inicioDoMesBrasilia,
  reaisPlanilha,
  dataBR,
  type Situacao,
} from "@/lib/billing/status"

describe("cobrancaDoPedido", () => {
  it("prefere a cobranca paga a mais recente", () => {
    const charges = [
      { id: "nova", status: "PENDING" },
      { id: "antiga", status: "RECEIVED" },
    ]
    expect(cobrancaDoPedido(charges)?.id).toBe("antiga")
  })

  it("sem cobranca paga, fica com a mais recente", () => {
    const charges = [
      { id: "nova", status: "PENDING" },
      { id: "antiga", status: "OVERDUE" },
    ]
    expect(cobrancaDoPedido(charges)?.id).toBe("nova")
  })

  it("lista vazia devolve undefined", () => {
    expect(cobrancaDoPedido([])).toBeUndefined()
  })
})

describe("podePagar e rotuloPagar", () => {
  it("so oferece pagar quando o anuncio espera pagamento", () => {
    expect(podePagar("AWAITING_PAYMENT", "AGUARDANDO")).toBe(true)
    expect(podePagar("EXPIRED", "VENCIDO")).toBe(true)
    expect(podePagar("EXPIRED", "ENCERRADO")).toBe(true)
    expect(podePagar("PUBLISHED", "AGUARDANDO")).toBe(false)
    expect(podePagar("PENDING", "AGUARDANDO")).toBe(false)
    expect(podePagar(undefined, "AGUARDANDO")).toBe(false)
    expect(podePagar("AWAITING_PAYMENT", "PAGO")).toBe(false)
    expect(podePagar("EXPIRED", "ESTORNADO")).toBe(false)
  })

  it("renovar so depois de vigencia encerrada", () => {
    expect(rotuloPagar("ENCERRADO")).toBe("Renovar")
    expect(rotuloPagar("AGUARDANDO")).toBe("Pagar")
    expect(rotuloPagar("VENCIDO")).toBe("Pagar")
  })
})

describe("fraseVigencia", () => {
  const fim = new Date("2026-09-30T02:59:59.999Z") // 29/09 23:59 em Brasilia

  it("pago e publicado esta no ar", () => {
    expect(fraseVigencia("PAGO", fim, "PUBLISHED")).toBe("No ar até 29/09/2026")
    expect(fraseVigencia("PAGO", null, "PUBLISHED")).toBe("No ar")
  })

  it("pago mas fora do ar nao diz que esta no ar", () => {
    expect(fraseVigencia("PAGO", fim, "PENDING")).toBe(
      "Pago até 29/09/2026. Volta ao ar quando a análise terminar"
    )
    expect(fraseVigencia("PAGO", fim, "ARCHIVED")).toBe(
      "Pago até 29/09/2026. O anúncio não está publicado no momento"
    )
    expect(fraseVigencia("PAGO", fim, undefined)).toBe(
      "Pago até 29/09/2026. O anúncio foi excluído"
    )
  })

  it("pendente de anuncio ja publicado por outro pagamento nao pede pagamento", () => {
    expect(fraseVigencia("AGUARDANDO", null, "PUBLISHED")).toBe(
      "Cobrança não paga. O anúncio está publicado por outro pagamento"
    )
    expect(fraseVigencia("AGUARDANDO", null, "AWAITING_PAYMENT")).toBe(
      "O anúncio vai ao ar assim que o pagamento for confirmado"
    )
  })

  it("encerrado, estornado e cancelado", () => {
    expect(fraseVigencia("ENCERRADO", fim, "EXPIRED")).toBe("Encerrado em 29/09/2026")
    expect(fraseVigencia("ESTORNADO", fim, "EXPIRED")).toBeNull()
    expect(fraseVigencia("CANCELADO", null, undefined)).toBeNull()
  })

  it("nenhuma frase usa travessao", () => {
    const sits: Situacao[] = ["AGUARDANDO", "PAGO", "ENCERRADO", "VENCIDO", "DISPUTA", "ESTORNADO", "CANCELADO"]
    const status = ["PUBLISHED", "PENDING", "ARCHIVED", "AWAITING_PAYMENT", "EXPIRED", undefined] as const
    for (const s of sits) for (const st of status) {
      const f = fraseVigencia(s, fim, st)
      if (f) expect(f).not.toMatch(/[—–]/)
    }
  })
})

const agora = new Date("2026-09-01T15:00:00.000Z")
const ontem = new Date("2026-08-31T15:00:00.000Z")
const amanha = new Date("2026-09-02T15:00:00.000Z")

describe("situacaoPedido", () => {
  it("pendente e aguardando", () => {
    expect(
      situacaoPedido({ status: "PENDING_PAYMENT", expiresAt: null, paidAt: null }, agora)
    ).toBe("AGUARDANDO")
  })

  it("pago com vigencia em curso e pago", () => {
    expect(
      situacaoPedido({ status: "PAID", expiresAt: amanha, paidAt: ontem }, agora)
    ).toBe("PAGO")
  })

  it("pago sem data de fim continua pago", () => {
    expect(
      situacaoPedido({ status: "PAID", expiresAt: null, paidAt: ontem }, agora)
    ).toBe("PAGO")
  })

  it("pago com vigencia terminada e encerrado, nao vencido", () => {
    // O pedido continua PAID no banco depois que a vigencia acaba. A leitura
    // precisa dizer que acabou, sem sugerir que faltou pagamento.
    expect(
      situacaoPedido({ status: "PAID", expiresAt: ontem, paidAt: ontem }, agora)
    ).toBe("ENCERRADO")
  })

  it("vencido sem pagamento e vencido", () => {
    expect(
      situacaoPedido({ status: "EXPIRED_UNPAID", expiresAt: null, paidAt: null }, agora)
    ).toBe("VENCIDO")
  })

  it("EXPIRED_UNPAID que chegou a ser pago e lido como encerrado", () => {
    // Registro deixado por uma versao anterior da varredura. Para quem le, e
    // vigencia encerrada: o dinheiro entrou.
    expect(
      situacaoPedido({ status: "EXPIRED_UNPAID", expiresAt: ontem, paidAt: ontem }, agora)
    ).toBe("ENCERRADO")
  })

  it("chargeback, estorno e cancelamento", () => {
    const base = { expiresAt: null, paidAt: ontem }
    expect(situacaoPedido({ status: "CHARGEBACK_OPEN", ...base }, agora)).toBe("DISPUTA")
    expect(situacaoPedido({ status: "REFUNDED", ...base }, agora)).toBe("ESTORNADO")
    expect(situacaoPedido({ status: "CANCELED", ...base }, agora)).toBe("CANCELADO")
  })
})

describe("rotulos", () => {
  const situacoes: Situacao[] = [
    "AGUARDANDO",
    "PAGO",
    "ENCERRADO",
    "VENCIDO",
    "DISPUTA",
    "ESTORNADO",
    "CANCELADO",
  ]

  it("toda situacao tem rotulo e variante", () => {
    for (const s of situacoes) {
      expect(SITUACAO[s].label.length).toBeGreaterThan(0)
      expect(SITUACAO[s].variant.length).toBeGreaterThan(0)
    }
  })

  it("nenhum texto visivel usa travessao", () => {
    // Preferencia da cliente: virgula, dois-pontos ou parenteses no lugar.
    const textos = [
      ...situacoes.map((s) => SITUACAO[s].label),
      ...Object.values(ORIGEM_LABEL),
    ]
    for (const t of textos) expect(t).not.toMatch(/[—–]/)
  })
})

describe("formaPagamentoLabel", () => {
  it("segue a cobranca quando existe", () => {
    expect(formaPagamentoLabel("PAID_CHARGE", "PIX")).toBe("Pix")
    expect(formaPagamentoLabel("PAID_CHARGE", "CREDIT_CARD")).toBe("Cartão")
  })

  it("cortesia nao tem cobranca", () => {
    expect(formaPagamentoLabel("ADMIN_GRANT", null)).toBe("Cortesia")
    expect(formaPagamentoLabel("LAUNCH_COURTESY", undefined)).toBe("Cortesia")
  })

  it("pedido pago sem cobranca ainda e 'a definir'", () => {
    expect(formaPagamentoLabel("PAID_CHARGE", null)).toBe("A definir")
  })
})

describe("inicioDoMesBrasilia", () => {
  it("vira o mes a meia-noite de Brasilia, nao do UTC", () => {
    // 02:00 UTC de 01/09 ainda e 23:00 de 31/08 em Brasilia.
    const inicio = inicioDoMesBrasilia(new Date("2026-09-01T02:00:00.000Z"))
    expect(inicio.toISOString()).toBe("2026-08-01T03:00:00.000Z")
  })

  it("a partir das 03:00 UTC ja e o mes novo", () => {
    const inicio = inicioDoMesBrasilia(new Date("2026-09-01T03:00:00.000Z"))
    expect(inicio.toISOString()).toBe("2026-09-01T03:00:00.000Z")
  })
})

describe("formatacao para planilha", () => {
  it("valor com virgula e sem simbolo", () => {
    expect(reaisPlanilha(4900)).toBe("49,00")
    expect(reaisPlanilha(0)).toBe("0,00")
    expect(reaisPlanilha(123456)).toBe("1234,56")
  })

  it("data curta no fuso de Brasilia", () => {
    // 01:00 UTC de 02/09 e 22:00 de 01/09 em Brasilia.
    expect(dataBR(new Date("2026-09-02T01:00:00.000Z"))).toBe("01/09/2026")
    expect(dataBR(null)).toBe("")
  })
})
