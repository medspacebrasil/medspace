import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { testSession } from "../../helpers/auth"

let mockPrisma: MockPrisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAuthFn: any

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

const { GET, PUT, DELETE } = await import("@/app/api/anuncios/[id]/route")

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe("GET /api/anuncios/[id]", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(null)
  })

  it("returns listing by id or slug", async () => {
    const mockListing = {
      id: "listing-1",
      title: "Consultório Centro",
      slug: "consultorio-centro",
      status: "PUBLISHED",
      clinic: { name: "Clínica Teste", phone: null },
      roomType: null,
      specialties: [],
      equipment: [],
      images: [],
    }
    mockPrisma.listing.findFirst.mockResolvedValue(mockListing)

    const request = new Request("http://localhost:3000/api/anuncios/listing-1")
    const response = await GET(request, makeContext("listing-1"))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.id).toBe("listing-1")
    expect(mockPrisma.listing.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ id: "listing-1" }, { slug: "listing-1" }],
          status: "PUBLISHED",
        },
      })
    )
  })

  it("returns 404 when listing not found", async () => {
    mockPrisma.listing.findFirst.mockResolvedValue(null)

    const request = new Request("http://localhost:3000/api/anuncios/nonexistent")
    const response = await GET(request, makeContext("nonexistent"))

    expect(response.status).toBe(404)
  })
})

describe("DELETE /api/anuncios/[id]", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(testSession)
  })

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null)

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "DELETE",
    })
    const response = await DELETE(request, makeContext("listing-1"))

    expect(response.status).toBe(401)
  })

  it("returns 404 when listing not found", async () => {
    mockPrisma.listing.findUnique.mockResolvedValue(null)

    const request = new Request("http://localhost:3000/api/anuncios/nonexistent", {
      method: "DELETE",
    })
    const response = await DELETE(request, makeContext("nonexistent"))

    expect(response.status).toBe(404)
  })

  it("returns 403 when clinic does not own listing", async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ clinicId: "other-clinic" })

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "DELETE",
    })
    const response = await DELETE(request, makeContext("listing-1"))

    expect(response.status).toBe(403)
  })

  it("deletes listing owned by authenticated clinic", async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ clinicId: "clinic-1" })
    mockPrisma.listing.delete.mockResolvedValue({})

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "DELETE",
    })
    const response = await DELETE(request, makeContext("listing-1"))

    expect(response.status).toBe(204)
    expect(mockPrisma.listing.delete).toHaveBeenCalledWith({
      where: { id: "listing-1" },
    })
  })
})

describe("PUT /api/anuncios/[id]", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(testSession)
  })

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null)

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    })
    const response = await PUT(request, makeContext("listing-1"))

    expect(response.status).toBe(401)
  })

  it("returns 400 for invalid data", async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ clinicId: "clinic-1" })

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "AB" }), // too short
    })
    const response = await PUT(request, makeContext("listing-1"))

    expect(response.status).toBe(400)
  })

  it("updates listing with valid data", async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ clinicId: "clinic-1" })
    mockPrisma.listing.update.mockResolvedValue({
      id: "listing-1",
      title: "Updated Title Here",
    })

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated Title Here" }),
    })
    const response = await PUT(request, makeContext("listing-1"))

    expect(response.status).toBe(200)
    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "listing-1" },
      })
    )
  })
})
