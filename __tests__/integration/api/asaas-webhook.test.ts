import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"

let mockPrisma: MockPrisma
const getPayment = vi.fn()
const activatePublication = vi.fn()
const markOrderOverdue = vi.fn()

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/asaas/client", () => ({
  getPayment: (...a: unknown[]) => getPayment(...a),
}))
vi.mock("@/lib/billing/orders", () => ({
  activatePublication: (...a: unknown[]) => activatePublication(...a),
  markOrderOverdue: (...a: unknown[]) => markOrderOverdue(...a),
  openChargeback: vi.fn(),
  refundOrder: vi.fn(),
}))

const { POST } = await import("@/app/api/webhooks/asaas/route")

const TOKEN = "token-de-teste-com-32-caracteres-ok"

function req(body: unknown, token: string | null = TOKEN) {
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (token) headers["asaas-access-token"] = token
  return new Request("https://medspacebrasil.com.br/api/webhooks/asaas", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
}

const evento = (over: Record<string, unknown> = {}) => ({
  id: "evt_1",
  event: "PAYMENT_RECEIVED",
  payment: { id: "pay_1", status: "RECEIVED" },
  ...over,
})

describe("POST /api/webhooks/asaas", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    process.env.ASAAS_WEBHOOK_TOKEN = TOKEN
    mockPrisma.asaasWebhookEvent.create.mockResolvedValue({})
    mockPrisma.asaasWebhookEvent.update.mockResolvedValue({})
    mockPrisma.asaasCharge.update.mockResolvedValue({})
  })

  it("recusa token errado", async () => {
    const res = await POST(req(evento(), "token-errado"))
    expect(res.status).toBe(403)
    expect(mockPrisma.asaasWebhookEvent.create).not.toHaveBeenCalled()
  })

  it("recusa requisicao sem token", async () => {
    expect((await POST(req(evento(), null))).status).toBe(403)
  })

  it("ignora cobranca que nao e nossa, sem gravar erro", async () => {
    mockPrisma.asaasCharge.findUnique.mockResolvedValue(null)
    const res = await POST(req(evento()))
    expect(res.status).toBe(200)
    expect(activatePublication).not.toHaveBeenCalled()
    // processedAt marcado, error nao: evento de terceiro nao e falha nossa.
    const call = mockPrisma.asaasWebhookEvent.update.mock.calls[0][0]
    expect(call.data.processedAt).toBeInstanceOf(Date)
    expect(call.data.error).toBeUndefined()
  })

  it("nao publica quando a API contradiz o payload recebido", async () => {
    mockPrisma.asaasCharge.findUnique.mockResolvedValue({ id: "c1", orderId: "o1" })
    getPayment.mockResolvedValue({ id: "pay_1", status: "PENDING" })
    await POST(req(evento()))
    expect(activatePublication).not.toHaveBeenCalled()
  })

  it("publica no PAYMENT_RECEIVED, que e o unico evento que o Pix emite", async () => {
    mockPrisma.asaasCharge.findUnique.mockResolvedValue({ id: "c1", orderId: "o1" })
    getPayment.mockResolvedValue({ id: "pay_1", status: "RECEIVED" })
    await POST(req(evento()))
    expect(activatePublication).toHaveBeenCalledWith("o1", { settled: true })
  })

  it("publica no PAYMENT_CONFIRMED sem marcar liquidacao", async () => {
    mockPrisma.asaasCharge.findUnique.mockResolvedValue({ id: "c1", orderId: "o1" })
    getPayment.mockResolvedValue({ id: "pay_1", status: "CONFIRMED" })
    await POST(req(evento({ event: "PAYMENT_CONFIRMED" })))
    expect(activatePublication).toHaveBeenCalledWith("o1", { settled: false })
  })

  it("responde 200 e nao reprocessa evento duplicado", async () => {
    const dup = Object.assign(new Error("dup"), { code: "P2002" })
    Object.setPrototypeOf(dup, (await import("@prisma/client")).Prisma.PrismaClientKnownRequestError.prototype)
    mockPrisma.asaasWebhookEvent.create.mockRejectedValue(dup)
    const res = await POST(req(evento()))
    expect(res.status).toBe(200)
    expect(activatePublication).not.toHaveBeenCalled()
  })

  it("marca vencido no PAYMENT_OVERDUE", async () => {
    mockPrisma.asaasCharge.findUnique.mockResolvedValue({ id: "c1", orderId: "o1" })
    await POST(req(evento({ event: "PAYMENT_OVERDUE", payment: { id: "pay_1" } })))
    expect(markOrderOverdue).toHaveBeenCalledWith("o1")
  })

  it("responde 200 mesmo quando o processamento falha, para nao travar a fila", async () => {
    mockPrisma.asaasCharge.findUnique.mockRejectedValue(new Error("banco fora"))
    const res = await POST(req(evento()))
    expect(res.status).toBe(200)
    const call = mockPrisma.asaasWebhookEvent.update.mock.calls[0][0]
    expect(call.data.error).toContain("banco fora")
  })
})
