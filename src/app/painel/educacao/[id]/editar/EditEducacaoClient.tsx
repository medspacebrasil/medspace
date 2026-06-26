"use client"

import { useActionState } from "react"
import {
  updateEducation,
  deleteEducation,
  resubmitEducation,
  type ActionState,
} from "../../actions"
import { EducationForm } from "@/components/forms/EducationForm"
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
  justCreated: boolean
}

export function EditEducacaoClient({ listing, justCreated }: Props) {
  const [updateState, updateAction, isUpdating] = useActionState<ActionState, FormData>(
    updateEducation,
    { success: false }
  )
  const [resubmitState, resubmitAction, isResubmitting] = useActionState<ActionState, FormData>(
    resubmitEducation,
    { success: false }
  )

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Oportunidade Educacional</h1>
          <Badge variant="secondary" className="mt-1">
            {listing.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {(listing.status === "REJECTED" || listing.status === "DRAFT") && (
            <form action={resubmitAction}>
              <input type="hidden" name="id" value={listing.id} />
              <Button type="submit" className="gap-2" disabled={isResubmitting}>
                <Send className="h-4 w-4" />
                {isResubmitting ? "Enviando..." : "Reenviar para análise"}
              </Button>
            </form>
          )}
          <form
            action={deleteEducation}
            onSubmit={(e) => {
              if (
                !confirm(
                  "Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita."
                )
              ) {
                e.preventDefault()
              }
            }}
          >
            <input type="hidden" name="id" value={listing.id} />
            <Button type="submit" variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </form>
        </div>
      </div>

      {justCreated && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Seu anúncio foi enviado para análise e ficará visível em poucas horas.
          Você pode adicionar uma foto de capa abaixo.
        </div>
      )}

      {resubmitState.errors?._form && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {resubmitState.errors._form[0]}
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
