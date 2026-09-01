import { describe, it, expect } from "vitest"
import { brasiliaDay, visitorHash } from "@/lib/metrics"
import { csvCell, csvFile } from "@/lib/csv"

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

describe("csvCell (exportacao do relatorio)", () => {
  // Titulo de anuncio e texto livre e a planilha e aberta pela cliente no
  // Excel, entao a regra fica travada por teste.
  it("neutraliza titulo que viraria formula no Excel", () => {
    // Titulo com aspas tambem e envolvido em aspas, entao o apostrofo fica
    // dentro do campo. E o comportamento correto do CSV.
    expect(csvCell('=HYPERLINK("http://mal.co")')).toBe(
      String.raw`"'=HYPERLINK(""http://mal.co"")"`
    )
    expect(csvCell("=1+1")).toBe("'=1+1")
    expect(csvCell("+1+1")).toBe("'+1+1")
    expect(csvCell("-2")).toBe("'-2")
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)")
  })

  it("nao altera titulo comum", () => {
    expect(csvCell("Consultorio na Asa Sul")).toBe("Consultorio na Asa Sul")
  })

  it("continua escapando aspas e quebras de linha", () => {
    expect(csvCell('Sala "premium"')).toBe('"Sala ""premium"""')
    expect(csvCell("linha1\nlinha2")).toBe('"linha1\nlinha2"')
  })

  it("monta o arquivo com BOM, ponto e virgula e CRLF", () => {
    const csv = csvFile(["A", "B"], [["x", 1]])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.slice(1)).toBe("A;B\r\nx;1")
  })
})
