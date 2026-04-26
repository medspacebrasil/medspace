"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteListingPermanent } from "@/app/admin/actions"

interface DeleteListingButtonProps {
  id: string
  title: string
}

export function DeleteListingButton({ id, title }: DeleteListingButtonProps) {
  return (
    <form
      action={deleteListingPermanent}
      onSubmit={(e) => {
        if (
          !confirm(
            `Excluir permanentemente o anúncio "${title}"? Essa ação não pode ser desfeita.`
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        className="gap-1"
        title="Excluir permanentemente"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </form>
  )
}
