"use client"

import { Button } from "@/components/ui/button"
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
  return (
    <form
      action={deleteClinicPermanent}
      onSubmit={(e) => {
        const detail =
          listingsCount > 0
            ? ` e ${listingsCount} anúncio(s) associado(s)`
            : ""
        if (
          !confirm(
            `Excluir permanentemente a clínica "${clinicName}"${detail}? Essa ação não pode ser desfeita.`
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="clinicId" value={clinicId} />
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        className="gap-1"
        title="Excluir permanentemente"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </Button>
    </form>
  )
}
