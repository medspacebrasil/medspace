import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"

let mockPrisma: MockPrisma
const createCustomer = vi.fn()
const createPayment = vi.fn()
const deletePayment = vi.fn()
const getPayment = vi.fn()
const getPixQrCode = vi.fn()
const activatePublication = vi.fn()
const createPublicationOrder = vi.fn()

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/asaas/client", async () => {
  const real = await vi.importActual<typeof import("@/lib/asaas/client")>("@/lib/asaas/client")
  return {
    AsaasError: real.AsaasError,
    toAsaasDate: real.toAsaasDate,
    createCustomer: (...a: unknown[]) => createCustomer(...a),
    createPayment: (...a: unknown[]) => createPayment(...a),
    deletePayment: (...a: unknown[]) => deletePayment(...a),
    getPayment: (...a: unknown[]) => getPayment(...a),
    getPixQrCode: (...a: unknown[]) => getPixQrCode(...a),
  }
})
vi.mock("@/lib/billing/orders", () => ({
  activatePublication: (...a: unknown[]) => activatePublication(...a),
  createPublicationOrder: (...a: unknown[]) => createPublicationOrder(...a),
}))

const { startCheckout } = await import("@/lib/billing/checkout")
const { AsaasError } = await import("@/lib/asaas/client")

const listing = { id: "an_1", clinicId: "cl_1", title: "Sala A", type: "CLINIC" as const }
const clinic = {
  id: "cl_1",
  name: "Clínica A",
  document: "12345678909",
  whatsapp: "61999999999",
  asaasCustomerId: "cus_1",
}

const pedidoExistente = (charges: { id: string; asaasPaymentId: string }[]) => ({
  id: "ped_1",
  amountCents: 4900,
  durationDays: 30,
  status: "PENDING_PAYMENT",
  charges,
})

describe("startCheckout", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockPrisma.asaasCharge.create.mockResolvedValue({ id: "c_nova" })
    mockPrisma.asaasCharge.update.mockResolvedValue({})
    createPayment.mockResolvedValue({
      id: "pay_nova",
      status: "PENDING",
      invoiceUrl: "https://asaas/i/nova",
    })
  })

  it("reaproveita pedido sem pagamento, inclusive o vencido", async () => {
    mockPrisma.publicationOrder.findFirst.mockResolvedValue(pedidoExistente([]))

    await startCheckout({ listing, clinic, email: "a@x.com", billingType: "CREDIT_CARD" })

    const where = mockPrisma.publicationOrder.findFirst.mock.calls[0][0].where
    expect(where.status).toEqual({ in: ["PENDING_PAYMENT", "EXPIRED_UNPAID"] })
    expect(where.paidAt).toBeNull()
    expect(createPublicationOrder).not.toHaveBeenCalled()
    expect(createPayment.mock.calls[0][0].externalReference).toBe("ped_1")
  })

  it("exclui no Asaas a cobranca anterior ainda aberta antes de gerar outra", async () => {
    mockPrisma.publicationOrder.findFirst.mockResolvedValue(
      pedidoExistente([{ id: "c_pix", asaasPaymentId: "pay_pix" }])
    )
    getPayment.mockResolvedValue({ id: "pay_pix", status: "PENDING" })
    deletePayment.mockResolvedValue({ deleted: true, id: "pay_pix" })

    await startCheckout({ listing, clinic, email: "a@x.com", billingType: "CREDIT_CARD" })

    expect(deletePayment).toHaveBeenCalledWith("pay_pix")
    expect(mockPrisma.asaasCharge.update).toHaveBeenCalledWith({
      where: { id: "c_pix" },
      data: { status: "DELETED" },
    })
    expect(createPayment).toHaveBeenCalledTimes(1)
  })

  it("cobranca anterior ja paga ativa o pedido e interrompe o checkout", async () => {
    mockPrisma.publicationOrder.findFirst.mockResolvedValue(
      pedidoExistente([{ id: "c_pix", asaasPaymentId: "pay_pix" }])
    )
    getPayment.mockResolvedValue({ id: "pay_pix", status: "RECEIVED" })

    await expect(
      startCheckout({ listing, clinic, email: "a@x.com", billingType: "PIX" })
    ).rejects.toMatchObject({ code: "ALREADY_PAID" })

    expect(activatePublication).toHaveBeenCalledWith("ped_1", { settled: true })
    expect(deletePayment).not.toHaveBeenCalled()
    expect(createPayment).not.toHaveBeenCalled()
  })

  it("falha ao excluir a anterior nao impede a nova cobranca", async () => {
    mockPrisma.publicationOrder.findFirst.mockResolvedValue(
      pedidoExistente([{ id: "c_pix", asaasPaymentId: "pay_pix" }])
    )
    getPayment.mockResolvedValue({ id: "pay_pix", status: "PENDING" })
    deletePayment.mockRejectedValue(new AsaasError("indisponivel", "X", 500))

    const r = await startCheckout({ listing, clinic, email: "a@x.com", billingType: "CREDIT_CARD" })
    expect(r.invoiceUrl).toBe("https://asaas/i/nova")
  })

  it("sem pedido reaproveitavel cria um novo", async () => {
    mockPrisma.publicationOrder.findFirst.mockResolvedValue(null)
    createPublicationOrder.mockResolvedValue({ id: "ped_novo", amountCents: 4900, durationDays: 30 })

    await startCheckout({ listing, clinic, email: "a@x.com", billingType: "CREDIT_CARD" })

    expect(createPublicationOrder).toHaveBeenCalledWith({ listing, clinicName: "Clínica A" })
    expect(createPayment.mock.calls[0][0].externalReference).toBe("ped_novo")
    expect(createPayment.mock.calls[0][0].description).toContain("por 30 dias")
  })
})
