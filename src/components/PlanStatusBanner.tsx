import Link from "next/link"
import { Gift, ArrowRight } from "lucide-react"

/**
 * Banner sutil de status do plano no painel do anunciante (Doc 2, seção 6).
 * Durante o período de lançamento todos publicam de graça; o banner prepara
 * o anunciante para os planos pagos futuros sem ser intrusivo.
 */
export function PlanStatusBanner() {
  return (
    <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20">
          <Gift className="h-5 w-5 text-gold-dark" />
        </div>
        <p className="text-sm text-foreground/80">
          Você está no <strong className="font-semibold text-foreground">período gratuito de lançamento</strong>{" "}
          da MedSpace. Publique seus anúncios sem custo. Em breve os planos
          pagos estarão disponíveis e você receberá um aviso com antecedência.
        </p>
      </div>
      <Link
        href="/planos"
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold-dark hover:underline"
      >
        Ver planos futuros
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
