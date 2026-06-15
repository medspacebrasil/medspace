import { describe, it, expect } from "vitest"
import {
  isValidCPF,
  isValidCNPJ,
  formatDocument,
  onlyDigits,
} from "@/lib/validators/document"
import { registerSchema } from "@/lib/validators"

describe("isValidCPF", () => {
  it("accepts a valid CPF (with and without mask)", () => {
    expect(isValidCPF("111.444.777-35")).toBe(true)
    expect(isValidCPF("11144477735")).toBe(true)
  })

  it("rejects wrong check digits", () => {
    expect(isValidCPF("11144477736")).toBe(false)
  })

  it("rejects repeated sequences", () => {
    expect(isValidCPF("11111111111")).toBe(false)
    expect(isValidCPF("00000000000")).toBe(false)
  })

  it("rejects wrong length", () => {
    expect(isValidCPF("123456789")).toBe(false)
    expect(isValidCPF("111444777350")).toBe(false)
  })
})

describe("isValidCNPJ", () => {
  it("accepts a valid CNPJ (with and without mask)", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true)
    expect(isValidCNPJ("11222333000181")).toBe(true)
  })

  it("rejects wrong check digits", () => {
    expect(isValidCNPJ("11222333000182")).toBe(false)
  })

  it("rejects repeated sequences", () => {
    expect(isValidCNPJ("11111111111111")).toBe(false)
  })

  it("rejects wrong length", () => {
    expect(isValidCNPJ("1122233300018")).toBe(false)
  })
})

describe("formatDocument", () => {
  it("masks CPF", () => {
    expect(formatDocument("11144477735", "CPF")).toBe("111.444.777-35")
  })
  it("masks CNPJ", () => {
    expect(formatDocument("11222333000181", "CNPJ")).toBe("11.222.333/0001-81")
  })
  it("onlyDigits strips mask", () => {
    expect(onlyDigits("111.444.777-35")).toBe("11144477735")
  })
})

describe("registerSchema document rules", () => {
  const base = {
    email: "a@test.com",
    password: "12345678",
    name: "Dr. João",
    clinicName: "Consultório Silva",
    whatsapp: "11999998888",
    city: "São Paulo",
    neighborhood: "Centro",
    acceptTerms: "on",
  }

  it("requires a valid CPF when advertiser is MEDICO", () => {
    const ok = registerSchema.safeParse({
      ...base,
      advertiserType: "MEDICO",
      document: "111.444.777-35",
    })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.data.document).toBe("11144477735") // normalized

    const bad = registerSchema.safeParse({
      ...base,
      advertiserType: "MEDICO",
      document: "11.222.333/0001-81", // CNPJ, not CPF
    })
    expect(bad.success).toBe(false)
  })

  it("requires a valid CNPJ when advertiser is a company type", () => {
    const ok = registerSchema.safeParse({
      ...base,
      advertiserType: "EMPRESA",
      document: "11.222.333/0001-81",
    })
    expect(ok.success).toBe(true)

    const bad = registerSchema.safeParse({
      ...base,
      advertiserType: "CLINICA",
      document: "111.444.777-35", // CPF, not CNPJ
    })
    expect(bad.success).toBe(false)
  })

  it("rejects an unknown advertiser type", () => {
    const result = registerSchema.safeParse({
      ...base,
      advertiserType: "PIRATA",
      document: "11222333000181",
    })
    expect(result.success).toBe(false)
  })
})
