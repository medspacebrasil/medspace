import { describe, it, expect } from "vitest"
import { cn, generateSlug, formatWhatsAppUrl, formatPhone } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("handles conditional classes", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1")
  })

  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})

describe("generateSlug", () => {
  it("converts text to slug", () => {
    expect(generateSlug("Consultório Equipado")).toBe("consultorio-equipado")
  })

  it("handles accents", () => {
    expect(generateSlug("São Paulo")).toBe("sao-paulo")
  })

  it("removes special characters", () => {
    expect(generateSlug("Sala #1 - Centro!")).toBe("sala-1-centro")
  })

  it("handles multiple spaces", () => {
    expect(generateSlug("Sala   Ampla")).toBe("sala-ampla")
  })
})

describe("formatWhatsAppUrl", () => {
  it("generates correct WhatsApp URL with 11-digit phone", () => {
    const url = formatWhatsAppUrl("11999998888", "Olá!")
    expect(url).toBe("https://wa.me/5511999998888?text=Ol%C3%A1!")
  })

  it("generates correct URL with 10-digit phone", () => {
    const url = formatWhatsAppUrl("1133334444", "Olá!")
    expect(url).toBe("https://wa.me/551133334444?text=Ol%C3%A1!")
  })

  it("handles phone already with country code", () => {
    const url = formatWhatsAppUrl("5511999998888", "Test")
    expect(url).toBe("https://wa.me/5511999998888?text=Test")
  })

  it("strips non-digit characters from phone", () => {
    const url = formatWhatsAppUrl("(11) 99999-8888", "Oi")
    expect(url).toBe("https://wa.me/5511999998888?text=Oi")
  })
})

describe("formatPhone", () => {
  it("formats 11-digit phone", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888")
  })

  it("formats 10-digit phone", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444")
  })

  it("returns original for unexpected format", () => {
    expect(formatPhone("123")).toBe("123")
  })
})
