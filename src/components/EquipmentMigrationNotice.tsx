"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, ArrowRight } from "lucide-react"

const STORAGE_KEY = "medspace:eq-migration-notice:2026-05-10"

export function EquipmentMigrationNotice() {
  // Default: don't show (avoid flash before localStorage check)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1"
    if (!dismissed) setOpen(true)
  }, [])

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1")
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold md:text-2xl">
            Atualização nos recursos disponíveis
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reorganizamos a lista de recursos da clínica em três categorias
            (<strong>Estrutura</strong>, <strong>Procedimentos</strong> e{" "}
            <strong>Premium</strong>) com itens novos.
          </p>
        </div>

        <div className="mt-6 space-y-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            Alguns recursos antigos foram renomeados ou substituídos. Por
            isso, <strong>os recursos marcados nos seus anúncios podem
            ter sido removidos</strong>.
          </p>
          <p>
            Pra garantir que seus anúncios continuem com as informações
            certas, abra cada um, revise os recursos disponíveis e salve.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">
            Equivalência sugerida:
          </p>
          <ul className="space-y-1">
            <li>• Manobrista → <strong>Estacionamento (valet)</strong></li>
            <li>
              • Estacionamento no local (gratuito/pago) →{" "}
              <strong>Estacionamento público</strong> ou{" "}
              <strong>Estacionamento (valet)</strong>
            </li>
            <li>• Maca → <strong>Maca ginecológica</strong></li>
            <li>
              • Poltrona de estética → <strong>Aparelhos de estética</strong>
            </li>
          </ul>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link href="/painel" onClick={dismiss}>
            <Button
              variant="default"
              className="w-full gap-2 bg-gold text-navy hover:bg-gold/90"
            >
              Revisar meus anúncios
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" onClick={dismiss} className="w-full">
            Já atualizei
          </Button>
        </div>
      </div>
    </div>
  )
}
