"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { PendingButton } from "@/components/ui/pending-button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  confirmPendingLabel?: string
  onCancel: () => void
  /** Server action (ou wrapper client) submetida ao confirmar. */
  action: (formData: FormData) => void | Promise<void>
  /** Campos hidden enviados junto (ex.: { clinicId }). */
  fields: Record<string, string>
}

/**
 * Confirmação estilizada para ações destrutivas — substitui o window.confirm
 * nativo (sem estilo, texto truncável e inconsistente com o design system).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmPendingLabel,
  onCancel,
  action,
  fields,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
        <form action={action} className="mt-5 flex justify-end gap-2">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <PendingButton
            size="sm"
            variant="destructive"
            pendingText={confirmPendingLabel ?? "Confirmando..."}
          >
            {confirmLabel}
          </PendingButton>
        </form>
      </div>
    </div>
  )
}
