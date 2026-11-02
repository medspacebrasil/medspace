import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { testSession } from "../../helpers/auth"

let mockPrisma: MockPrisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAuthFn: any
const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()

vi.mock("@/lib/db", () => ({
  prisma: new Proxy(
    {},
    {
      get(_, prop) {
        return mockPrisma[prop as keyof MockPrisma]
      },
    }
  ),
}))

vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuthFn(...args),
}))

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}))

// Bytes de cabecalho reais, para passar pela validacao de magic bytes da rota
// (detectImageType). Sem isto o upload e rejeitado antes de chegar ao storage e
// os testes de nome de arquivo nao exercitariam nada.
const PNG_HEADER = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
])
const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])

/**
 * Monta um Request so com o que a rota usa: request.formData(). Nao usamos
 * `new Request({ body: formData })` porque, no ambiente jsdom/undici deste
 * runner, o parser multipart de request.formData() trava (timeout). O stub
 * entrega o FormData direto, sem a ida e volta pela serializacao multipart.
 */
function uploadRequest(file: File, listingId?: string): Request {
  const formData = new FormData()
  formData.append("file", file)
  if (listingId) formData.append("listingId", listingId)
  return { formData: async () => formData } as unknown as Request
}

describe("POST /api/upload - Security", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(testSession)
    mockUpload.mockReset()
    mockGetPublicUrl.mockReset()
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.example.com/test.jpg" },
    })
  })

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null)
    const { POST } = await import("@/app/api/upload/route")

    const file = new File([PNG_HEADER], "test.png", { type: "image/png" })
    const response = await POST(uploadRequest(file))

    expect(response.status).toBe(401)
  })

  it("derives the stored name from content, never from the user filename", async () => {
    const { POST } = await import("@/app/api/upload/route")

    // Arquivo nomeado .php mas com bytes reais de PNG. O nome do usuario nunca
    // deve virar o nome no storage (seria um .php executavel).
    const file = new File([PNG_HEADER], "exploit.php", { type: "image/png" })
    const response = await POST(uploadRequest(file))

    expect(response.status).toBe(201)
    expect(mockUpload).toHaveBeenCalledTimes(1)
    const uploadPath = mockUpload.mock.calls[0][0] as string
    expect(uploadPath).toMatch(/\.png$/)
    expect(uploadPath).not.toContain("exploit")
    expect(uploadPath).not.toContain(".php")
  })

  it("uses a random UUID in the filename, not a predictable name", async () => {
    const { POST } = await import("@/app/api/upload/route")

    const file = new File([JPEG_HEADER], "photo.jpg", { type: "image/jpeg" })
    const response = await POST(uploadRequest(file))

    expect(response.status).toBe(201)
    expect(mockUpload).toHaveBeenCalledTimes(1)
    const uploadPath = mockUpload.mock.calls[0][0] as string
    expect(uploadPath).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    )
  })

  it("rejects declared non-image MIME types", async () => {
    const { POST } = await import("@/app/api/upload/route")

    const file = new File([JPEG_HEADER], "test.exe", {
      type: "application/octet-stream",
    })
    const response = await POST(uploadRequest(file))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain("Formato não aceito")
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it("rejects a file that claims to be an image but has fake content", async () => {
    const { POST } = await import("@/app/api/upload/route")

    // Content-Type image/jpeg, mas o conteudo nao e imagem. A validacao por
    // magic bytes (detectImageType) tem de barrar.
    const file = new File([new TextEncoder().encode("fake-image-data")], "fake.jpg", {
      type: "image/jpeg",
    })
    const response = await POST(uploadRequest(file))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain("inválido")
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it("rejects files over 5MB", async () => {
    const { POST } = await import("@/app/api/upload/route")

    const largeContent = new ArrayBuffer(5 * 1024 * 1024 + 1)
    const file = new File([largeContent], "large.jpg", { type: "image/jpeg" })
    const response = await POST(uploadRequest(file))

    expect(response.status).toBe(413)
    const body = await response.json()
    expect(body.error).toContain("muito grande")
    expect(mockUpload).not.toHaveBeenCalled()
  })
})
