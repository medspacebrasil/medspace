/**
 * Interruptor da visão de métricas do ANUNCIANTE (painel Desempenho e a linha
 * de interesse em "Meus Anúncios").
 *
 * Pedido da cliente em 02/09/2026: nesta fase inicial os números ficam
 * visíveis só para ela, no admin. A funcionalidade continua construída e
 * contando normalmente; some apenas da tela do anunciante. Religar é apagar a
 * variável (ou trocar para qualquer valor diferente de "false") e redeployar.
 *
 * O admin (/admin/interesse) não passa por aqui e nunca é afetado.
 */
export function advertiserMetricsEnabled(): boolean {
  return process.env.ADVERTISER_METRICS_ENABLED !== "false"
}
