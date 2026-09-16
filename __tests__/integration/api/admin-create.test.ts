import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { adminSession } from "../../helpers/auth"

let mockPrisma: MockPrisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAuthFn: any

vi.mock("@/lib/db", () => ({
  prisma: new Proxy({}, { get: (_, p) => mockPrisma[p as keyof MockPrisma] }),
}))
vi.mock("@/lib/auth", () => ({ auth: (...a: unknown[]) => mockAuthFn(...a) }))
vi.mock("@/lib/listing-taxonomy", () => ({
  validSpecialtyIds: async (ids: string[]) => ids ?? [],
  validEquipmentIds: async (ids: string[]) => ids ?? [],
}))
// actions.ts importa sendEmail no topo (usado por approveListing). email.ts
// puxa "server-only", que o vitest não resolve; mockamos como os outros testes.
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }))
vi.mock("@/lib/billing/orders", () => ({ cancelarPedidosPendentes: vi.fn() }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
// redirect() encerra a action com sucesso. Lançamos um erro reconhecível para
// o teste seguir; a asserção é sobre o create, que já rodou antes do redirect.
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("__REDIRECT__")
  }),
}))

const { adminCreateListing, adminCreateEducation } = await import("@/app/admin/actions")

const clinicForm = () => {
  const f = new FormData()
  f.set("clinicId", "clinic-1")
  f.set("title", "Sala ampla na Asa Sul")
  f.set("description", "Consultório equipado para atender.")
  f.set("city", "Brasília")
  f.set("neighborhood", "Asa Sul")
  f.set("whatsapp", "61999990000")
  f.set("allSpecialties", "true")
  return f
}

const educationForm = () => {
  const f = new FormData()
  f.set("clinicId", "clinic-1")
  f.set("title", "Mentoria de gestão de clínica")
  f.set("educationType", "MENTORIA")
  f.set("description", "Mentoria para gestores de clínica.")
  f.set("educationModality", "ONLINE")
  f.set("whatsapp", "61999990000")
  return f
}

describe("admin cria anúncio", () => {
  const original = process.env.BILLING_ENABLED

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
    mockPrisma.clinic.findUnique.mockResolvedValue({ id: "clinic-1" })
    mockPrisma.listing.findUnique.mockResolvedValue(null) // slug livre
    mockPrisma.listing.create.mockResolvedValue({ id: "new-listing" })
    delete process.env.BILLING_ENABLED
  })

  afterAll(() => {
    if (original === undefined) delete process.env.BILLING_ENABLED
    else process.env.BILLING_ENABLED = original
  })

  it("clínica nasce como rascunho, não publicada (fotos entram na edição)", async () => {
    // O bug: publicava na criação com zero foto, e anúncio sem foto some da
    // vitrine. Rascunho força a admin a subir foto e publicar depois.
    await adminCreateListing({ success: false }, clinicForm()).catch(() => {})
    const data = mockPrisma.listing.create.mock.calls[0][0].data
    expect(data.type).toBe("CLINIC")
    expect(data.status).toBe("DRAFT")
    expect(data.firstPublishedAt).toBeUndefined()
  })

  it("educação publica direto e carimba a primeira publicação", async () => {
    // Educação não exige foto, então pode ir ao ar; o carimbo evita que a
    // cobrança futura a trate como anúncio novo.
    await adminCreateEducation({ success: false }, educationForm()).catch(() => {})
    const data = mockPrisma.listing.create.mock.calls[0][0].data
    expect(data.type).toBe("EDUCATION")
    expect(data.status).toBe("PUBLISHED")
    expect(data.firstPublishedAt).toBeInstanceOf(Date)
  })

  it("não-admin não cria nada", async () => {
    mockAuthFn = vi.fn().mockResolvedValue(null)
    const r = await adminCreateListing({ success: false }, clinicForm())
    expect(r.success).toBe(false)
    expect(mockPrisma.listing.create).not.toHaveBeenCalled()
  })
})
