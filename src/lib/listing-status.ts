/**
 * Labels PT-BR para ListingStatus — evita vazar o enum cru ("PENDING") na UI.
 * "Em análise" (e não "Pendente") porque é o que o anunciante entende:
 * o anúncio está na fila de moderação, não pendente de ação dele.
 */
export const LISTING_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING: "Em análise",
  PUBLISHED: "Publicado",
  REJECTED: "Rejeitado",
  ARCHIVED: "Arquivado",
}

export function listingStatusLabel(status: string): string {
  return LISTING_STATUS_LABEL[status] ?? status
}
