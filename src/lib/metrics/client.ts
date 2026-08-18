/**
 * Envio das métricas de interesse a partir do navegador.
 *
 * A contagem é disparada no cliente de propósito. Contar no servidor, durante o
 * render, incluiria robôs e pré-renderização, e a página do anúncio é cacheada
 * — o número ficaria inflado justamente onde ele precisa ser confiável, que é
 * na conversa de cobrança com a clínica.
 */

const ENDPOINT = "/api/metrics"

type EventType = "VIEW" | "CONTACT"

function payload(listingId: string, type: EventType) {
  return JSON.stringify({ listingId, type })
}

/** Visualização de anúncio. Chamada uma vez por montagem da página. */
export function reportListingView(listingId: string): void {
  if (typeof window === "undefined") return
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload(listingId, "VIEW"),
    keepalive: true,
  }).catch(() => {
    // Métrica é best-effort: falhar em silêncio é melhor que poluir o console
    // do visitante.
  })
}

/**
 * Contato via WhatsApp. Usa sendBeacon porque o clique navega para o wa.me na
 * sequência, e um fetch comum pode ser cancelado pela troca de página.
 */
export function reportListingContact(listingId: string): void {
  if (typeof window === "undefined") return
  const body = payload(listingId, "CONTACT")

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" })
    if (navigator.sendBeacon(ENDPOINT, blob)) return
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {})
}
