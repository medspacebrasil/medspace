"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Trash2 } from "lucide-react"
import { deleteClinicPermanent } from "@/app/admin/actions"

interface DeleteClinicButtonProps {
  clinicId: string
  clinicName: string
  listingsCount: number
}

export function DeleteClinicButton({
  clinicId,
  clinicName,
  listingsCount,
}: DeleteClinicButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="gap-1"
        title="Excluir permanentemente"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        title={`Excluir "${clinicName}" permanentemente?`}
        description={
          // A action apaga o USUÁRIO inteiro (cascade) — o aviso precisa dizer
          // isso, não só "a clínica": conta, login, anúncios e imagens somem.
          <p>
            Isso apaga <strong>a conta e o login do anunciante</strong>, o
            perfil da clínica
            {listingsCount > 0 && (
              <>
                , <strong>{listingsCount} anúncio(s)</strong>
              </>
            )}{" "}
            e todas as imagens. Esta ação é <strong>permanente e
            irreversível</strong>.
          </p>
        }
        confirmLabel="Excluir definitivamente"
        confirmPendingLabel="Excluindo..."
        action={deleteClinicPermanent}
        fields={{ clinicId }}
      />
    </>
  )
}
