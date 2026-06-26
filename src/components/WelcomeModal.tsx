"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X, ArrowRight } from "lucide-react"

export function WelcomeModal() {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold md:text-2xl">
            Cadastro realizado com sucesso!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Agora falta o passo mais importante: <strong>criar seu anúncio</strong>.
          </p>
        </div>

        <div className="mt-6 space-y-3 rounded-lg bg-muted/40 p-4 text-sm">
          <p>
            Para que seu anúncio apareça na plataforma e possa ser encontrado
            por médicos interessados, você precisa criar um anúncio. Na próxima
            etapa, escolha a categoria (<strong>espaço/sala</strong>,{" "}
            <strong>aparelho</strong> ou <strong>educação médica</strong>),
            preencha as informações e anexe fotos.
          </p>
          <p>
            Anúncios com <strong>fotos</strong> têm muito mais chances de receber
            contatos.
          </p>
          <p className="rounded-md bg-amber-100 p-3 text-amber-900">
            <strong>Importante:</strong> o cadastro sozinho não torna seu anúncio
            visível na plataforma. É necessário criar o anúncio para que ele seja
            publicado.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy hover:bg-gold/90"
          >
            Criar anúncio
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground"
          >
            Continuar para o painel
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
