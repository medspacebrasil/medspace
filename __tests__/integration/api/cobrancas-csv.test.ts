import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { adminSession, testSession } from "../../helpers/auth"

let mockPrisma: MockPrisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAuthFn: any

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuthFn(...args),
}))

const { GET } = await import("@/app/api/admin/cobrancas.csv/route")

const req = (qs = "") =>
  new Request(`https://medspacebrasil.com.br/api/admin/cobrancas.csv${qs}`)

const daquiUmMes = new Date(Date.now() + 30 * 86_400_000)

const pedido = (over: Record<string, unknown> = {}) => ({
  id: "ped_1",
  listingId: "an_1",
  clinicId: "cl_1",
  listingTitle: "Sala na Asa Sul",
  clinicName: "Clínica Teste",
  origin: "PAID_CHARGE",
  status: "PAID",
  amountCents: 4900,
  durationDays: 30,
  priceVersion: "v",
  createdAt: new Date("2026-08-20T13:00:00.000Z"),
  paidAt: new Date("2026-08-20T13:05:00.000Z"),
  settledAt: null,
  startsAt: new Date("2026-08-20T13:05:00.000Z"),
  expiresAt: daquiUmMes,
  canceledAt: null,
  refundedAt: null,
  expiryWarnedAt: null,
  charges: [
    {
      asaasPaymentId: "pay_abc",
      billingType: "PIX",
      status: "RECEIVED",
      invoiceUrl: "https://sandbox.asaas.com/i/abc",
    },
  ],
  listing: { id: "an_1", slug: "sala", type: "CLINIC", status: "PUBLISHED" },
  ...over,
})

describe("GET /api/admin/cobrancas.csv", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
    mockPrisma.publicationOrder.findMany.mockResolvedValue([])
    mockPrisma.publicationOrder.count.mockResolvedValue(0)
  })

  it("recusa quem nao e admin", async () => {
    mockAuthFn = vi.fn().mockResolvedValue(testSession)
    const res = await GET(req())
    expect(res.status).toBe(403)
    expect(mockPrisma.publicationOrder.findMany).not.toHaveBeenCalled()
  })

  it("recusa sem sessao", async () => {
    mockAuthFn = vi.fn().mockResolvedValue(null)
    expect((await GET(req())).status).toBe(403)
  })

  it("exporta com BOM, ponto e virgula e valores legiveis", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([pedido()])
    mockPrisma.publicationOrder.count.mockResolvedValue(1)

    const res = await GET(req())
    // Bytes crus: response.text() remove o BOM ao decodificar, como manda a
    // spec, entao a presenca dele so e verificavel aqui.
    const bytes = new Uint8Array(await res.arrayBuffer())

    expect(res.headers.get("content-type")).toContain("text/csv")
    expect(res.headers.get("content-disposition")).toContain("cobrancas-todos.csv")
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])

    const csv = new TextDecoder().decode(bytes)
    const [header, linha] = csv.split("\r\n")
    expect(header).toBe(
      "Data;Anunciante;Anuncio;Origem;Forma;Valor;Situacao;Pago em;Inicio da vigencia;Fim da vigencia;Cobranca Asaas;Pedido"
    )
    const campos = linha.split(";")
    expect(campos[0]).toBe("20/08/2026, 10:00") // 13:00 UTC em Brasilia
    expect(campos[1]).toBe("Clínica Teste")
    expect(campos[3]).toBe("Cobrança")
    expect(campos[4]).toBe("Pix")
    expect(campos[5]).toBe("49,00")
    expect(campos[6]).toBe("Pago")
    expect(campos[10]).toBe("pay_abc")
    expect(campos[11]).toBe("ped_1")
  })

  it("neutraliza titulo que viraria formula e escapa ponto e virgula no nome", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      pedido({ listingTitle: "=HYPERLINK(\"http://mal.co\")", clinicName: "A; B" }),
    ])
    mockPrisma.publicationOrder.count.mockResolvedValue(1)

    const csv = await (await GET(req())).text()
    expect(csv).toContain(String.raw`"'=HYPERLINK(""http://mal.co"")"`)
    expect(csv).toContain('"A; B"')
  })

  it("cortesia sem cobranca sai como cortesia, sem id do Asaas", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      pedido({ origin: "ADMIN_GRANT", amountCents: 0, charges: [] }),
    ])
    mockPrisma.publicationOrder.count.mockResolvedValue(1)

    const csv = await (await GET(req())).text()
    const campos = csv.split("\r\n")[1].split(";")
    expect(campos[3]).toBe("Cortesia")
    expect(campos[4]).toBe("Cortesia")
    expect(campos[5]).toBe("0,00")
    expect(campos[10]).toBe("")
  })

  it("aplica o filtro da URL e ignora filtro desconhecido", async () => {
    const r1 = await GET(req("?filtro=aguardando"))
    expect(mockPrisma.publicationOrder.findMany.mock.calls[0][0].where).toEqual({
      status: "PENDING_PAYMENT",
    })
    expect(r1.headers.get("content-disposition")).toContain("cobrancas-aguardando.csv")

    const r2 = await GET(req("?filtro=qualquer"))
    expect(mockPrisma.publicationOrder.findMany.mock.calls[1][0].where).toEqual({})
    // Nome do arquivo vem do filtro normalizado, nao da URL.
    expect(r2.headers.get("content-disposition")).toBe(
      'attachment; filename="cobrancas-todos.csv"'
    )
  })

  it("filtro 'pagos' usa o mesmo criterio do card Recebido", async () => {
    await GET(req("?filtro=pagos"))
    expect(mockPrisma.publicationOrder.findMany.mock.calls[0][0].where).toEqual({
      paidAt: { not: null },
      status: { notIn: ["REFUNDED", "CHARGEBACK_OPEN"] },
      origin: "PAID_CHARGE",
    })
  })

  it("mostra a cobranca paga, nao a mais recente, quando o pedido tem as duas", async () => {
    // Pix gerado primeiro e pago; cartao gerado depois e abandonado. A lista
    // vem da mais nova para a mais antiga.
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      pedido({
        charges: [
          { asaasPaymentId: "pay_cartao", billingType: "CREDIT_CARD", status: "PENDING", invoiceUrl: "https://x/c" },
          { asaasPaymentId: "pay_pix", billingType: "PIX", status: "RECEIVED", invoiceUrl: "https://x/p" },
        ],
      }),
    ])
    mockPrisma.publicationOrder.count.mockResolvedValue(1)

    const csv = await (await GET(req())).text()
    const campos = csv.split("\r\n")[1].split(";")
    expect(campos[4]).toBe("Pix")
    expect(campos[10]).toBe("pay_pix")
  })

  it("avisa dentro do arquivo quando a exportacao foi cortada", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([pedido()])
    mockPrisma.publicationOrder.count.mockResolvedValue(5001)

    const csv = await (await GET(req())).text()
    expect(csv).toContain("Exportacao limitada a 5000 pedidos; 1 mais antigos nao incluidos")
  })
})
