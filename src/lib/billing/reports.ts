import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { inicioDoMesBrasilia } from "./status"

/**
 * Consultas do painel financeiro.
 *
 * Somente leitura. Nada aqui muda pedido, cobrança ou anúncio: quem escreve
 * é o webhook, a varredura diária e o checkout. Este arquivo só consolida.
 */

/**
 * O que conta como recebido.
 *
 * A base é `paidAt`, e não `status = PAID`. O status descreve a máquina de
 * cobrança e muda por motivos que não desfazem o pagamento; a data de
 * pagamento só existe se o dinheiro entrou. Estorno e chargeback saem porque
 * o dinheiro saiu ou está retido. Cortesia tem valor zero e não altera soma,
 * mas fica fora para não inflar a contagem de pagamentos.
 */
const RECEBIDO: Prisma.PublicationOrderWhereInput = {
  paidAt: { not: null },
  status: { notIn: ["REFUNDED", "CHARGEBACK_OPEN"] },
  origin: "PAID_CHARGE",
}

const CORTESIA: Prisma.PublicationOrderWhereInput = {
  origin: { in: ["LAUNCH_COURTESY", "ADMIN_GRANT"] },
}

export interface ResumoRecebimentos {
  inicioMes: Date
  mesCents: number
  mesQtd: number
  totalCents: number
  totalQtd: number
  aguardandoCents: number
  aguardandoQtd: number
  /** Pedidos pagos com vigência em curso. */
  vigentesPagos: number
  vigentesCortesia: number
  estornadoCents: number
  estornadoQtd: number
  disputas: number
}

export async function resumoRecebimentos(
  now: Date = new Date()
): Promise<ResumoRecebimentos> {
  const inicioMes = inicioDoMesBrasilia(now)

  const [mes, total, aguardando, vigentesPagos, vigentesCortesia, estornos, disputas] =
    await Promise.all([
      prisma.publicationOrder.aggregate({
        _sum: { amountCents: true },
        _count: true,
        where: { ...RECEBIDO, paidAt: { gte: inicioMes } },
      }),
      prisma.publicationOrder.aggregate({
        _sum: { amountCents: true },
        _count: true,
        where: RECEBIDO,
      }),
      prisma.publicationOrder.aggregate({
        _sum: { amountCents: true },
        _count: true,
        where: { status: "PENDING_PAYMENT" },
      }),
      // "No ar" exige o anúncio publicado de fato: vigência paga de anúncio
      // arquivado, excluído ou de volta à análise não conta.
      prisma.publicationOrder.count({
        where: {
          status: "PAID",
          origin: "PAID_CHARGE",
          expiresAt: { gte: now },
          listing: { status: "PUBLISHED" },
        },
      }),
      prisma.publicationOrder.count({
        where: {
          ...CORTESIA,
          status: "PAID",
          expiresAt: { gte: now },
          listing: { status: "PUBLISHED" },
        },
      }),
      prisma.publicationOrder.aggregate({
        _sum: { amountCents: true },
        _count: true,
        where: { status: "REFUNDED" },
      }),
      prisma.publicationOrder.count({ where: { status: "CHARGEBACK_OPEN" } }),
    ])

  return {
    inicioMes,
    mesCents: mes._sum.amountCents ?? 0,
    mesQtd: mes._count,
    totalCents: total._sum.amountCents ?? 0,
    totalQtd: total._count,
    aguardandoCents: aguardando._sum.amountCents ?? 0,
    aguardandoQtd: aguardando._count,
    vigentesPagos,
    vigentesCortesia,
    estornadoCents: estornos._sum.amountCents ?? 0,
    estornadoQtd: estornos._count,
    disputas,
  }
}

/**
 * Filtros da listagem. As chaves são o que vai na URL, em português, para a
 * cliente conseguir mandar um link "olha os vencidos" sem decorar enum.
 */
export const FILTROS = [
  "todos",
  "aguardando",
  "pagos",
  "vencidos",
  "estornos",
  "cortesias",
] as const
export type Filtro = (typeof FILTROS)[number]

export function filtroValido(valor: string | undefined): Filtro {
  return FILTROS.includes(valor as Filtro) ? (valor as Filtro) : "todos"
}

const WHERE_POR_FILTRO: Record<Filtro, Prisma.PublicationOrderWhereInput> = {
  todos: {},
  aguardando: { status: "PENDING_PAYMENT" },
  // Mesmo critério do card "Recebido", para o número e a lista baterem.
  pagos: RECEBIDO,
  vencidos: { status: "EXPIRED_UNPAID", paidAt: null },
  estornos: { status: { in: ["REFUNDED", "CHARGEBACK_OPEN"] } },
  cortesias: CORTESIA,
}

/**
 * Todas as cobranças do pedido, da mais nova para a mais antiga. São poucas
 * (uma por tentativa de pagamento), e a escolha de qual representa o pedido
 * fica em `cobrancaDoPedido`, que prefere a paga à mais recente.
 */
const INCLUDE_PEDIDO = {
  charges: {
    orderBy: { createdAt: "desc" },
    select: {
      asaasPaymentId: true,
      billingType: true,
      status: true,
      invoiceUrl: true,
    },
  },
  listing: { select: { id: true, slug: true, type: true, status: true } },
} satisfies Prisma.PublicationOrderInclude

export type PedidoListado = Prisma.PublicationOrderGetPayload<{
  include: typeof INCLUDE_PEDIDO
}>

export interface ListarPedidosInput {
  filtro?: Filtro
  page?: number
  pageSize?: number
}

/** Página vinda da URL: inteiro positivo, senão 1. Sem isso "1e400" vira skip infinito. */
export function paginaValida(valor: string | undefined): number {
  const n = Number.parseInt(String(valor ?? "1"), 10)
  return Number.isSafeInteger(n) && n > 0 ? n : 1
}

export async function listarPedidos({
  filtro = "todos",
  page = 1,
  pageSize = 25,
}: ListarPedidosInput = {}) {
  const where = WHERE_POR_FILTRO[filtro]
  // Conta antes de buscar para prender a página ao intervalo real: página
  // além do fim volta a última em vez de devolver lista vazia ou estourar.
  const total = await prisma.publicationOrder.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagina = Math.min(Math.max(1, page), totalPages)
  const rows = await prisma.publicationOrder.findMany({
    where,
    include: INCLUDE_PEDIDO,
    orderBy: { createdAt: "desc" },
    skip: (pagina - 1) * pageSize,
    take: pageSize,
  })
  return { rows, total, totalPages, page: pagina }
}

/** Histórico do anunciante. Escopo pela clínica na própria consulta. */
export async function pedidosDoAnunciante(clinicId: string): Promise<PedidoListado[]> {
  return prisma.publicationOrder.findMany({
    where: { clinicId },
    include: INCLUDE_PEDIDO,
    orderBy: { createdAt: "desc" },
  })
}
