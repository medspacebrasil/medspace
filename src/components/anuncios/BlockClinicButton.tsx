"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Ban } from "lucide-react"
import { blockClinic } from "@/app/admin/actions"

interface BlockClinicButtonProps {
  clinicId: string
  clinicName: string
  publishedCount: number
}

/**
 * Bloquear é destrutivo em massa (arquiva todos os anúncios + nega o login) —
 * antes executava em 1 clique sem confirmação nenhuma.
 */
export function BlockClinicButton({
  clinicId,
  clinicName,
  publishedCount,
}: BlockClinicButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1"
        title="Bloquear a conta e arquivar todos os anúncios desta clínica"
        onClick={() => setOpen(true)}
      >
        <Ban className="h-3.5 w-3.5" />
        Bloquear
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        title={`Bloquear "${clinicName}"?`}
        description={
          <>
            <p>
              O anunciante <strong>não conseguirá mais fazer login</strong> e{" "}
              <strong>todos os anúncios serão arquivados</strong>
              {publishedCount > 0 && (
                <>, incluindo {publishedCount} que está(ão) no ar agora</>
              )}
              .
            </p>
            <p className="mt-1">
              Ao desbloquear, os anúncios <strong>não voltam ao ar
              automaticamente</strong>: será preciso republicá-los um a um em
              Moderação de Anúncios.
            </p>
          </>
        }
        confirmLabel="Bloquear clínica"
        confirmPendingLabel="Bloqueando..."
        action={async (formData) => {
          await blockClinic(formData)
          setOpen(false)
        }}
        fields={{ clinicId }}
      />
    </>
  )
}
