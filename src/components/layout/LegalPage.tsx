import type { ReactNode } from "react"

interface LegalPageProps {
  title: string
  subtitle?: string
  lastUpdated: string
  children: ReactNode
}

/**
 * Shared layout for legal/institutional pages (Termos, Privacidade,
 * Política de Anúncios, Como Funciona). Wraps content in a centered prose
 * container with consistent typography and headings.
 */
export function LegalPage({ title, subtitle, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="bg-warm-gray">
      <section className="bg-navy px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-white md:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-base text-white/70">
              {subtitle}
            </p>
          )}
          <p className="mt-4 text-sm text-white/50">
            Última atualização: {lastUpdated}
          </p>
        </div>
      </section>

      <article className="container mx-auto max-w-3xl px-4 py-10 md:py-16">
        <div className="prose prose-sm max-w-none rounded-2xl bg-white p-6 shadow-sm md:prose-base md:p-10 [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:md:text-xl [&_h3]:mt-6 [&_h3]:font-semibold [&_p]:mt-3 [&_p]:text-foreground/80 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-foreground/80 [&_li]:mt-1 [&_strong]:text-foreground">
          {children}
        </div>
      </article>
    </div>
  )
}
