import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"

let mockPrisma: MockPrisma

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))

const { resumoRecebimentos, listarPedidos, pedidosDoAnunciante, paginaValida } =
  await import("@/lib/billing/reports")

const RECEBIDO = {
  paidAt: { not: null },
  status: { notIn: ["REFUNDED", "CHARGEBACK_OPEN"] },
  origin: "PAID_CHARGE",
}

describe("resumoRecebimentos", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockPrisma.publicationOrder.aggregate.mockResolvedValue({
      _sum: { amountCents: 4900 },
      _count: 1,
    })
    mockPrisma.publicationOrder.count.mockResolvedValue(2)
  })

  it("usa as clausulas certas para cada numero", async () => {
    const now = new Date("2026-09-15T15:00:00.000Z")
    const r = await resumoRecebimentos(now)

    expect(r.inicioMes.toISOString()).toBe("2026-09-01T03:00:00.000Z")

    const agg = mockPrisma.publicationOrder.aggregate.mock.calls.map((c) => c[0].where)
    // Mes: recebido com paidAt a partir do inicio do mes de Brasilia.
    expect(agg[0]).toEqual({ ...RECEBIDO, paidAt: { gte: r.inicioMes } })
    expect(agg[1]).toEqual(RECEBIDO)
    expect(agg[2]).toEqual({ status: "PENDING_PAYMENT" })
    expect(agg[3]).toEqual({ status: "REFUNDED" })

    const cnt = mockPrisma.publicationOrder.count.mock.calls.map((c) => c[0].where)
    // "No ar" exige anuncio publicado de fato, nao so vigencia em curso.
    expect(cnt[0]).toEqual({
      status: "PAID",
      origin: "PAID_CHARGE",
      expiresAt: { gte: now },
      listing: { status: "PUBLISHED" },
    })
    expect(cnt[1]).toEqual({
      origin: { in: ["LAUNCH_COURTESY", "ADMIN_GRANT"] },
      status: "PAID",
      expiresAt: { gte: now },
      listing: { status: "PUBLISHED" },
    })
    expect(cnt[2]).toEqual({ status: "CHARGEBACK_OPEN" })

    expect(r.mesCents).toBe(4900)
    expect(r.vigentesPagos).toBe(2)
    expect(r.disputas).toBe(2)
  })

  it("banco vazio vira zero, nao null", async () => {
    mockPrisma.publicationOrder.aggregate.mockResolvedValue({
      _sum: { amountCents: null },
      _count: 0,
    })
    mockPrisma.publicationOrder.count.mockResolvedValue(0)

    const r = await resumoRecebimentos()
    expect(r.mesCents).toBe(0)
    expect(r.totalCents).toBe(0)
    expect(r.aguardandoCents).toBe(0)
    expect(r.estornadoCents).toBe(0)
    expect(r.totalQtd).toBe(0)
  })
})

describe("listarPedidos", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockPrisma.publicationOrder.findMany.mockResolvedValue([])
  })

  it("prende a pagina ao intervalo real", async () => {
    mockPrisma.publicationOrder.count.mockResolvedValue(30) // 2 paginas de 25
    const r = await listarPedidos({ page: 99 })
    expect(r.page).toBe(2)
    expect(r.totalPages).toBe(2)
    expect(mockPrisma.publicationOrder.findMany.mock.calls[0][0].skip).toBe(25)
  })

  it("lista vazia tem uma pagina e skip zero", async () => {
    mockPrisma.publicationOrder.count.mockResolvedValue(0)
    const r = await listarPedidos({ page: 5 })
    expect(r.page).toBe(1)
    expect(mockPrisma.publicationOrder.findMany.mock.calls[0][0].skip).toBe(0)
  })

  it("traz todas as cobrancas do pedido, da mais nova para a mais antiga", async () => {
    mockPrisma.publicationOrder.count.mockResolvedValue(1)
    await listarPedidos()
    const include = mockPrisma.publicationOrder.findMany.mock.calls[0][0].include
    expect(include.charges.orderBy).toEqual({ createdAt: "desc" })
    expect(include.charges.take).toBeUndefined()
  })
})

describe("paginaValida", () => {
  it("aceita inteiro positivo e recusa o resto", () => {
    expect(paginaValida("3")).toBe(3)
    expect(paginaValida(undefined)).toBe(1)
    expect(paginaValida("0")).toBe(1)
    expect(paginaValida("-2")).toBe(1)
    expect(paginaValida("abc")).toBe(1)
    expect(paginaValida("1e400")).toBe(1)
    expect(paginaValida("99999999999999999999")).toBe(1)
  })
})

describe("pedidosDoAnunciante", () => {
  it("escopa pela clinica na propria consulta", async () => {
    mockPrisma = createMockPrisma()
    mockPrisma.publicationOrder.findMany.mockResolvedValue([])
    await pedidosDoAnunciante("clinic-1")
    expect(mockPrisma.publicationOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clinicId: "clinic-1" },
        orderBy: { createdAt: "desc" },
      })
    )
  })
})
