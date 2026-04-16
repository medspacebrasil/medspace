"use client"

import { useActionState } from "react"
import {
  updateEquipment,
  deleteEquipment,
  publishEquipment,
  type ActionState,
} from "../../actions"
import { EquipmentForm } from "@/components/forms/EquipmentForm"
import { ImageUpload } from "@/components/anuncios/ImageUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Send } from "lucide-react"

interface Props {
  listing: {
    id: string
    title: string
    description: string
    fullDescription: string | null
    city: string
    neighborhood: string
    whatsapp: string
    equipmentCategoryId: string | null
    brand: string | null
    model: string | null
    condition: string | null
    status: string
    images: { id: string; url: string; order: number; isCover: boolean }[]
  }
  categories: { id: string; name: string; slug: string }[]
}

export function EditAparelhoClient({ listing, categories }: Props) {
  const [updateState, updateAction, isUpdating] = useActionState<ActionState, FormData>(
    updateEquipment,
    { success: false }
  )

  const [publishState, publishAction, isPublishing] = useActionState<ActionState, FormData>(
    publishEquipment,
    { success: false }
  )

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Aparelho</h1>
          <Badge variant="secondary" className="mt-1">
            {listing.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {(listing.status === "DRAFT" || listing.status === "REJECTED") && (
            <form action={publishAction}>
              <input type="hidden" name="id" value={listing.id} />
              <Button
                type="submit"
                variant="default"
                className="gap-2"
                disabled={isPublishing}
              >
                <Send className="h-4 w-4" />
                {isPublishing ? "Publicando..." : "Publicar"}
              </Button>
            </form>
          )}
          <form action={deleteEquipment}>
            <input type="hidden" name="id" value={listing.id} />
            <Button type="submit" variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </form>
        </div>
      </div>

      {publishState.errors?._form && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {publishState.errors._form[0]}
        </div>
      )}

      {updateState.success && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Aparelho atualizado com sucesso!
        </div>
      )}

      <div className="mt-6">
        <ImageUpload listingId={listing.id} initialImages={listing.images} />
      </div>

      <div className="mt-6">
        <EquipmentForm
          formAction={updateAction}
          state={updateState}
          isPending={isUpdating}
          defaultValues={{
            id: listing.id,
            title: listing.title,
            description: listing.description,
            fullDescription: listing.fullDescription ?? "",
            city: listing.city,
            neighborhood: listing.neighborhood,
            whatsapp: listing.whatsapp,
            equipmentCategoryId: listing.equipmentCategoryId ?? "",
            brand: listing.brand ?? "",
            model: listing.model ?? "",
            condition: listing.condition ?? "",
          }}
          categories={categories}
        />
      </div>
    </div>
  )
}
