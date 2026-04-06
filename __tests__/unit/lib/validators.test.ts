import { describe, it, expect } from "vitest"
import {
  loginSchema,
  registerSchema,
  createListingSchema,
  updateListingSchema,
} from "@/lib/validators"

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "12345678",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "1234567",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty fields", () => {
    const result = loginSchema.safeParse({ email: "", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const validRegister = {
    email: "clinica@test.com",
    password: "12345678",
    name: "Dr. João",
    clinicName: "Clínica Saúde",
    whatsapp: "11999998888",
    city: "São Paulo",
    neighborhood: "Centro",
  }

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validRegister)
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      email: "not-email",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid whatsapp (too short)", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      whatsapp: "123456789",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid whatsapp (too long)", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      whatsapp: "123456789012",
    })
    expect(result.success).toBe(false)
  })

  it("accepts 10-digit whatsapp", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      whatsapp: "1133334444",
    })
    expect(result.success).toBe(true)
  })

  it("accepts 11-digit whatsapp", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      whatsapp: "11933334444",
    })
    expect(result.success).toBe(true)
  })

  it("rejects whatsapp with non-digits", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      whatsapp: "(11) 99999-8888",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short name", () => {
    const result = registerSchema.safeParse({ ...validRegister, name: "A" })
    expect(result.success).toBe(false)
  })

  it("rejects short clinic name", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      clinicName: "A",
    })
    expect(result.success).toBe(false)
  })
})

describe("createListingSchema", () => {
  const validListing = {
    title: "Consultório Equipado",
    description: "Sala ampla com ar condicionado",
    city: "São Paulo",
    neighborhood: "Centro",
    whatsapp: "11999998888",
    specialtyIds: ["id-1"],
    equipmentIds: [],
  }

  it("accepts valid listing data", () => {
    const result = createListingSchema.safeParse(validListing)
    expect(result.success).toBe(true)
  })

  it("rejects short title", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      title: "AB",
    })
    expect(result.success).toBe(false)
  })

  it("rejects title over 120 chars", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      title: "A".repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it("rejects short description (under 10 chars)", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      description: "Curta",
    })
    expect(result.success).toBe(false)
  })

  it("rejects description over 300 chars", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      description: "A".repeat(301),
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty specialtyIds", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      specialtyIds: [],
    })
    expect(result.success).toBe(false)
  })

  it("accepts optional fields", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      fullDescription: "Full description here",
      roomTypeId: "room-type-id",
    })
    expect(result.success).toBe(true)
  })

  it("defaults equipmentIds to empty array", () => {
    const data = { ...validListing }
    delete (data as Record<string, unknown>).equipmentIds
    const result = createListingSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.equipmentIds).toEqual([])
    }
  })
})

describe("updateListingSchema", () => {
  it("accepts partial updates", () => {
    const result = updateListingSchema.safeParse({ title: "New Title" })
    expect(result.success).toBe(true)
  })

  it("accepts empty object", () => {
    const result = updateListingSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("still validates title length when provided", () => {
    const result = updateListingSchema.safeParse({ title: "AB" })
    expect(result.success).toBe(false)
  })
})
