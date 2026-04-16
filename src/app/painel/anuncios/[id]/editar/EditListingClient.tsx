"use client"

import { useActionState } from "react"
import { updateListing, deleteListing, publishListing, type ActionState } from "../../actions"
import { ListingForm } from "@/components/forms/ListingForm"
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
    roomTypeId: string | null
    status: string
    customSpecialties: string | null
    specialties: { specialtyId: string }[]
    equipment: { equipmentId: string }[]
    images: { id: string; url: string; order: number; isCover: boolean }[]
  }
  specialties: { id: string; name: string; slug: string }[]
  roomTypes: { id: string; name: string; slug: string }[]
  equipment: { id: string; name: string; slug: string }[]
}

export function EditListingClient({
  listing,
  specialties,
  roomTypes,
  equipment,
}: Props) {
  const [updateState, updateAction, isUpdating] = useActionState<ActionState, FormData>(
    updateListing,
    { success: false }
  )

  const [publishState, publishAction, isPublishing] = useActionState<ActionState, FormData>(
    publishListing,
    { success: false }
  )

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Anúncio</h1>
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
          <form action={deleteListing}>
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
          Anúncio atualizado com sucesso!
        </div>
      )}

      <div className="mt-6">
        <ImageUpload listingId={listing.id} initialImages={listing.images} />
      </div>

      <div className="mt-6">
        <ListingForm
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
            roomTypeId: listing.roomTypeId ?? "",
            specialtyIds: listing.specialties.map((s) => s.specialtyId),
            equipmentIds: listing.equipment.map((e) => e.equipmentId),
            customSpecialties: listing.customSpecialties ?? "",
          }}
          specialties={specialties}
          roomTypes={roomTypes}
          equipment={equipment}
        />
      </div>
    </div>
  )
}
