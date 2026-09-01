import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"

let mockPrisma: MockPrisma
const expirePublications = vi.fn()
const activatePublication = vi.fn()
const markOrderOverdue = vi.fn()
const getPayment = vi.fn()
const sendEmail = vi.fn()

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/billing/orders", () => ({
  expirePublications: (...a: unknown[]) => expirePublications(...a),
  activatePublication: (...a: unknown[]) => activatePublication(...a),
  markOrderOverdue: (...a: unknown[]) => markOrderOverdue(...a),
}))
vi.mock("@/lib/asaas/client", () => ({ getPayment: (...a: unknown[]) => getPayment(...a) }))
vi.mock("@/lib/email", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...a) }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))

const { GET } = await import("@/app/api/cron/expire-listings/route")

const SECRET = "segredo-de-cron-para-teste"
const req = (token?: string) =>
  new Request("https://medspacebrasil.com.br/api/cron/expire-listings", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })

describe("GET /api/cron/expire-listings", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    process.env.CRON_SECRET = SECRET
    expirePublications.mockResolvedValue({ expirados: 0 })
    mockPrisma.asaasWebhookEvent.findMany.mockResolvedValue([])
    mockPrisma.publicationOrder.findMany.mockResolvedValue([])
    mockPrisma.publicationOrder.updateMany.mockResolvedValue({ count: 0 })
    mockPrisma.asaasCharge.findMany.mockResolvedValue([])
  })

  it("recusa sem token", async () => {
    expect((await GET(req())).status).toBe(401)
    expect(expirePublications).not.toHaveBeenCalled()
  })

  it("recusa token errado", async () => {
    expect((await GET(req("token-errado-de-tamanho-diferente"))).status).toBe(401)
  })

  it("recusa quando o CRON_SECRET nao esta configurado", async () => {
    delete process.env.CRON_SECRET
    expect((await GET(req(SECRET))).status).toBe(401)
  })

  it("expira e devolve o resumo", async () => {
    expirePublications.mockResolvedValue({ expirados: 3 })
    const res = await GET(req(SECRET))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ expirados: 3, recuperados: 0, avisados: 0 })
  })

  it("recupera pagamento cujo webhook falhou", async () => {
    mockPrisma.asaasWebhookEvent.findMany.mockResolvedValue([
      { id: "e1", eventId: "evt_1", paymentId: "pay_1" },
    ])
    mockPrisma.asaasCharge.findUnique.mockResolvedValue({ id: "c1", orderId: "o1" })
    mockPrisma.asaasCharge.update.mockResolvedValue({})
    mockPrisma.asaasWebhookEvent.update.mockResolvedValue({})
    getPayment.mockResolvedValue({ id: "pay_1", status: "RECEIVED" })

    const res = await GET(req(SECRET))
    expect(activatePublication).toHaveBeenCalledWith("o1", { settled: true })
    expect((await res.json()).recuperados).toBe(1)
  })

  it("marca como processado evento de cobranca que nao e nossa, sem publicar", async () => {
    mockPrisma.asaasWebhookEvent.findMany.mockResolvedValue([
      { id: "e2", eventId: "evt_2", paymentId: "pay_terceiro" },
    ])
    mockPrisma.asaasCharge.findUnique.mockResolvedValue(null)
    mockPrisma.asaasWebhookEvent.update.mockResolvedValue({})

    await GET(req(SECRET))
    expect(activatePublication).not.toHaveBeenCalled()
    expect(mockPrisma.asaasWebhookEvent.update).toHaveBeenCalled()
  })

  it("nao publica quando a API diz que a cobranca ainda esta pendente", async () => {
    mockPrisma.asaasWebhookEvent.findMany.mockResolvedValue([
      { id: "e3", eventId: "evt_3", paymentId: "pay_3" },
    ])
    mockPrisma.asaasCharge.findUnique.mockResolvedValue({ id: "c3", orderId: "o3" })
    mockPrisma.asaasCharge.update.mockResolvedValue({})
    mockPrisma.asaasWebhookEvent.update.mockResolvedValue({})
    getPayment.mockResolvedValue({ id: "pay_3", status: "PENDING" })

    await GET(req(SECRET))
    expect(activatePublication).not.toHaveBeenCalled()
  })

  it("avisa vencimento em D-7 e nao em D-5", async () => {
    const emDias = (d: number) => {
      const x = new Date()
      x.setDate(x.getDate() + d)
      return x
    }
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      { id: "p7", listingTitle: "Sala A", expiresAt: emDias(7), expiryWarnedAt: null,
        clinic: { user: { email: "a@x.com", name: "A" } } },
      { id: "p5", listingTitle: "Sala B", expiresAt: emDias(5), expiryWarnedAt: null,
        clinic: { user: { email: "b@x.com", name: "B" } } },
    ])
    mockPrisma.publicationOrder.update.mockResolvedValue({})
    sendEmail.mockResolvedValue({ sent: true })

    const res = await GET(req(SECRET))
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0].to).toBe("a@x.com")
    expect((await res.json()).avisados).toBe(1)
  })

  it("cancela pedido antigo que ficou sem cobranca e devolve a contagem", async () => {
    mockPrisma.publicationOrder.updateMany.mockResolvedValue({ count: 2 })

    const res = await GET(req(SECRET))
    const call = mockPrisma.publicationOrder.updateMany.mock.calls[0][0]
    expect(call.where.status).toBe("PENDING_PAYMENT")
    expect(call.where.charges).toEqual({ none: {} })
    expect(call.where.createdAt.lt).toBeInstanceOf(Date)
    expect(call.data.status).toBe("CANCELED")
    expect((await res.json()).cancelados).toBe(2)
  })

  it("confere cobranca vencida sem webhook: paga ativa, vencida marca atraso", async () => {
    mockPrisma.asaasCharge.findMany.mockResolvedValue([
      { id: "c1", asaasPaymentId: "pay_paga", orderId: "o1" },
      { id: "c2", asaasPaymentId: "pay_vencida", orderId: "o2" },
    ])
    mockPrisma.asaasCharge.update.mockResolvedValue({})
    getPayment.mockImplementation(async (id: string) => ({
      id,
      status: id === "pay_paga" ? "RECEIVED" : "OVERDUE",
    }))

    const res = await GET(req(SECRET))
    expect(activatePublication).toHaveBeenCalledWith("o1", { settled: true })
    expect(markOrderOverdue).toHaveBeenCalledWith("o2")
    expect((await res.json()).conferidas).toBe(2)
  })

  it("nao deixa falha de e-mail derrubar a varredura", async () => {
    const emDias = (d: number) => { const x = new Date(); x.setDate(x.getDate() + d); return x }
    expirePublications.mockResolvedValue({ expirados: 2 })
    mockPrisma.publicationOrder.findMany.mockResolvedValue([
      { id: "p3", listingTitle: "Sala C", expiresAt: emDias(3), expiryWarnedAt: null,
        clinic: { user: { email: "c@x.com", name: "C" } } },
    ])
    sendEmail.mockRejectedValue(new Error("SMTP fora"))

    const res = await GET(req(SECRET))
    expect(res.status).toBe(200)
    expect((await res.json()).expirados).toBe(2)
  })
})
