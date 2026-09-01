"use client"

/**
 * Error boundary do layout raiz — sem ele, um erro no layout mostra a tela
 * default do Next.js em inglês. Precisa renderizar <html>/<body> próprios
 * porque substitui o layout inteiro.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Algo deu errado</h2>
          <p style={{ color: "#666", maxWidth: "420px" }}>
            Ocorreu um erro inesperado. Tente novamente. Se o problema
            continuar, fale com a gente: contato@medspacebrasil.com.br
          </p>
          {error.digest && (
            <p style={{ color: "#999", fontSize: "12px" }}>
              Código do erro: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "8px",
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              background: "#0f2440",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
