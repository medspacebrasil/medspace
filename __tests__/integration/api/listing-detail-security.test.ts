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

describe("GET /api/anuncios/[id] - Security", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(null)
  })

  it("does not expose clinic phone in public listing response", async () => {
    const { GET } = await import("@/app/api/anuncios/[id]/route")

    mockPrisma.listing.findFirst.mockResolvedValue({
      id: "listing-1",
      title: "Test Listing",
      clinic: { name: "Test Clinic" },
      images: [],
      specialties: [],
      equipment: [],
    })

    const request = new Request("http://localhost:3000/api/anuncios/listing-1")
    await GET(request, { params: Promise.resolve({ id: "listing-1" }) })

    // Verify the query does NOT include phone in the clinic select
    const findFirstCall = mockPrisma.listing.findFirst.mock.calls[0][0]
    const clinicSelect = findFirstCall.include.clinic.select
    expect(clinicSelect).not.toHaveProperty("phone")
    expect(clinicSelect).toHaveProperty("name")
  })

  it("returns 404 for non-existent listing", async () => {
    const { GET } = await import("@/app/api/anuncios/[id]/route")

    mockPrisma.listing.findFirst.mockResolvedValue(null)

    const request = new Request("http://localhost:3000/api/anuncios/nonexistent")
    const response = await GET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    })
    expect(response.status).toBe(404)
  })
})

describe("DELETE /api/anuncios/[id] - Authorization", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(testSession)
  })

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null)
    const { DELETE } = await import("@/app/api/anuncios/[id]/route")

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "DELETE",
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "listing-1" }),
    })
    expect(response.status).toBe(401)
  })

  it("returns 403 when listing belongs to another clinic", async () => {
    const { DELETE } = await import("@/app/api/anuncios/[id]/route")

    mockPrisma.listing.findUnique.mockResolvedValue({
      id: "listing-1",
      clinicId: "other-clinic",
    })

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "DELETE",
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "listing-1" }),
    })
    expect(response.status).toBe(403)
  })

  it("allows deletion by owner", async () => {
    const { DELETE } = await import("@/app/api/anuncios/[id]/route")

    mockPrisma.listing.findUnique.mockResolvedValue({
      id: "listing-1",
      clinicId: "clinic-1",
    })
    mockPrisma.listing.delete.mockResolvedValue({})

    const request = new Request("http://localhost:3000/api/anuncios/listing-1", {
      method: "DELETE",
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "listing-1" }),
    })
    expect(response.status).toBe(204)
  })
})
