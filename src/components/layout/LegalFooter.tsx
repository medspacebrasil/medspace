import Link from "next/link"

/**
 * Minimal footer with only the LGPD-required legal links and copyright.
 * Used in /auth, /painel and /admin layouts where the full institutional
 * Footer would be too heavy.
 */
export function LegalFooter() {
  return (
    <footer className="border-t border-border/50 bg-background px-4 py-4 text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} MedSpace — Plataforma digital de
          anúncios para a área da saúde.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/termos-de-uso"
            className="transition-colors hover:text-foreground"
          >
            Termos de Uso
          </Link>
          <Link
            href="/politica-de-privacidade"
            className="transition-colors hover:text-foreground"
          >
            Política de Privacidade
          </Link>
          <Link
            href="/politica-de-anuncios"
            className="transition-colors hover:text-foreground"
          >
            Política de Anúncios
          </Link>
          <Link
            href="/como-funciona"
            className="transition-colors hover:text-foreground"
          >
            Como funciona
          </Link>
        </nav>
      </div>
    </footer>
  )
}
