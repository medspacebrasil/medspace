export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatBRL } from "@/lib/billing/pricing"
import {
  resumoRecebimentos,
  listarPedidos,
  filtroValido,
  paginaValida,
  FILTROS,
  type Filtro,
} from "@/lib/billing/reports"
import {
  situacaoPedido,
  cobrancaDoPedido,
  SITUACAO,
  ORIGEM_LABEL,
  formaPagamentoLabel,
  dataBR,
  dataHoraBR,
} from "@/lib/billing/status"
import { Download, ExternalLink } from "lucide-react"

const FILTRO_LABEL: Record<Filtro, string> = {
  todos: "Todos",
  aguardando: "Aguardando",
  pagos: "Pagos",
  vencidos: "Vencidos",
  estornos: "Estornos e disputas",
  cortesias: "Cortesias",
}

/** Caminho de edição no admin por tipo de anúncio. */
const EDIT_PATH: Record<string, string> = {
  CLINIC: "anuncios",
  EQUIPMENT: "aparelhos",
  EDUCATION: "educacao",
}

interface PageProps {
  searchParams: Promise<{ filtro?: string; page?: string }>
}

export default async function AdminCobrancasPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const sp = await searchParams
  const filtro = filtroValido(sp.filtro)
  const now = new Date()

  const [resumo, lista] = await Promise.all([
    resumoRecebimentos(now),
    listarPedidos({ filtro, page: paginaValida(sp.page) }),
  ])
  // Página efetiva, já presa ao intervalo real pela consulta.
  const page = lista.page

  const href = (f: Filtro, p = 1) =>
    `/admin/cobrancas?filtro=${f}${p > 1 ? `&page=${p}` : ""}`
  const mes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(now)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cobranças</h1>
          <p className="text-muted-foreground">
            Recebimentos das taxas de publicação, pedido a pedido.
          </p>
        </div>
        <a
          href={`/api/admin/cobrancas.csv?filtro=${filtro}`}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Baixar CSV
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Recebido em {mes}
            </p>
            <p className="mt-1 text-2xl font-bold">{formatBRL(resumo.mesCents)}</p>
            <p className="text-xs text-muted-foreground">
              {resumo.mesQtd} {resumo.mesQtd === 1 ? "pagamento" : "pagamentos"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Recebido no total
            </p>
            <p className="mt-1 text-2xl font-bold">{formatBRL(resumo.totalCents)}</p>
            <p className="text-xs text-muted-foreground">
              {resumo.totalQtd} {resumo.totalQtd === 1 ? "pagamento" : "pagamentos"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Aguardando pagamento
            </p>
            <p className="mt-1 text-2xl font-bold">{resumo.aguardandoQtd}</p>
            <p className="text-xs text-muted-foreground">
              {formatBRL(resumo.aguardandoCents)} a receber
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Publicações pagas no ar
            </p>
            <p className="mt-1 text-2xl font-bold">{resumo.vigentesPagos}</p>
            <p className="text-xs text-muted-foreground">
              {resumo.vigentesCortesia}{" "}
              {resumo.vigentesCortesia === 1 ? "cortesia vigente" : "cortesias vigentes"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Estornos
            </p>
            <p className="mt-1 text-2xl font-bold">{formatBRL(resumo.estornadoCents)}</p>
            <p className="text-xs text-muted-foreground">
              {resumo.estornadoQtd} {resumo.estornadoQtd === 1 ? "estorno" : "estornos"}
              {resumo.disputas > 0 && ` · ${resumo.disputas} em disputa`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            className={
              f === filtro
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            }
          >
            {FILTRO_LABEL[f]}
          </Link>
        ))}
      </div>

      {lista.rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {filtro === "todos"
            ? "Nenhum pedido registrado ainda. O primeiro aparece aqui assim que um anúncio for para pagamento."
            : "Nenhum pedido neste filtro."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Data</th>
                <th className="p-3 font-medium">Anunciante</th>
                <th className="p-3 font-medium">Anúncio</th>
                <th className="p-3 font-medium">Forma</th>
                <th className="p-3 text-right font-medium">Valor</th>
                <th className="p-3 font-medium">Situação</th>
                <th className="p-3 font-medium">Vigência</th>
                <th className="p-3 font-medium">Asaas</th>
              </tr>
            </thead>
            <tbody>
              {lista.rows.map((p) => {
                const charge = cobrancaDoPedido(p.charges)
                const sit = SITUACAO[situacaoPedido(p, now)]
                const editPath = p.listing
                  ? `/admin/${EDIT_PATH[p.listing.type] ?? "anuncios"}/${p.listing.id}/editar`
                  : null
                return (
                  <tr key={p.id} className="border-t align-top">
                    <td className="whitespace-nowrap p-3 tabular-nums text-muted-foreground">
                      {dataHoraBR(p.createdAt)}
                    </td>
                    <td className="p-3">
                      {p.clinicName}
                      {!p.clinicId && (
                        <span className="block text-xs text-muted-foreground">
                          cadastro excluído
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {editPath ? (
                        <Link href={editPath} className="font-medium hover:underline">
                          {p.listingTitle}
                        </Link>
                      ) : (
                        <span className="font-medium">{p.listingTitle}</span>
                      )}
                      <span className="block text-xs text-muted-foreground">
                        {ORIGEM_LABEL[p.origin]}
                        {!p.listing && " · anúncio excluído"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {formaPagamentoLabel(p.origin, charge?.billingType)}
                    </td>
                    <td className="whitespace-nowrap p-3 text-right font-medium tabular-nums">
                      {formatBRL(p.amountCents)}
                    </td>
                    <td className="p-3">
                      <Badge variant={sit.variant}>{sit.label}</Badge>
                      {p.paidAt && (
                        <span className="block pt-1 text-xs text-muted-foreground">
                          pago em {dataBR(p.paidAt)}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-3 tabular-nums text-muted-foreground">
                      {p.startsAt && p.expiresAt
                        ? `${dataBR(p.startsAt)} a ${dataBR(p.expiresAt)}`
                        : ""}
                    </td>
                    <td className="p-3">
                      {charge?.invoiceUrl && (
                        <a
                          href={charge.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        >
                          Fatura
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {charge && (
                        <span className="block font-mono text-[11px] text-muted-foreground">
                          {charge.asaasPaymentId}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {lista.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={href(filtro, page - 1)}>
              <Button variant="outline" size="sm">
                Anterior
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Página {page} de {lista.totalPages}
          </span>
          {page < lista.totalPages ? (
            <Link href={href(filtro, page + 1)}>
              <Button variant="outline" size="sm">
                Próxima
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Próxima
            </Button>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Valores brutos, antes das tarifas do Asaas. Cartão entra como recebido na
        confirmação; a liquidação na conta acontece depois. A situação de cada
        cobrança chega pelo webhook do Asaas, e a varredura diária reconcilia o
        que ficar para trás.
      </p>
    </div>
  )
}
