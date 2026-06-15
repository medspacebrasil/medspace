import Link from "next/link"
import { Gift, ArrowRight } from "lucide-react"

/**
 * Banner informativo do período de lançamento gratuito.
 * Exibido acima do rodapé nas páginas Para Médicos, Para Clínicas e
 * Educação Médica (briefing Jun/2026). Fundo escuro com texto dourado para
 * manter a identidade visual; não é pop-up, não interrompe a navegação.
 */
export function LaunchBanner() {
  return (
    <section className="bg-navy px-4 py-8">
      <div className="container mx-auto flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15">
            <Gift className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="font-semibold text-gold">
              Plataforma gratuita durante o período de lançamento.
            </p>
            <p className="mt-1 text-sm text-white/70">
              Aproveite para anunciar agora sem custo. Em breve planos
              disponíveis.
            </p>
          </div>
        </div>
        <Link
          href="/planos"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gold/40 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
        >
          Saiba mais sobre os planos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
