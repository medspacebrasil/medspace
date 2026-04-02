import { vi } from "vitest"

export function mockAuth(session: {
  user: {
    id: string
    email: string
    name: string
    role: string
    clinicId?: string
  }
} | null) {
  return vi.fn().mockResolvedValue(session)
}

export const testSession = {
  user: {
    id: "user-1",
    email: "clinica@test.com",
    name: "Test Clinic",
    role: "CLINIC",
    clinicId: "clinic-1",
  },
}

export const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@test.com",
    name: "Test Admin",
    role: "ADMIN",
    clinicId: undefined,
  },
}
