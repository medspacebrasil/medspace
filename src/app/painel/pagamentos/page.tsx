export const dynamic = "force-dynamic"

import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatBRL } from "@/lib/billing/pricing"
import { pedidosDoAnunciante } from "@/lib/billing/reports"
import {
  situacaoPedido,
  cobrancaDoPedido,
  podePagar,
  rotuloPagar,
  fraseVigencia,
  SITUACAO,
  PAGO_STATUS,
  formaPagamentoLabel,
  dataBR,
} from "@/lib/billing/status"
import { CreditCard, ExternalLink, Receipt } from "lucide-react"

export default async function PagamentosPage() {
  const session = await auth()
  if (!session?.user?.clinicId) redirect("/login")

  const pedidos = await pedidosDoAnunciante(session.user.clinicId)
  const now = new Date()

  // Só o pedido mais recente de cada anúncio ganha o botão de pagar. Pedido
  // antigo do mesmo anúncio já foi substituído; oferecer pagamento nele
  // criaria duas cobranças para a mesma publicação.
  const maisRecente = new Map<string, string>()
  for (const p of pedidos) {
    if (p.listing && !maisRecente.has(p.listing.id)) maisRecente.set(p.listing.id, p.id)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Pagamentos</h1>
      <p className="text-muted-foreground">
        Histórico das taxas de publicação dos seus anúncios.
      </p>

      {pedidos.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum pagamento até agora. Quando um anúncio seu tiver taxa de
              publicação, a cobrança e o comprovante aparecem aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {pedidos.map((p) => {
            const charge = cobrancaDoPedido(p.charges)
            const situacao = situacaoPedido(p, now)
            const sit = SITUACAO[situacao]
            const frase = fraseVigencia(situacao, p.expiresAt, p.listing?.status)
            const pagavel =
              !!p.listing &&
              podePagar(p.listing.status, situacao) &&
              maisRecente.get(p.listing.id) === p.id
            const comprovante = !!charge && PAGO_STATUS.has(charge.status)

            return (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{p.listingTitle}</h3>
                      <Badge variant={sit.variant}>{sit.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dataBR(p.createdAt)} &middot;{" "}
                      {formaPagamentoLabel(p.origin, charge?.billingType)} &middot;{" "}
                      <span className="font-medium text-foreground">
                        {formatBRL(p.amountCents)}
                      </span>
                    </p>
                    {frase && (
                      <p className="mt-1 text-xs text-muted-foreground">{frase}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {charge?.invoiceUrl && (
                      <a
                        href={charge.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                      >
                        {comprovante ? "Comprovante" : "Ver cobrança"}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {pagavel && p.listing && (
                      <Link href={`/painel/anuncios/${p.listing.id}/pagamento`}>
                        <Button size="sm" className="gap-2">
                          <CreditCard className="h-4 w-4" />
                          {rotuloPagar(situacao)}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {pedidos.length > 0 && (
        <p className="mt-6 text-xs text-muted-foreground">
          Os pagamentos são processados pelo Asaas, que emite o comprovante. Sem
          renovação automática e sem cobrança recorrente: cada publicação é uma
          cobrança única, pelo prazo informado na hora de pagar.
        </p>
      )}
    </div>
  )
}
