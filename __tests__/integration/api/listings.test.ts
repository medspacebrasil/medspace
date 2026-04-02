import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { testSession, adminSession } from "../../helpers/auth"

// Mock modules before imports
let mockPrisma: MockPrisma
let mockAuthFn: ReturnType<typeof vi.fn>

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

// Import after mocks
const { GET, POST } = await import("@/app/api/anuncios/route")

describe("GET /api/anuncios", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(null)
  })

  it("returns published listings with pagination", async () => {
    const mockListings = [
      {
        id: "listing-1",
        title: "Consultório Centro",
        slug: "consultorio-centro",
        description: "Sala ampla",
        city: "São Paulo",
        neighborhood: "Centro",
        status: "PUBLISHED",
        clinic: { name: "Clínica Teste" },
        roomType: { name: "Consultório", slug: "consultorio" },
        specialties: [],
        images: [],
        createdAt: new Date(),
      },
    ]

    mockPrisma.listing.findMany.mockResolvedValue(mockListings)
    mockPrisma.listing.count.mockResolvedValue(1)

    const request = new Request("http://localhost:3000/api/anuncios")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })
    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED" },
      })
    )
  })

  it("applies city filter", async () => {
    mockPrisma.listing.findMany.mockResolvedValue([])
    mockPrisma.listing.count.mockResolvedValue(0)

    const request = new Request(
      "http://localhost:3000/api/anuncios?city=São Paulo"
    )
    await GET(request)

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ city: "São Paulo" }),
      })
    )
  })

  it("applies specialty filter", async () => {
    mockPrisma.listing.findMany.mockResolvedValue([])
    mockPrisma.listing.count.mockResolvedValue(0)

    const request = new Request(
      "http://localhost:3000/api/anuncios?specialty=cardiologia"
    )
    await GET(request)

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          specialties: { some: { specialty: { slug: "cardiologia" } } },
        }),
      })
    )
  })

  it("enforces page and limit bounds", async () => {
    mockPrisma.listing.findMany.mockResolvedValue([])
    mockPrisma.listing.count.mockResolvedValue(0)

    const request = new Request(
      "http://localhost:3000/api/anuncios?page=-1&limit=100"
    )
    const response = await GET(request)
    const body = await response.json()

    expect(body.pagination.page).toBe(1)
    expect(body.pagination.limit).toBe(50) // max 50
  })
})

describe("POST /api/anuncios", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(testSession)
  })

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null)

    const request = new Request("http://localhost:3000/api/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it("returns 400 for invalid data", async () => {
    const request = new Request("http://localhost:3000/api/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "AB" }), // too short
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("creates listing with valid data", async () => {
    mockPrisma.listing.findUnique.mockResolvedValue(null) // no slug collision
    mockPrisma.listing.create.mockResolvedValue({
      id: "new-listing",
      title: "Consultório Teste Centro",
      slug: "consultorio-teste-centro",
      status: "DRAFT",
    })

    const request = new Request("http://localhost:3000/api/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Consultório Teste Centro",
        description: "Sala ampla com ar condicionado",
        city: "São Paulo",
        neighborhood: "Centro",
        whatsapp: "11999998888",
        specialtyIds: ["spec-1"],
        equipmentIds: [],
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    expect(mockPrisma.listing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clinicId: "clinic-1",
          title: "Consultório Teste Centro",
        }),
      })
    )
  })
})
