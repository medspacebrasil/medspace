import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { adminSession } from "../../helpers/auth"

let mockPrisma: MockPrisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAuthFn: any
const sendEmail = vi.fn()

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuthFn(...args),
}))
vi.mock("@/lib/email", () => ({
  sendEmail: (...a: unknown[]) => sendEmail(...a),
}))
vi.mock("@/lib/billing/orders", () => ({
  cancelarPedidosPendentes: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

const { approveListing, unarchiveListing, setListingStatus } = await import(
  "@/app/admin/actions"
)

const form = (id: string) => {
  const f = new FormData()
  f.set("id", id)
  return f
}

/** Primeira consulta e a checagem de foto; a segunda, os dados do anuncio. */
function anuncio(over: Record<string, unknown> = {}) {
  mockPrisma.listing.findUnique
    .mockResolvedValueOnce({ type: "CLINIC", _count: { images: 2 } })
    .mockResolvedValueOnce({
      slug: "sala-teste",
      title: "Sala Teste",
      paidUntil: null,
      firstPublishedAt: null,
      clinic: { user: { email: "dona@clinica.com" } },
      ...over,
    })
}

describe("approveListing", () => {
  const original = process.env.BILLING_ENABLED

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
    mockPrisma.listing.update.mockResolvedValue({})
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 1 })
    sendEmail.mockResolvedValue({ sent: true })
    delete process.env.BILLING_ENABLED
  })

  afterAll(() => {
    if (original === undefined) delete process.env.BILLING_ENABLED
    else process.env.BILLING_ENABLED = original
  })

  it("com a cobranca desligada publica direto e registra a primeira publicacao", async () => {
    anuncio()
    await approveListing(form("l1"))
    const upd = mockPrisma.listing.updateMany.mock.calls[0][0]
    expect(upd.data.status).toBe("PUBLISHED")
    expect(upd.data.firstPublishedAt).toBeInstanceOf(Date)
    // Escrita condicional ao estado que o botao serve.
    expect(upd.where.status.in).toEqual(["PENDING", "ARCHIVED", "REJECTED", "DRAFT"])
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("com a cobranca ligada, anuncio novo vai para pagamento e o anunciante e avisado", async () => {
    process.env.BILLING_ENABLED = "true"
    anuncio()
    await approveListing(form("l2"))
    const upd = mockPrisma.listing.updateMany.mock.calls[0][0]
    expect(upd.data.status).toBe("AWAITING_PAYMENT")
    expect(upd.data.firstPublishedAt).toBeUndefined()
    // Guarda anti-corrida: se o webhook pagou no meio, paidUntil deixou de ser
    // nulo e esta escrita nao casa.
    expect(upd.where.paidUntil).toBeNull()
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0].to).toBe("dona@clinica.com")
    expect(sendEmail.mock.calls[0][0].text).toContain("/painel/anuncios/l2/pagamento")
  })

  it("perdeu a corrida para o webhook: nao escreve por cima nem manda e-mail", async () => {
    process.env.BILLING_ENABLED = "true"
    anuncio()
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 0 })
    await approveListing(form("l2b"))
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("legado do lancamento continua publicando gratis com a cobranca ligada", async () => {
    process.env.BILLING_ENABLED = "true"
    anuncio({ firstPublishedAt: new Date("2026-06-01T12:00:00.000Z") })
    await approveListing(form("l3"))
    const upd = mockPrisma.listing.updateMany.mock.calls[0][0]
    expect(upd.data.status).toBe("PUBLISHED")
    // A data original e preservada, nao sobrescrita.
    expect(upd.data.firstPublishedAt).toEqual(new Date("2026-06-01T12:00:00.000Z"))
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("vigencia paga vencida exige renovacao mesmo tendo publicado antes", async () => {
    process.env.BILLING_ENABLED = "true"
    anuncio({
      firstPublishedAt: new Date("2026-08-01T12:00:00.000Z"),
      paidUntil: new Date("2026-08-31T02:59:59.999Z"),
    })
    await approveListing(form("l4"))
    expect(mockPrisma.listing.updateMany.mock.calls[0][0].data.status).toBe("AWAITING_PAYMENT")
  })

  it("falha de e-mail nao desfaz a aprovacao", async () => {
    process.env.BILLING_ENABLED = "true"
    anuncio()
    sendEmail.mockRejectedValue(new Error("SMTP fora"))
    await expect(approveListing(form("l5"))).resolves.toBeUndefined()
    expect(mockPrisma.listing.updateMany).toHaveBeenCalled()
  })

  it("nao-admin e recusado antes de qualquer escrita", async () => {
    mockAuthFn = vi.fn().mockResolvedValue(null)
    await expect(approveListing(form("l6"))).rejects.toThrow("Não autorizado")
    expect(mockPrisma.listing.updateMany).not.toHaveBeenCalled()
  })
})

describe("unarchiveListing", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
    mockPrisma.listing.updateMany.mockResolvedValue({ count: 1 })
    delete process.env.BILLING_ENABLED
  })

  it("legado desarquiva gratis; anuncio novo com cobranca ligada vai para pagamento", async () => {
    process.env.BILLING_ENABLED = "true"
    mockPrisma.listing.findUnique
      .mockResolvedValueOnce({ type: "EDUCATION", _count: { images: 0 } })
      .mockResolvedValueOnce({ paidUntil: null, firstPublishedAt: new Date("2026-06-01") })
    await unarchiveListing(form("a1"))
    expect(mockPrisma.listing.updateMany.mock.calls[0][0].data.status).toBe("PUBLISHED")

    mockPrisma.listing.findUnique
      .mockResolvedValueOnce({ type: "EDUCATION", _count: { images: 0 } })
      .mockResolvedValueOnce({ paidUntil: null, firstPublishedAt: null })
    await unarchiveListing(form("a2"))
    expect(mockPrisma.listing.updateMany.mock.calls[1][0].data.status).toBe("AWAITING_PAYMENT")
  })
})

describe("setListingStatus (cortesia)", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
    mockPrisma.listing.update.mockResolvedValue({})
  })

  const formStatus = (id: string, status: string) => {
    const f = new FormData()
    f.set("id", id)
    f.set("status", status)
    return f
  }

  it("publicar sem cobranca estampa a primeira publicacao na mesma escrita", async () => {
    mockPrisma.listing.findUnique
      .mockResolvedValueOnce({ type: "EDUCATION", _count: { images: 0 } })
      .mockResolvedValueOnce({ firstPublishedAt: null })
    await setListingStatus(formStatus("c1", "PUBLISHED"))
    const upd = mockPrisma.listing.update.mock.calls[0][0]
    expect(upd.data.status).toBe("PUBLISHED")
    expect(upd.data.firstPublishedAt).toBeInstanceOf(Date)
  })

  it("quem ja publicou antes nao tem a data sobrescrita", async () => {
    mockPrisma.listing.findUnique
      .mockResolvedValueOnce({ type: "EDUCATION", _count: { images: 0 } })
      .mockResolvedValueOnce({ firstPublishedAt: new Date("2026-06-01") })
    await setListingStatus(formStatus("c2", "PUBLISHED"))
    expect(mockPrisma.listing.update.mock.calls[0][0].data.firstPublishedAt).toBeUndefined()
  })
})
