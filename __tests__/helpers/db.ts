import { vi } from "vitest"

// Mock Prisma client for integration tests
export function createMockPrisma() {
  return {
    /**
     * Sem implementação por padrão. Teste que exercita transação define:
     *   mock.$transaction.mockImplementation((arg) =>
     *     typeof arg === "function" ? arg(mock) : Promise.all(arg))
     */
    $transaction: vi.fn(),
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
    asaasWebhookEvent: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    asaasCharge: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    publicationOrder: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
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
