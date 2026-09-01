"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"

/**
 * Confirmação da exclusão de conta (LGPD). O deleteAccount redireciona para
 * /?conta-excluida=1 — sem este banner a exclusão seria silenciosa. Lê o
 * param no cliente (não força a home a ser dinâmica) e limpa a URL para o
 * banner não reaparecer em reload/back-nav.
 */
export function AccountDeletedBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("conta-excluida") === "1") {
      setVisible(true)
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="border-b border-green-200 bg-green-50">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-sm text-green-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="flex-1">
          <strong>Sua conta foi excluída definitivamente.</strong> Seus dados,
          anúncios e imagens foram apagados, conforme a nossa Política de
          Privacidade. Sentiremos sua falta. Você pode criar uma nova conta
          quando quiser.
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded p-1 hover:bg-green-100"
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
