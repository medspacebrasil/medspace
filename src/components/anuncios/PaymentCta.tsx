import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

/**
 * Chamada para pagamento no painel do anunciante.
 *
 * Só aparece quando existe algo a pagar. Deixar o botão sempre visível
 * confundiria quem está com o anúncio no ar e em dia.
 */
export function PaymentCta({ listingId, status }: { listingId: string; status: string }) {
  if (status !== "AWAITING_PAYMENT" && status !== "EXPIRED") return null

  const renovacao = status === "EXPIRED"

  return (
    <Link href={`/painel/anuncios/${listingId}/pagamento`}>
      <Button size="sm" className="gap-2">
        <CreditCard className="h-4 w-4" />
        {renovacao ? "Renovar" : "Pagar para publicar"}
      </Button>
    </Link>
  )
}
