import { describe, it, expect } from "vitest"
import { registerSchema, createListingSchema } from "@/lib/validators"

describe("registerSchema - max length validation", () => {
  const validRegister = {
    email: "clinica@test.com",
    password: "12345678",
    name: "Dr. João",
    clinicName: "Clínica Saúde",
    whatsapp: "11999998888",
    city: "São Paulo",
    neighborhood: "Centro",
  }

  it("rejects password over 128 chars", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "a".repeat(129),
    })
    expect(result.success).toBe(false)
  })

  it("rejects name over 100 chars", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects clinicName over 150 chars", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      clinicName: "a".repeat(151),
    })
    expect(result.success).toBe(false)
  })

  it("rejects city over 100 chars", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      city: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects neighborhood over 100 chars", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      neighborhood: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("accepts values at max length", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "a".repeat(128),
      name: "a".repeat(100),
      clinicName: "a".repeat(150),
      city: "a".repeat(100),
      neighborhood: "a".repeat(100),
    })
    expect(result.success).toBe(true)
  })
})

describe("createListingSchema - max length validation", () => {
  const validListing = {
    title: "Consultório Equipado",
    description: "Sala ampla com ar condicionado",
    city: "São Paulo",
    neighborhood: "Centro",
    whatsapp: "11999998888",
    specialtyIds: ["id-1"],
    equipmentIds: [],
  }

  it("rejects fullDescription over 5000 chars", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      fullDescription: "a".repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts fullDescription at 5000 chars", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      fullDescription: "a".repeat(5000),
    })
    expect(result.success).toBe(true)
  })

  it("rejects city over 100 chars", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      city: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects neighborhood over 100 chars", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      neighborhood: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })
})
