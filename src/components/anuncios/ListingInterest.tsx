import { Eye, MessageCircle } from "lucide-react"
import type { ListingMetrics } from "@/lib/metrics"

/**
 * Interesse recebido por um anúncio nos últimos 30 dias.
 *
 * Mostra zero explicitamente em vez de esconder o bloco: "0 contatos" é um dado
 * que o anunciante precisa ver para entender por que vale melhorar o anúncio.
 * Esconder faria parecer que a medição não existe.
 */
export function ListingInterest({
  metrics,
  published,
}: {
  metrics: ListingMetrics | undefined
  published: boolean
}) {
  if (!published) return null

  const views = metrics?.views ?? 0
  const contacts = metrics?.contacts ?? 0

  return (
    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {views} {views === 1 ? "visualização" : "visualizações"}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5" />
        {contacts} {contacts === 1 ? "contato" : "contatos"}
      </span>
      <span className="text-muted-foreground/70">nos últimos 30 dias</span>
    </div>
  )
}
