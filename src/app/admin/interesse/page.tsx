export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { listingInterestRanking } from "@/lib/metrics"
import { Eye, MessageCircle, Download } from "lucide-react"

const PERIODS = [7, 30, 90] as const

const typeLabels: Record<string, string> = {
  CLINIC: "Sala",
  EQUIPMENT: "Aparelho",
  EDUCATION: "Educação",
}

interface PageProps {
  searchParams: Promise<{ dias?: string }>
}

export default async function AdminInteressePage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const sp = await searchParams
  const parsed = Number(sp.dias)
  const days = PERIODS.includes(parsed as (typeof PERIODS)[number]) ? parsed : 30

  const rows = await listingInterestRanking(days)
  const totals = rows.reduce(
    (acc, r) => ({ views: acc.views + r.views, contacts: acc.contacts + r.contacts }),
    { views: 0, contacts: 0 }
  )
  const comContato = rows.filter((r) => r.contacts > 0).length
  const proporcao = rows.length ? Math.round((comContato / rows.length) * 100) : 0

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Interesse por anúncio</h1>
          <p className="text-muted-foreground">
            Quanto cada anúncio publicado recebeu de procura nos últimos {days} dias.
          </p>
        </div>
        <a
          href={`/api/admin/interesse.csv?dias=${days}`}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Baixar CSV
        </a>
      </div>

      <div className="mt-4 flex gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={`/admin/interesse?dias=${p}`}
            className={
              p === days
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            }
          >
            {p} dias
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Anúncios publicados
            </p>
            <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total de contatos
            </p>
            <p className="mt-1 text-2xl font-bold">{totals.contacts}</p>
            <p className="text-xs text-muted-foreground">
              {totals.views} visualizações
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Anúncios com contato
            </p>
            <p className="mt-1 text-2xl font-bold">{proporcao}%</p>
            <p className="text-xs text-muted-foreground">
              {comContato} de {rows.length} receberam procura
            </p>
          </CardContent>
        </Card>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhum anúncio publicado no momento.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Anúncio</th>
                <th className="p-3 font-medium">Anunciante</th>
                <th className="p-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Contatos
                  </span>
                </th>
                <th className="p-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Visualizações
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.listingId} className="border-t">
                  <td className="p-3">
                    <span className="font-medium">{r.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {typeLabels[r.type] ?? r.type}
                      {r.city ? ` · ${r.city}` : ""}
                    </span>
                  </td>
                  <td className="p-3">{r.clinicName}</td>
                  <td className="p-3 text-right font-medium tabular-nums">
                    {r.contacts}
                  </td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">
                    {r.views}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        A contagem começou em 11/08/2026. Períodos anteriores a essa data não têm
        histórico. Cada visitante conta uma vez por dia em cada anúncio.
      </p>
    </div>
  )
}
