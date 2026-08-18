import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listingInterestRanking } from "@/lib/metrics"

/**
 * Exportação do ranking de interesse em CSV, para a conversa comercial com as
 * clínicas ser feita fora do painel (planilha, e-mail, reunião).
 */

const PERIODS = [7, 30, 90]

/**
 * Uma célula que começa com =, +, - ou @ é interpretada como fórmula pelo Excel
 * e pelo Google Sheets. Como o título do anúncio é texto livre digitado pelo
 * anunciante, sem escapar ele conseguiria fazer a planilha executar fórmula ao
 * ser aberta. O apóstrofo força a leitura como texto.
 */
function csvCell(value: string | number): string {
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const parsed = Number(new URL(request.url).searchParams.get("dias"))
  const days = PERIODS.includes(parsed) ? parsed : 30

  const rows = await listingInterestRanking(days)

  // Separador ";" e BOM para o Excel em português abrir sem quebrar acentuação.
  const header = ["Anuncio", "Anunciante", "Cidade", "Tipo", "Contatos", "Visualizacoes"]
  const lines = [
    header.join(";"),
    ...rows.map((r) =>
      [r.title, r.clinicName, r.city, r.type, r.contacts, r.views]
        .map(csvCell)
        .join(";")
    ),
  ]
  const csv = "﻿" + lines.join("\r\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="interesse-${days}dias.csv"`,
    },
  })
}
