"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import {
  adminUpdateEducation,
  type AdminUpdateEducationState,
} from "@/app/admin/actions"
import { EducationForm } from "@/components/forms/EducationForm"
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
    educationType: string | null
    educationModality: string | null
    audience: string | null
    workload: string | null
    duration: string | null
    investment: string | null
    externalLink: string | null
    customSpecialties: string | null
    city: string
    state: string
    whatsapp: string
    status: string
    images: { id: string; url: string; order: number; isCover: boolean }[]
  }
  clinicName: string
}

export function AdminEditEducacaoClient({ listing, clinicName }: Props) {
  const [updateState, updateAction, isUpdating] = useActionState<
    AdminUpdateEducationState,
    FormData
  >(adminUpdateEducation, { success: false })

  const [modalOpen, setModalOpen] = useState(false)
  useEffect(() => {
    // Não abre no estado inicial ({ success: false } sem errors)
    if (updateState.success || updateState.errors) setModalOpen(true)
  }, [updateState])

  return (
    <div>
      <Link href="/admin/anuncios">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </Link>

      <div className="mt-2">
        <h1 className="text-2xl font-bold">Editar Oportunidade Educacional (Admin)</h1>
        <p className="text-sm text-muted-foreground">
          Anunciante: {clinicName} &middot;{" "}
          <Badge variant="secondary">{listing.status}</Badge>
        </p>
      </div>

      <SaveStatusModal
        open={modalOpen}
        status={updateState.success ? "success" : "error"}
        message={
          updateState.success
            ? "Suas alterações foram salvas e já estão no ar."
            : updateState.errors?._form?.[0] ??
              "Verifique os campos destacados no formulário."
        }
        onClose={() => setModalOpen(false)}
      />

      <div className="mt-6">
        <ImageUpload listingId={listing.id} initialImages={listing.images} />
      </div>

      <div className="mt-6">
        <EducationForm
          formAction={updateAction}
          state={updateState}
          isPending={isUpdating}
          defaultValues={{
            id: listing.id,
            title: listing.title,
            educationType: listing.educationType ?? "",
            area: listing.customSpecialties ?? "",
            description: listing.fullDescription ?? listing.description,
            audience: listing.audience ?? "",
            educationModality: listing.educationModality ?? "",
            workload: listing.workload ?? "",
            duration: listing.duration ?? "",
            city: listing.city,
            state: listing.state,
            investment: listing.investment ?? "",
            whatsapp: listing.whatsapp,
            externalLink: listing.externalLink ?? "",
          }}
        />
      </div>
    </div>
  )
}
