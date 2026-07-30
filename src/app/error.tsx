"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold">Algo deu errado</h2>
      <p className="max-w-md text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente — se o problema continuar,
        fale com a gente: contato@medspacebrasil.com.br
      </p>
      {error.digest && (
        // Permite correlacionar a reclamação do usuário com o log do servidor.
        <p className="text-xs text-muted-foreground/70">
          Código do erro: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </div>
  )
}
