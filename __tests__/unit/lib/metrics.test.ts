import { describe, it, expect } from "vitest"
import { brasiliaDay, visitorHash } from "@/lib/metrics"

describe("brasiliaDay", () => {
  it("usa o fuso de Brasília, não o UTC do servidor", () => {
    // 02:00 UTC de 12/08 ainda é 23:00 de 11/08 em Brasília (GMT-3).
    const { key } = brasiliaDay(new Date("2026-08-12T02:00:00.000Z"))
    expect(key).toBe("2026-08-11")
  })

  it("vira o dia às 03:00 UTC", () => {
    expect(brasiliaDay(new Date("2026-08-12T03:00:00.000Z")).key).toBe("2026-08-12")
  })

  it("devolve a data normalizada em meia-noite UTC", () => {
    const { date } = brasiliaDay(new Date("2026-08-11T18:30:00.000Z"))
    expect(date.toISOString()).toBe("2026-08-11T00:00:00.000Z")
  })
})

describe("visitorHash", () => {
  const ip = "203.0.113.10"
  const ua = "Mozilla/5.0"

  it("é estável para o mesmo visitante no mesmo dia", () => {
    expect(visitorHash(ip, ua, "2026-08-11")).toBe(visitorHash(ip, ua, "2026-08-11"))
  })

  it("muda no dia seguinte, para não rastrear a pessoa ao longo do tempo", () => {
    expect(visitorHash(ip, ua, "2026-08-11")).not.toBe(
      visitorHash(ip, ua, "2026-08-12")
    )
  })

  it("separa visitantes diferentes", () => {
    expect(visitorHash(ip, ua, "2026-08-11")).not.toBe(
      visitorHash("198.51.100.7", ua, "2026-08-11")
    )
    expect(visitorHash(ip, ua, "2026-08-11")).not.toBe(
      visitorHash(ip, "outro-agente", "2026-08-11")
    )
  })

  it("não expõe o IP nem o user-agent no resultado", () => {
    const hash = visitorHash(ip, ua, "2026-08-11")
    expect(hash).not.toContain(ip)
    expect(hash).not.toContain(ua)
    expect(hash).toMatch(/^[a-f0-9]{32}$/)
  })
})
