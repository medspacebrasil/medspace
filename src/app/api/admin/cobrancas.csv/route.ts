import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { csvFile } from "@/lib/csv"
import { listarPedidos, filtroValido } from "@/lib/billing/reports"
import {
  situacaoPedido,
  cobrancaDoPedido,
  SITUACAO,
  ORIGEM_LABEL,
  formaPagamentoLabel,
  dataBR,
  dataHoraBR,
  reaisPlanilha,
} from "@/lib/billing/status"

/**
 * Exportação das cobranças em CSV, para conciliação fora do painel
 * (contabilidade, planilha, conferência com o extrato do Asaas).
 */

/** Acima disso a exportação vira arquivo de outro tipo de ferramenta. */
const LIMITE = 5000

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const filtro = filtroValido(
    new URL(request.url).searchParams.get("filtro") ?? undefined
  )
  const now = new Date()
  const { rows, total } = await listarPedidos({ filtro, page: 1, pageSize: LIMITE })

  const header = [
    "Data",
    "Anunciante",
    "Anuncio",
    "Origem",
    "Forma",
    "Valor",
    "Situacao",
    "Pago em",
    "Inicio da vigencia",
    "Fim da vigencia",
    "Cobranca Asaas",
    "Pedido",
  ]

  const linhas: (string | number)[][] = rows.map((p) => {
    const charge = cobrancaDoPedido(p.charges)
    return [
      dataHoraBR(p.createdAt),
      p.clinicName,
      p.listingTitle,
      ORIGEM_LABEL[p.origin],
      formaPagamentoLabel(p.origin, charge?.billingType),
      reaisPlanilha(p.amountCents),
      SITUACAO[situacaoPedido(p, now)].label,
      dataHoraBR(p.paidAt),
      dataBR(p.startsAt),
      dataBR(p.expiresAt),
      charge?.asaasPaymentId ?? "",
      p.id,
    ]
  })

  // Corte visível no próprio arquivo. Um arquivo silenciosamente incompleto
  // leva a fechar caixa com número errado.
  if (total > LIMITE) {
    linhas.push([
      `Exportacao limitada a ${LIMITE} pedidos; ${total - LIMITE} mais antigos nao incluidos`,
    ])
  }

  return new NextResponse(csvFile(header, linhas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cobrancas-${filtro}.csv"`,
    },
  })
}
