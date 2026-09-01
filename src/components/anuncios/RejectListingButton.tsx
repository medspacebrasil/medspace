"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PendingButton } from "@/components/ui/pending-button"
import { XCircle } from "lucide-react"
import { rejectListing } from "@/app/admin/actions"

interface RejectListingButtonProps {
  id: string
  title: string
}

/**
 * Rejeição com motivo obrigatório: o texto é salvo em rejectionReason e
 * exibido ao anunciante no painel — sem ele, a clínica nunca sabe o que
 * corrigir e abandona a plataforma.
 */
export function RejectListingButton({ id, title }: RejectListingButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="gap-1"
        onClick={() => setOpen(true)}
      >
        <XCircle className="h-3.5 w-3.5" />
        Rejeitar
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Rejeitar anúncio</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;{title}&rdquo;: o motivo será mostrado ao anunciante no
              painel, para que ele saiba o que corrigir antes de reenviar.
            </p>
            <form
              action={async (formData) => {
                await rejectListing(formData)
                setOpen(false)
              }}
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="id" value={id} />
              <textarea
                name="reason"
                required
                minLength={5}
                maxLength={1000}
                rows={3}
                autoFocus
                placeholder="Ex.: As fotos não mostram o espaço anunciado. Adicione fotos reais da sala."
                className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <PendingButton size="sm" variant="destructive" pendingText="Rejeitando...">
                  Rejeitar anúncio
                </PendingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
