import { vi } from "vitest"

// Mock Prisma client for integration tests
export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    clinic: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    listing: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    listingImage: {
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    specialty: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    equipment: {
      findMany: vi.fn(),
    },
    roomType: {
      findMany: vi.fn(),
    },
  }
}

export type MockPrisma = ReturnType<typeof createMockPrisma>
