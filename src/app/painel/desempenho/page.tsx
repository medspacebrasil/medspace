export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { listingMonthlyHistory } from "@/lib/metrics"
import { listingStatusLabel } from "@/lib/listing-status"
import { Eye, MessageCircle } from "lucide-react"

const typeLabels: Record<string, string> = {
  CLINIC: "Sala",
  EQUIPMENT: "Aparelho",
  EDUCATION: "Educação",
}

/** "2026-08" vira "Agosto de 2026". O day já é normalizado em UTC. */
function nomeDoMes(month: string): string {
  const nome = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00.000Z`))
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

export default async function DesempenhoPage() {
  const session = await auth()
  if (!session?.user?.clinicId) redirect("/login")

  const listings = await prisma.listing.findMany({
    where: { clinicId: session.user.clinicId },
    select: { id: true, title: true, type: true, status: true },
    orderBy: { updatedAt: "desc" },
  })

  const historico = await listingMonthlyHistory(
    listings.map((l) => l.id),
    12
  )

  return (
    <div>
      <h1 className="text-2xl font-bold">Desempenho</h1>
      <p className="text-muted-foreground">
        Visualizações e contatos de cada anúncio, mês a mês.
      </p>

      {listings.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não tem anúncios. Assim que publicar, o desempenho
              aparece aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {listings.map((listing) => {
            const meses = historico.get(listing.id) ?? []
            return (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{listing.title}</h2>
                    <Badge variant="secondary">
                      {typeLabels[listing.type] ?? listing.type}
                    </Badge>
                    {listing.status !== "PUBLISHED" && (
                      <span className="text-xs text-muted-foreground">
                        {listingStatusLabel(listing.status)}
                      </span>
                    )}
                  </div>

                  {meses.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Nenhuma visualização registrada ainda.
                    </p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full max-w-md text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="py-1.5 pr-4 font-medium">Mês</th>
                            <th className="py-1.5 pr-4 text-right font-medium">
                              <span className="inline-flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                Visualizações
                              </span>
                            </th>
                            <th className="py-1.5 text-right font-medium">
                              <span className="inline-flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                Contatos
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {meses.map((m) => (
                            <tr key={m.month} className="border-t">
                              <td className="py-1.5 pr-4">{nomeDoMes(m.month)}</td>
                              <td className="py-1.5 pr-4 text-right tabular-nums text-muted-foreground">
                                {m.views}
                              </td>
                              <td className="py-1.5 text-right font-medium tabular-nums">
                                {m.contacts}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        A contagem começou em 11/08/2026, então meses anteriores não têm
        histórico. O mês atual é parcial e cresce até o fim do mês. Cada
        visitante conta uma vez por dia em cada anúncio.
      </p>
    </div>
  )
}
