import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"

let mockPrisma: MockPrisma
const getPayment = vi.fn()
const deletePayment = vi.fn()

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/asaas/client", () => ({
  getPayment: (...a: unknown[]) => getPayment(...a),
  deletePayment: (...a: unknown[]) => deletePayment(...a),
}))

const {
  expirePublications,
  activatePublication,
  openChargeback,
  refundOrder,
  cancelarPedidosPendentes,
} = await import("@/lib/billing/orders")

function transacaoReal() {
  mockPrisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: MockPrisma) => Promise<unknown>)(mockPrisma)
      : Promise.all(arg as Promise<unknown>[])
  )
}

describe("expirePublications", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
  })

  it("tira do ar o que venceu sem rebaixar o pedido pago", async () => {
    mockPrisma.listing.findMany.mockResolvedValue([{ id: "a" }, { id: "b" }])
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 2 })

    const r = await expirePublications(new Date("2026-09-01T06:05:00.000Z"))

    expect(r).toEqual({ expirados: 2 })
    expect(mockPrisma.listing.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["a", "b"] }, status: "PUBLISHED" },
      data: { status: "EXPIRED" },
    })
    // O pedido foi pago. Rebaixa-lo o tornaria ativavel de novo, e o evento de
    // liquidacao tardia do cartao republicaria o anuncio sem cobranca.
    expect(mockPrisma.publicationOrder.updateMany).not.toHaveBeenCalled()
  })

  it("nao escreve nada quando nao ha vencidos", async () => {
    mockPrisma.listing.findMany.mockResolvedValue([])
    const r = await expirePublications()
    expect(r).toEqual({ expirados: 0 })
    expect(mockPrisma.listing.updateMany).not.toHaveBeenCalled()
  })
})

describe("activatePublication", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    transacaoReal()
  })

  it("liquidacao tardia de pedido pago so registra settledAt, sem republicar", async () => {
    // Cenario: cartao confirmado em agosto, vigencia terminou, anuncio ja esta
    // EXPIRED. Em setembro chega PAYMENT_RECEIVED (liquidacao). Nao pode
    // reabrir a vigencia.
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      id: "ped_1",
      listingId: "an_1",
      durationDays: 30,
      status: "PAID",
      paidAt: new Date("2026-08-01T12:00:00.000Z"),
    })
    mockPrisma.publicationOrder.update.mockResolvedValue({})

    const r = await activatePublication("ped_1", {
      settled: true,
      now: new Date("2026-09-05T12:00:00.000Z"),
    })

    expect(r.activated).toBe(false)
    expect(mockPrisma.publicationOrder.update).toHaveBeenCalledWith({
      where: { id: "ped_1" },
      data: { settledAt: new Date("2026-09-05T12:00:00.000Z") },
    })
    expect(mockPrisma.publicationOrder.updateMany).not.toHaveBeenCalled()
    expect(mockPrisma.listing.update).not.toHaveBeenCalled()
  })

  it("pagamento atrasado de cobranca vencida publica normalmente", async () => {
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      id: "ped_2",
      listingId: "an_2",
      durationDays: 30,
      status: "EXPIRED_UNPAID",
      paidAt: null,
    })
    mockPrisma.publicationOrder.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.listing.update.mockResolvedValue({})
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 1 })

    const now = new Date("2026-09-05T12:00:00.000Z")
    const r = await activatePublication("ped_2", { settled: true, now })

    expect(r.activated).toBe(true)
    expect(r.published).toBe(true)
    // Vigencia gravada sempre...
    expect(mockPrisma.listing.update).toHaveBeenCalledWith({
      where: { id: "an_2" },
      data: { paidUntil: r.expiresAt },
    })
    // ...publicacao condicionada ao estado do anuncio.
    const pub = mockPrisma.listing.updateMany.mock.calls[0][0]
    expect(pub.where.id).toBe("an_2")
    expect(pub.where.status.in).toEqual(["AWAITING_PAYMENT", "EXPIRED", "PUBLISHED"])
    expect(pub.data).toEqual({ status: "PUBLISHED" })
    // Publicacao paga tambem conta como primeira publicacao.
    const stamp = mockPrisma.listing.updateMany.mock.calls[1][0]
    expect(stamp.where).toEqual({ id: "an_2", firstPublishedAt: null })
    expect(stamp.data.firstPublishedAt).toEqual(now)
  })

  it("pagamento nao passa por cima de anuncio arquivado ou em analise", async () => {
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      id: "ped_4",
      listingId: "an_4",
      durationDays: 30,
      status: "PENDING_PAYMENT",
      paidAt: null,
    })
    mockPrisma.publicationOrder.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.listing.update.mockResolvedValue({})
    // updateMany nao encontra o anuncio no estado publicavel.
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 0 })

    const r = await activatePublication("ped_4", { settled: false })
    expect(r.activated).toBe(true)
    expect(r.published).toBe(false)
    // O pedido virou pago mesmo assim: o dinheiro entrou e a vigencia corre.
    expect(mockPrisma.publicationOrder.updateMany.mock.calls[0][0].data.status).toBe("PAID")
    // A unica escrita no anuncio foi a tentativa de publicar; o carimbo de
    // primeira publicacao NAO roda quando o anuncio nao foi publicado.
    expect(mockPrisma.listing.updateMany).toHaveBeenCalledTimes(1)
  })

  it("perde a corrida com outra entrega e nao publica duas vezes", async () => {
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      id: "ped_3",
      listingId: "an_3",
      durationDays: 30,
      status: "PENDING_PAYMENT",
      paidAt: null,
    })
    mockPrisma.publicationOrder.updateMany.mockResolvedValue({ count: 0 })

    const r = await activatePublication("ped_3", { settled: false })

    expect(r.activated).toBe(false)
    expect(mockPrisma.listing.update).not.toHaveBeenCalled()
  })
})

describe("openChargeback e refundOrder", () => {
  const vigenciaAntiga = new Date("2026-08-31T02:59:59.999Z")

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    transacaoReal()
    mockPrisma.publicationOrder.update.mockResolvedValue({})
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 0 })
  })

  it("chargeback so derruba o anuncio cuja vigencia corrente e a deste pedido", async () => {
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      listingId: "an_1",
      status: "PAID",
      expiresAt: vigenciaAntiga,
    })

    expect(await openChargeback("ped_antigo")).toBe(true)
    // A igualdade paidUntil = expiresAt do pedido e o que protege a renovacao
    // paga por outro pedido: se o anuncio ja tem paidUntil novo, nao casa.
    expect(mockPrisma.listing.updateMany).toHaveBeenCalledWith({
      where: { id: "an_1", status: "PUBLISHED", paidUntil: vigenciaAntiga },
      data: { status: "EXPIRED" },
    })
  })

  it("estorno le a vigencia antes de sobrescrever e usa a original na guarda", async () => {
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      listingId: "an_1",
      expiresAt: vigenciaAntiga,
    })
    const now = new Date("2026-09-10T12:00:00.000Z")

    expect(await refundOrder("ped_1", now)).toBe(true)
    expect(mockPrisma.publicationOrder.update).toHaveBeenCalledWith({
      where: { id: "ped_1" },
      data: { status: "REFUNDED", refundedAt: now, expiresAt: now },
    })
    expect(mockPrisma.listing.updateMany).toHaveBeenCalledWith({
      where: { id: "an_1", status: "PUBLISHED", paidUntil: vigenciaAntiga },
      data: { status: "EXPIRED", paidUntil: now },
    })
  })

  it("pedido que nunca teve vigencia nao mexe no anuncio", async () => {
    mockPrisma.publicationOrder.findUnique.mockResolvedValue({
      listingId: "an_1",
      expiresAt: null,
    })
    await refundOrder("ped_x")
    expect(mockPrisma.listing.updateMany).not.toHaveBeenCalled()
  })
})

describe("cancelarPedidosPendentes", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockPrisma.asaasCharge.update.mockResolvedValue({})
    mockPrisma.publicationOrder.updateMany.mockResolvedValue({ count: 1 })
  })

  it("exclui a cobranca aberta no Asaas e cancela o pedido", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      { id: "ped_1", charges: [{ id: "c1", asaasPaymentId: "pay_1" }] },
    ])
    getPayment.mockResolvedValue({ id: "pay_1", status: "PENDING" })
    deletePayment.mockResolvedValue({ deleted: true, id: "pay_1" })

    const r = await cancelarPedidosPendentes({ listingId: "an_1" })

    expect(r).toEqual({ cancelados: 1 })
    expect(deletePayment).toHaveBeenCalledWith("pay_1")
    expect(mockPrisma.asaasCharge.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { status: "DELETED" },
    })
    const upd = mockPrisma.publicationOrder.updateMany.mock.calls[0][0]
    expect(upd.where.id).toEqual({ in: ["ped_1"] })
    expect(upd.data.status).toBe("CANCELED")
    // Busca escopada e so em pedido sem pagamento.
    const busca = mockPrisma.publicationOrder.findMany.mock.calls[0][0].where
    expect(busca.listingId).toBe("an_1")
    expect(busca.paidAt).toBeNull()
  })

  it("nao cancela pedido cuja cobranca a API diz estar paga", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      { id: "ped_2", charges: [{ id: "c2", asaasPaymentId: "pay_2" }] },
    ])
    getPayment.mockResolvedValue({ id: "pay_2", status: "RECEIVED" })

    const r = await cancelarPedidosPendentes({ clinicId: "cl_1" })

    expect(r).toEqual({ cancelados: 0 })
    expect(deletePayment).not.toHaveBeenCalled()
    expect(mockPrisma.publicationOrder.updateMany).not.toHaveBeenCalled()
  })

  it("na duvida (API fora) mantem o pedido para a varredura decidir", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      { id: "ped_3", charges: [{ id: "c3", asaasPaymentId: "pay_3" }] },
    ])
    getPayment.mockRejectedValue(new Error("timeout"))

    const r = await cancelarPedidosPendentes({ listingId: "an_3" })
    expect(r).toEqual({ cancelados: 0 })
    expect(mockPrisma.publicationOrder.updateMany).not.toHaveBeenCalled()
  })

  it("pedido sem cobranca nenhuma e cancelado direto", async () => {
    mockPrisma.publicationOrder.findMany.mockResolvedValue([{ id: "ped_4", charges: [] }])
    const r = await cancelarPedidosPendentes({ listingId: "an_4" })
    expect(r).toEqual({ cancelados: 1 })
    expect(getPayment).not.toHaveBeenCalled()
  })
})
