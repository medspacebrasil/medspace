import type {
  AsaasBillingType,
  ListingStatus,
  PublicationOrderStatus,
  PublicationOrigin,
} from "@prisma/client"
import { brasiliaDay } from "@/lib/metrics"

/** Status do Asaas que significam dinheiro recebido. */
export const PAGO_STATUS: ReadonlySet<string> = new Set([
  "CONFIRMED",
  "RECEIVED",
  "RECEIVED_IN_CASH",
])

/** Cobrança que não pode mais ser paga: recebida, estornada ou excluída. */
export const COBRANCA_TERMINAL: readonly string[] = [
  "CONFIRMED",
  "RECEIVED",
  "RECEIVED_IN_CASH",
  "REFUNDED",
  "DELETED",
]

/**
 * Cobrança que representa o pedido.
 *
 * A paga, quando existe; senão a mais recente (a lista vem ordenada da mais
 * nova para a mais antiga). Escolher só pela data erraria quando o anunciante
 * gerou Pix, depois cartão, e pagou o Pix antigo: forma, fatura e id do Asaas
 * apontariam para a cobrança de cartão que ninguém pagou.
 */
export function cobrancaDoPedido<T extends { status: string }>(
  charges: T[]
): T | undefined {
  return charges.find((c) => PAGO_STATUS.has(c.status)) ?? charges[0]
}

/**
 * Leitura humana de um pedido de publicação.
 *
 * O status do banco guarda o estado da máquina de cobrança; o que o admin e o
 * anunciante precisam ver é a situação: "está no ar", "acabou", "não pagou".
 * Um mesmo status vira situações diferentes conforme datas e pagamento, e é
 * por isso que a tradução fica centralizada aqui, e não espalhada nas páginas.
 */

export type Situacao =
  | "AGUARDANDO"
  | "PAGO"
  | "ENCERRADO"
  | "VENCIDO"
  | "DISPUTA"
  | "ESTORNADO"
  | "CANCELADO"

export interface PedidoParaSituacao {
  status: PublicationOrderStatus
  expiresAt: Date | null
  paidAt: Date | null
}

export function situacaoPedido(
  pedido: PedidoParaSituacao,
  now: Date = new Date()
): Situacao {
  switch (pedido.status) {
    case "PENDING_PAYMENT":
      return "AGUARDANDO"
    case "PAID":
      // Pago continua pago quando a vigência termina; o que muda é a situação.
      return pedido.expiresAt && pedido.expiresAt < now ? "ENCERRADO" : "PAGO"
    case "EXPIRED_UNPAID":
      // Pedido que chegou a ser pago e depois foi rebaixado por uma versão
      // anterior da varredura. Para quem lê, isso é vigência encerrada, e não
      // falta de pagamento.
      return pedido.paidAt ? "ENCERRADO" : "VENCIDO"
    case "CHARGEBACK_OPEN":
      return "DISPUTA"
    case "REFUNDED":
      return "ESTORNADO"
    case "CANCELED":
      return "CANCELADO"
  }
}

export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline"

export const SITUACAO: Record<Situacao, { label: string; variant: BadgeVariant }> = {
  AGUARDANDO: { label: "Aguardando pagamento", variant: "warning" },
  PAGO: { label: "Pago", variant: "success" },
  ENCERRADO: { label: "Vigência encerrada", variant: "outline" },
  VENCIDO: { label: "Vencido sem pagamento", variant: "secondary" },
  DISPUTA: { label: "Em disputa", variant: "destructive" },
  ESTORNADO: { label: "Estornado", variant: "destructive" },
  CANCELADO: { label: "Cancelado", variant: "outline" },
}

export const ORIGEM_LABEL: Record<PublicationOrigin, string> = {
  PAID_CHARGE: "Cobrança",
  LAUNCH_COURTESY: "Cortesia de lançamento",
  ADMIN_GRANT: "Cortesia",
}

/**
 * Forma de pagamento como aparece na tabela.
 *
 * Pedido sem cobrança e sem cortesia acontece quando o gateway falhou depois
 * de o pedido ser criado. "A definir" é honesto: ninguém escolheu ainda.
 */
export function formaPagamentoLabel(
  origin: PublicationOrigin,
  billingType: AsaasBillingType | null | undefined
): string {
  if (billingType === "PIX") return "Pix"
  if (billingType === "CREDIT_CARD") return "Cartão"
  if (origin !== "PAID_CHARGE") return "Cortesia"
  return "A definir"
}

/**
 * O botão de pagar só faz sentido quando o anúncio ainda existe e está de fato
 * esperando pagamento. Botão que leva a "nada a pagar" confunde.
 */
export function podePagar(
  listingStatus: ListingStatus | undefined,
  situacao: Situacao
): boolean {
  if (listingStatus !== "AWAITING_PAYMENT" && listingStatus !== "EXPIRED") return false
  return situacao === "AGUARDANDO" || situacao === "VENCIDO" || situacao === "ENCERRADO"
}

export function rotuloPagar(situacao: Situacao): string {
  return situacao === "ENCERRADO" ? "Renovar" : "Pagar"
}

/**
 * Frase de vigência na linguagem do anunciante.
 *
 * Olha o status do anúncio, e não só o do pedido: um pedido pago não quer
 * dizer anúncio no ar (pode ter voltado para análise depois de uma edição, ou
 * ter sido arquivado), e dizer "no ar" nesse caso é mentir para o anunciante.
 */
export function fraseVigencia(
  situacao: Situacao,
  expiresAt: Date | null,
  listingStatus: ListingStatus | undefined
): string | null {
  const publicado = listingStatus === "PUBLISHED"
  const ate = expiresAt ? ` até ${dataBR(expiresAt)}` : ""

  switch (situacao) {
    case "PAGO":
      if (publicado) return `No ar${ate}`
      if (listingStatus === "PENDING") return `Pago${ate}. Volta ao ar quando a análise terminar`
      if (!listingStatus) return `Pago${ate}. O anúncio foi excluído`
      return `Pago${ate}. O anúncio não está publicado no momento`
    case "ENCERRADO":
      return expiresAt ? `Encerrado em ${dataBR(expiresAt)}` : "Encerrado"
    case "AGUARDANDO":
      return publicado
        ? "Cobrança não paga. O anúncio está publicado por outro pagamento"
        : "O anúncio vai ao ar assim que o pagamento for confirmado"
    case "VENCIDO":
      return publicado
        ? "Cobrança vencida e não paga. O anúncio está publicado por outro pagamento"
        : "A cobrança venceu. Gere uma nova para publicar"
    default:
      return null
  }
}

/**
 * Primeiro instante do mês corrente no calendário de Brasília.
 *
 * "Recebido no mês" precisa virar à meia-noite de Brasília, não à meia-noite
 * UTC: um Pix pago às 22h do dia 31 é do mês que está acabando.
 */
export function inicioDoMesBrasilia(now: Date = new Date()): Date {
  const mes = brasiliaDay(now).key.slice(0, 7)
  return new Date(`${mes}-01T03:00:00.000Z`)
}

const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
})

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
})

export function dataBR(date: Date | null | undefined): string {
  return date ? dataCurta.format(date) : ""
}

export function dataHoraBR(date: Date | null | undefined): string {
  return date ? dataHora.format(date) : ""
}

/** Valor em reais com vírgula, sem símbolo. É o que o Excel em português lê como número. */
export function reaisPlanilha(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}
