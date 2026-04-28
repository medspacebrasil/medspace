"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { adminUpdateEquipment, type AdminUpdateEquipmentState } from "@/app/admin/actions"
import { EquipmentForm } from "@/components/forms/EquipmentForm"
import { ImageUpload } from "@/components/anuncios/ImageUpload"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

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
  clinicName: string
  categories: { id: string; name: string; slug: string }[]
}

export function AdminEditAparelhoClient({
  listing,
  clinicName,
  categories,
}: Props) {
  const [updateState, updateAction, isUpdating] = useActionState<
    AdminUpdateEquipmentState,
    FormData
  >(adminUpdateEquipment, { success: false })

  const [modalOpen, setModalOpen] = useState(false)
  useEffect(() => {
    if (updateState.success) setModalOpen(true)
  }, [updateState.success])

  return (
    <div>
      <Link href="/admin/anuncios">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </Link>

      <div className="mt-2">
        <h1 className="text-2xl font-bold">Editar Aparelho (Admin)</h1>
        <p className="text-sm text-muted-foreground">
          Clínica: {clinicName} &middot;{" "}
          <Badge variant="secondary">{listing.status}</Badge>
        </p>
      </div>

      <SaveStatusModal
        open={modalOpen}
        status="success"
        message="Suas alterações foram salvas e já estão no ar."
        onClose={() => setModalOpen(false)}
      />

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
