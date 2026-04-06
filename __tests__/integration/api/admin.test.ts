import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { adminSession } from "../../helpers/auth"

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

describe("PATCH /api/admin/anuncios/[id]/status", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
  })

  it("approves a pending listing", async () => {
    const { PATCH } = await import(
      "@/app/api/admin/anuncios/[id]/status/route"
    )

    mockPrisma.listing.findUnique.mockResolvedValue({
      id: "listing-1",
      status: "PENDING",
    })
    mockPrisma.listing.update.mockResolvedValue({
      id: "listing-1",
      status: "PUBLISHED",
    })

    const request = new Request(
      "http://localhost:3000/api/admin/anuncios/listing-1/status",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "listing-1" }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("PUBLISHED")
    expect(mockPrisma.listing.update).toHaveBeenCalledWith({
      where: { id: "listing-1" },
      data: { status: "PUBLISHED" },
    })
  })

  it("rejects invalid status", async () => {
    const { PATCH } = await import(
      "@/app/api/admin/anuncios/[id]/status/route"
    )

    const request = new Request(
      "http://localhost:3000/api/admin/anuncios/listing-1/status",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INVALID" }),
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "listing-1" }),
    })
    expect(response.status).toBe(400)
  })

  it("returns 404 for non-existent listing", async () => {
    const { PATCH } = await import(
      "@/app/api/admin/anuncios/[id]/status/route"
    )

    mockPrisma.listing.findUnique.mockResolvedValue(null)

    const request = new Request(
      "http://localhost:3000/api/admin/anuncios/nonexistent/status",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      }
    )

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    })
    expect(response.status).toBe(404)
  })
})

describe("GET /api/admin/anuncios", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    mockAuthFn = vi.fn().mockResolvedValue(adminSession)
  })

  it("returns all listings for admin", async () => {
    const { GET } = await import("@/app/api/admin/anuncios/route")

    mockPrisma.listing.findMany.mockResolvedValue([
      { id: "1", title: "Listing 1", status: "PENDING" },
      { id: "2", title: "Listing 2", status: "PUBLISHED" },
    ])

    const request = new Request(
      "http://localhost:3000/api/admin/anuncios"
    )
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveLength(2)
  })

  it("filters by status", async () => {
    const { GET } = await import("@/app/api/admin/anuncios/route")

    mockPrisma.listing.findMany.mockResolvedValue([])

    const request = new Request(
      "http://localhost:3000/api/admin/anuncios?status=PENDING"
    )
    await GET(request)

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PENDING" },
      })
    )
  })
})
