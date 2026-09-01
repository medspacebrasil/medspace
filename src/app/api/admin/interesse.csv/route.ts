import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listingInterestRanking } from "@/lib/metrics"
import { csvFile } from "@/lib/csv"

/**
 * Exportação do ranking de interesse em CSV, para a conversa comercial com as
 * clínicas ser feita fora do painel (planilha, e-mail, reunião).
 */

const PERIODS = [7, 30, 90]

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const parsed = Number(new URL(request.url).searchParams.get("dias"))
  const days = PERIODS.includes(parsed) ? parsed : 30

  const rows = await listingInterestRanking(days)

  const header = ["Anuncio", "Anunciante", "Cidade", "Tipo", "Contatos", "Visualizacoes"]
  const csv = csvFile(
    header,
    rows.map((r) => [r.title, r.clinicName, r.city, r.type, r.contacts, r.views])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="interesse-${days}dias.csv"`,
    },
  })
}
