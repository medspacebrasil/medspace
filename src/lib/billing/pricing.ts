import type { ListingType } from "@prisma/client"

/**
 * Catálogo de preços da taxa de publicação.
 *
 * Os valores ainda não foram definidos pela cliente. Ficam aqui como
 * marcadores porque o preço não bloqueia o desenvolvimento: o pedido guarda um
 * snapshot de valor, duração e versão no momento em que é criado, então trocar
 * um número aqui não reescreve histórico nem afeta quem já pagou.
 *
 * Ao mudar qualquer valor, suba a versão. Ela é gravada no pedido e é o que
 * permite reconstruir depois qual tabela estava vigente em cada cobrança.
 */

export const PRICE_VERSION = "2026-08-19.placeholder"

export interface PublicationPrice {
  amountCents: number
  durationDays: number
}

/**
 * Preço por tipo de anúncio. A cliente pode definir valores diferentes para
 * sala, aparelho e educação; enquanto não define, todos usam o mesmo.
 */
const CATALOG: Record<ListingType, PublicationPrice> = {
  CLINIC: { amountCents: 4900, durationDays: 30 },
  EQUIPMENT: { amountCents: 4900, durationDays: 30 },
  EDUCATION: { amountCents: 4900, durationDays: 30 },
}

/** Mínimo aceito pelo Asaas por cobrança. Abaixo disso a criação falha. */
export const ASAAS_MIN_AMOUNT_CENTS = 500

export function priceFor(type: ListingType): PublicationPrice {
  return CATALOG[type]
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * Fim da vigência: 23:59:59 do último dia, no fuso de Brasília.
 *
 * O corte é no fim do dia de propósito. Se a vigência terminasse no horário
 * exato da compra, quem pagou às 23h perderia quase um dia inteiro, e o
 * anunciante conta os dias pelo calendário, não pelo relógio.
 */
export function publicationExpiry(startsAt: Date, durationDays: number): Date {
  const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000
  const local = new Date(startsAt.getTime() - BRASILIA_OFFSET_MS)
  local.setUTCDate(local.getUTCDate() + durationDays - 1)
  local.setUTCHours(23, 59, 59, 999)
  return new Date(local.getTime() + BRASILIA_OFFSET_MS)
}
