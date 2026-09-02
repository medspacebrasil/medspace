import type { Listing, ListingType, PublicationOrigin } from "@prisma/client"
import { prisma } from "@/lib/db"
import { deletePayment, getPayment } from "@/lib/asaas/client"
import { priceFor, publicationExpiry, PRICE_VERSION } from "./pricing"
import { COBRANCA_TERMINAL, PAGO_STATUS } from "./status"

/**
 * Regra de publicação paga.
 *
 * Tudo que muda a vigência de um anúncio passa por aqui: webhook, cron, admin e
 * backfill. Centralizar existe para que nenhuma dessas quatro portas invente
 * uma regra própria de quando um anúncio pode ficar no ar.
 */

/**
 * Estados a partir dos quais um pedido ainda pode virar pago.
 *
 * `EXPIRED_UNPAID` está aqui porque pagar depois do vencimento é fluxo normal e
 * documentado no Asaas: a cobrança passa por PAYMENT_OVERDUE e depois recebe.
 * Se o pedido fosse terminal no vencimento, quem pagasse atrasado ficaria fora
 * do ar em silêncio, com o dinheiro já na conta.
 *
 * `CHARGEBACK_OPEN` está aqui porque disputa de chargeback pode ser ganha, e
 * então a cobrança volta para confirmada. Tratar como terminal tiraria a
 * vigência de quem venceu a disputa.
 */
const ATIVAVEIS = ["PENDING_PAYMENT", "EXPIRED_UNPAID", "CHARGEBACK_OPEN"] as const

export interface CreateOrderInput {
  listing: Pick<Listing, "id" | "clinicId" | "title" | "type">
  clinicName: string
  origin?: PublicationOrigin
  /** Sobrescreve o catálogo. Usado por cortesia do admin e pelo backfill. */
  durationDays?: number
}

export async function createPublicationOrder({
  listing,
  clinicName,
  origin = "PAID_CHARGE",
  durationDays,
}: CreateOrderInput) {
  const price = priceFor(listing.type as ListingType)
  const cortesia = origin !== "PAID_CHARGE"

  return prisma.publicationOrder.create({
    data: {
      listingId: listing.id,
      clinicId: listing.clinicId,
      // Snapshots: o registro financeiro precisa continuar legível mesmo se o
      // anúncio ou a clínica forem excluídos depois.
      listingTitle: listing.title,
      clinicName,
      origin,
      // Cortesia já nasce paga: não existe cobrança a esperar.
      status: cortesia ? "PAID" : "PENDING_PAYMENT",
      amountCents: cortesia ? 0 : price.amountCents,
      durationDays: durationDays ?? price.durationDays,
      priceVersion: PRICE_VERSION,
    },
  })
}

export interface ActivationResult {
  activated: boolean
  reason?: string
  expiresAt?: Date
  /** false quando o pedido foi pago mas o anúncio não estava em estado publicável. */
  published?: boolean
}

/**
 * Marca o pedido como pago e coloca o anúncio no ar.
 *
 * Idempotente por construção: a transição é condicional ao estado atual, então
 * reaplicar o mesmo evento não estende a vigência duas vezes. Isso importa
 * porque a entrega do webhook do Asaas é "pelo menos uma vez" e o mesmo
 * pagamento chega repetido com frequência.
 *
 * @param settled true quando o evento é de liquidação (PAYMENT_RECEIVED).
 *   Pix nunca emite PAYMENT_CONFIRMED, então a publicação acontece no primeiro
 *   evento que chegar entre confirmado e recebido, não apenas no confirmado.
 */
export async function activatePublication(
  orderId: string,
  { settled, now = new Date() }: { settled: boolean; now?: Date }
): Promise<ActivationResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.publicationOrder.findUnique({
      where: { id: orderId },
      select: { id: true, listingId: true, durationDays: true, status: true, paidAt: true },
    })
    if (!order) return { activated: false, reason: "pedido inexistente" }

    // Já pago: só registra a liquidação, sem mexer na vigência.
    if (order.status === "PAID") {
      if (settled) {
        await tx.publicationOrder.update({
          where: { id: orderId },
          data: { settledAt: now },
        })
      }
      return { activated: false, reason: "pedido ja estava pago" }
    }

    if (!ATIVAVEIS.includes(order.status as (typeof ATIVAVEIS)[number])) {
      return { activated: false, reason: `estado ${order.status} nao ativavel` }
    }

    const expiresAt = publicationExpiry(now, order.durationDays)

    const { count } = await tx.publicationOrder.updateMany({
      where: { id: orderId, status: { in: [...ATIVAVEIS] } },
      data: {
        status: "PAID",
        paidAt: order.paidAt ?? now,
        settledAt: settled ? now : undefined,
        startsAt: now,
        expiresAt,
        canceledAt: null,
      },
    })
    // Outra entrega do mesmo evento ganhou a corrida entre a leitura e a
    // escrita. Sair sem publicar de novo é o comportamento correto.
    if (count !== 1) return { activated: false, reason: "corrida: ja processado" }

    let published = false
    if (order.listingId) {
      // A vigência é registrada sempre: o dinheiro entrou e o prazo corre.
      await tx.listing.update({
        where: { id: order.listingId },
        data: { paidUntil: expiresAt },
      })
      // Publicar, só se o anúncio está esperando por isso. Pagamento não passa
      // por cima de arquivamento, rejeição ou edição que voltou para análise:
      // nesses casos o anúncio volta ao ar pela moderação, já com a vigência
      // gravada, sem cobrar de novo.
      const { count } = await tx.listing.updateMany({
        where: {
          id: order.listingId,
          status: { in: ["AWAITING_PAYMENT", "EXPIRED", "PUBLISHED"] },
        },
        data: { status: "PUBLISHED" },
      })
      published = count === 1
      if (published) {
        // Publicação paga também é primeira publicação, quando for a primeira.
        await tx.listing.updateMany({
          where: { id: order.listingId, firstPublishedAt: null },
          data: { firstPublishedAt: now },
        })
      } else {
        console.warn("[billing] pedido pago sem publicar: anuncio fora do estado esperado", orderId)
      }
    }

    return { activated: true, expiresAt, published }
  })
}

/**
 * Tira do ar os anúncios cuja vigência terminou.
 *
 * Roda por varredura agendada, e não de forma preguiçosa na leitura da página,
 * porque as páginas públicas passam por cache: uma escrita durante a renderização
 * seria imprevisível e ainda assim não cobriria quem nunca é acessado.
 */
export async function expirePublications(now = new Date()) {
  const vencidos = await prisma.listing.findMany({
    where: { status: "PUBLISHED", paidUntil: { not: null, lt: now } },
    select: { id: true },
  })
  if (vencidos.length === 0) return { expirados: 0 }

  const ids = vencidos.map((l) => l.id)
  // O pedido continua PAID de propósito. Ele foi pago; o que terminou foi a
  // vigência, e isso o próprio expiresAt já diz. Rebaixar para EXPIRED_UNPAID
  // o tornaria ativável de novo, e o evento de liquidação do cartão
  // (PAYMENT_RECEIVED chega até 32 dias depois da confirmação) republicaria o
  // anúncio por mais um período inteiro sem cobrança.
  await prisma.listing.updateMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    data: { status: "EXPIRED" },
  })

  return { expirados: ids.length }
}

/** Marca o pedido como vencido sem pagamento. Reversível: ver ATIVAVEIS. */
export async function markOrderOverdue(orderId: string) {
  const { count } = await prisma.publicationOrder.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "EXPIRED_UNPAID" },
  })
  return count === 1
}

/**
 * Chargeback aberto. Tira do ar mas mantém o pedido reversível.
 *
 * Só derruba o anúncio se a vigência corrente é a deste pedido: a igualdade
 * entre `paidUntil` e `expiresAt` diz isso. Um pedido antigo contestado depois
 * de uma renovação não pode derrubar a vigência que o pedido novo pagou.
 */
export async function openChargeback(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.publicationOrder.findUnique({
      where: { id: orderId },
      select: { listingId: true, status: true, expiresAt: true },
    })
    if (!order || order.status === "REFUNDED") return false

    await tx.publicationOrder.update({
      where: { id: orderId },
      data: { status: "CHARGEBACK_OPEN" },
    })
    if (order.listingId && order.expiresAt) {
      await tx.listing.updateMany({
        where: { id: order.listingId, status: "PUBLISHED", paidUntil: order.expiresAt },
        data: { status: "EXPIRED" },
      })
    }
    return true
  })
}

/** Estorno efetivado. Terminal: despublica (se a vigência era deste pedido) e encerra. */
export async function refundOrder(orderId: string, now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.publicationOrder.findUnique({
      where: { id: orderId },
      select: { listingId: true, expiresAt: true },
    })
    if (!order) return false

    // Lido antes de sobrescrever: é a chave que liga a vigência ao anúncio.
    const vigenciaOriginal = order.expiresAt

    await tx.publicationOrder.update({
      where: { id: orderId },
      data: { status: "REFUNDED", refundedAt: now, expiresAt: now },
    })
    if (order.listingId && vigenciaOriginal) {
      await tx.listing.updateMany({
        where: { id: order.listingId, status: "PUBLISHED", paidUntil: vigenciaOriginal },
        data: { status: "EXPIRED", paidUntil: now },
      })
    }
    return true
  })
}

/**
 * Cancela pedidos sem pagamento de um anúncio ou de uma clínica, e exclui no
 * Asaas as cobranças ainda abertas.
 *
 * Chamado antes de excluir anúncio ou conta. Sem isso a cobrança continua
 * pagável no Asaas depois de o anúncio sumir, e o pedido fica "aguardando"
 * para sempre no painel.
 *
 * Cobrança que a API diz estar paga não é cancelada: o webhook ou a varredura
 * vai ativar o pedido, e o admin enxerga um pedido pago de anúncio excluído,
 * que é o caso de estorno manual. Falha de consulta também não cancela: na
 * dúvida, deixa para a varredura diária.
 */
export async function cancelarPedidosPendentes(
  alvo: { listingId: string } | { clinicId: string },
  now = new Date()
) {
  const pedidos = await prisma.publicationOrder.findMany({
    where: { ...alvo, status: { in: ["PENDING_PAYMENT", "EXPIRED_UNPAID"] }, paidAt: null },
    select: {
      id: true,
      charges: {
        where: { status: { notIn: [...COBRANCA_TERMINAL] } },
        select: { id: true, asaasPaymentId: true },
      },
    },
  })

  const cancelaveis: string[] = []
  for (const pedido of pedidos) {
    let manter = false
    for (const c of pedido.charges) {
      try {
        const atual = await getPayment(c.asaasPaymentId)
        if (PAGO_STATUS.has(atual.status)) {
          manter = true
          await prisma.asaasCharge.update({ where: { id: c.id }, data: { status: atual.status } })
          continue
        }
        await deletePayment(c.asaasPaymentId)
        await prisma.asaasCharge.update({ where: { id: c.id }, data: { status: "DELETED" } })
      } catch (error) {
        manter = true
        console.error("[billing] falha ao cancelar cobranca", c.asaasPaymentId, error)
      }
    }
    if (!manter) cancelaveis.push(pedido.id)
  }

  if (cancelaveis.length > 0) {
    await prisma.publicationOrder.updateMany({
      where: { id: { in: cancelaveis }, paidAt: null },
      data: { status: "CANCELED", canceledAt: now },
    })
  }
  return { cancelados: cancelaveis.length }
}
