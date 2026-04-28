"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

interface SaveStatusModalProps {
  open: boolean
  status: "success" | "error"
  message?: string
  onClose: () => void
  autoDismissMs?: number
}

export function SaveStatusModal({
  open,
  status,
  message,
  onClose,
  autoDismissMs = 2500,
}: SaveStatusModalProps) {
  useEffect(() => {
    if (!open || status !== "success") return
    const t = window.setTimeout(onClose, autoDismissMs)
    return () => window.clearTimeout(t)
  }, [open, status, onClose, autoDismissMs])

  if (!open) return null

  const isSuccess = status === "success"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          {isSuccess ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
        </div>

        <h2 className="mt-4 text-lg font-bold">
          {isSuccess ? "Salvo com sucesso!" : "Erro ao salvar"}
        </h2>

        {message && (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        )}

        <Button
          type="button"
          variant={isSuccess ? "default" : "outline"}
          size="sm"
          onClick={onClose}
          className="mt-5"
        >
          OK
        </Button>
      </div>
    </div>
  )
}
