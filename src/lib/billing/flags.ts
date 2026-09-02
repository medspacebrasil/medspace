/**
 * Chave geral da cobrança por publicação.
 *
 * Desligada, a moderação publica direto, como sempre foi. Ligada, anúncio
 * aprovado passa a esperar o pagamento da taxa antes de ir ao ar. Fica em
 * variável de ambiente porque ligar a cobrança é uma decisão de negócio
 * (preço definido, página de planos atualizada), não um deploy.
 */
export function billingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true"
}

export interface AprovacaoInput {
  /** Primeira publicação registrada. Null = nunca foi ao ar. */
  firstPublishedAt: Date | null
  /** Fim da vigência paga. Null = nunca teve vigência paga. */
  paidUntil: Date | null
}

/**
 * Destino de um anúncio aprovado na moderação.
 *
 * Quatro casos, e a ordem importa:
 * - vigência paga em curso: volta ao ar direto (edição re-moderada não cobra
 *   de novo o que já está pago);
 * - vigência paga que terminou: renovação, volta para pagamento;
 * - nunca pagou mas já publicou (legado do lançamento gratuito): continua
 *   gratuito até a cliente definir a regra de transição;
 * - anúncio novo: paga antes da primeira publicação.
 */
export function statusAposAprovacao(
  listing: AprovacaoInput,
  cobranca: boolean = billingEnabled(),
  now: Date = new Date()
): "PUBLISHED" | "AWAITING_PAYMENT" {
  if (!cobranca) return "PUBLISHED"
  if (listing.paidUntil && listing.paidUntil > now) return "PUBLISHED"
  if (listing.paidUntil) return "AWAITING_PAYMENT"
  if (listing.firstPublishedAt) return "PUBLISHED"
  return "AWAITING_PAYMENT"
}
