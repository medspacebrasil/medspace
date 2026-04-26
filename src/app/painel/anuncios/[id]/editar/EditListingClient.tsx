"use client"

import Link from "next/link"
import { useActionState } from "react"
import { updateListing, deleteListing, publishListing, type ActionState } from "../../actions"
import { ListingForm } from "@/components/forms/ListingForm"
import { ImageUpload } from "@/components/anuncios/ImageUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Send, ExternalLink, CheckCircle2 } from "lucide-react"

interface Props {
  listing: {
    id: string
    title: string
    description: string
    fullDescription: string | null
    city: string
    state: string
    neighborhood: string
    whatsapp: string
    roomTypeId: string | null
    status: string
    customSpecialties: string | null
    customEquipment: string | null
    requiresRqe: boolean
    specialties: { specialtyId: string }[]
    equipment: { equipmentId: string }[]
    images: { id: string; url: string; order: number; isCover: boolean }[]
  }
  slug: string
  justCreated?: boolean
  specialties: { id: string; name: string; slug: string }[]
  roomTypes: { id: string; name: string; slug: string }[]
  equipment: { id: string; name: string; slug: string }[]
}

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  PENDING: { label: "Pendente", variant: "warning" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "destructive" },
  ARCHIVED: { label: "Arquivado", variant: "outline" },
}

export function EditListingClient({
  listing,
  slug,
  justCreated,
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

  const cfg = statusLabel[listing.status] ?? statusLabel.DRAFT
  const isPublished = listing.status === "PUBLISHED"
  const showPublishedBanner = justCreated || publishState.success

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Editar Anúncio</h1>
          <Badge variant={cfg.variant} className="mt-1">
            {cfg.label}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && (
            <Link href={`/anuncios/${slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver anúncio publicado
              </Button>
            </Link>
          )}
          {!isPublished && (
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

      {showPublishedBanner && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Anúncio publicado com sucesso!</p>
            <p className="mt-1 text-green-700">
              Já está visível no site para os médicos. Você pode editá-lo a
              qualquer momento aqui.
            </p>
          </div>
          <Link href={`/anuncios/${slug}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-2 border-green-300 bg-white text-green-800 hover:bg-green-50">
              <ExternalLink className="h-3.5 w-3.5" />
              Ver no site
            </Button>
          </Link>
        </div>
      )}

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
            state: listing.state,
            neighborhood: listing.neighborhood,
            whatsapp: listing.whatsapp,
            roomTypeId: listing.roomTypeId ?? "",
            specialtyIds: listing.specialties.map((s) => s.specialtyId),
            equipmentIds: listing.equipment.map((e) => e.equipmentId),
            customSpecialties: listing.customSpecialties ?? "",
            customEquipment: listing.customEquipment ?? "",
            requiresRqe: listing.requiresRqe,
          }}
          specialties={specialties}
          roomTypes={roomTypes}
          equipment={equipment}
        />
      </div>
    </div>
  )
}
