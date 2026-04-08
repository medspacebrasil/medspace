import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockPrisma, type MockPrisma } from "../../helpers/db"
import { testSession, adminSession } from "../../helpers/auth"

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

describe("Admin API Authorization", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma()
  })

  describe("GET /api/admin/clinicas", () => {
    it("returns 403 when user is not admin", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(testSession)
      const { GET } = await import("@/app/api/admin/clinicas/route")

      const response = await GET()
      expect(response.status).toBe(403)
    })

    it("returns 403 when user is not authenticated", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(null)
      const { GET } = await import("@/app/api/admin/clinicas/route")

      const response = await GET()
      expect(response.status).toBe(403)
    })

    it("returns clinics when user is admin", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(adminSession)
      const { GET } = await import("@/app/api/admin/clinicas/route")

      mockPrisma.clinic.findMany.mockResolvedValue([
        { id: "clinic-1", name: "Test Clinic" },
      ])

      const response = await GET()
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveLength(1)
    })
  })

  describe("GET /api/admin/anuncios", () => {
    it("returns 403 when user is not admin", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(testSession)
      const { GET } = await import("@/app/api/admin/anuncios/route")

      const request = new Request("http://localhost:3000/api/admin/anuncios")
      const response = await GET(request)
      expect(response.status).toBe(403)
    })

    it("returns 403 when not authenticated", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(null)
      const { GET } = await import("@/app/api/admin/anuncios/route")

      const request = new Request("http://localhost:3000/api/admin/anuncios")
      const response = await GET(request)
      expect(response.status).toBe(403)
    })

    it("ignores invalid status filter values", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(adminSession)
      const { GET } = await import("@/app/api/admin/anuncios/route")

      mockPrisma.listing.findMany.mockResolvedValue([])

      const request = new Request(
        "http://localhost:3000/api/admin/anuncios?status=INVALID_STATUS"
      )
      await GET(request)

      // Should not include the invalid status in the where clause
      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      )
    })

    it("applies valid status filter", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(adminSession)
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

  describe("PATCH /api/admin/anuncios/[id]/status", () => {
    it("returns 403 when user is not admin", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(testSession)
      const { PATCH } = await import(
        "@/app/api/admin/anuncios/[id]/status/route"
      )

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
      expect(response.status).toBe(403)
    })

    it("returns 403 when not authenticated", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(null)
      const { PATCH } = await import(
        "@/app/api/admin/anuncios/[id]/status/route"
      )

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
      expect(response.status).toBe(403)
    })

    it("allows PENDING status transition", async () => {
      mockAuthFn = vi.fn().mockResolvedValue(adminSession)
      const { PATCH } = await import(
        "@/app/api/admin/anuncios/[id]/status/route"
      )

      mockPrisma.listing.findUnique.mockResolvedValue({
        id: "listing-1",
        status: "PUBLISHED",
      })
      mockPrisma.listing.update.mockResolvedValue({
        id: "listing-1",
        status: "PENDING",
      })

      const request = new Request(
        "http://localhost:3000/api/admin/anuncios/listing-1/status",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PENDING" }),
        }
      )

      const response = await PATCH(request, {
        params: Promise.resolve({ id: "listing-1" }),
      })
      expect(response.status).toBe(200)
    })
  })
})
