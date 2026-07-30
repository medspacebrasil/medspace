import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-gold">404</p>
      <h2 className="text-2xl font-bold">Página não encontrada</h2>
      <p className="max-w-md text-muted-foreground">
        A página que você procura não existe ou o anúncio pode ter sido
        removido pelo anunciante.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/anuncios"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Ver salas disponíveis
        </Link>
        <Link
          href="/"
          className="rounded-md border border-input px-4 py-2 hover:bg-accent"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
