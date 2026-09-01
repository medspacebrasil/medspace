"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { updateListing, deleteListing, publishListing, type ActionState } from "../../actions"
import { ListingForm } from "@/components/forms/ListingForm"
import { ImageUpload } from "@/components/anuncios/ImageUpload"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"
import { Button } from "@/components/ui/button"
import { PendingButton } from "@/components/ui/pending-button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Send, ExternalLink, CheckCircle2, Clock, ImageIcon, X } from "lucide-react"

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
    rejectionReason: string | null
    allSpecialties: boolean
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
  PENDING: { label: "Em análise", variant: "warning" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "destructive" },
  ARCHIVED: { label: "Arquivado", variant: "outline" },
  AWAITING_PAYMENT: { label: "Aguardando pagamento", variant: "secondary" },
  EXPIRED: { label: "Expirado", variant: "outline" },
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

  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null)
  useEffect(() => {
    if (updateState.success) {
      setSaveStatus("success")
    } else if (updateState.errors) {
      setSaveStatus("error")
    }
  }, [updateState])

  const [publishErrorDismissed, setPublishErrorDismissed] = useState(false)
  useEffect(() => {
    setPublishErrorDismissed(false)
  }, [publishState])

  // Remove ?created=1 da URL para o banner de criação não reaparecer em
  // reload/back-nav (mesmo padrão do WelcomeModal com ?welcome=1).
  useEffect(() => {
    if (justCreated && typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [justCreated])

  const cfg = statusLabel[listing.status] ?? statusLabel.DRAFT
  const isPublished = listing.status === "PUBLISHED"
  // O dono só pode "enviar para revisão" rascunhos e rejeitados — a action
  // rejeita os demais estados, então o botão não deve nem aparecer.
  const canSubmitForReview =
    listing.status === "DRAFT" || listing.status === "REJECTED"
  const hasPhotos = listing.images.length > 0

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
          {canSubmitForReview && (
            <form action={publishAction}>
              <input type="hidden" name="id" value={listing.id} />
              <Button
                type="submit"
                variant="default"
                className="gap-2"
                disabled={isPublishing}
              >
                <Send className="h-4 w-4" />
                {isPublishing ? "Enviando..." : "Enviar para revisão"}
              </Button>
            </form>
          )}
          <form
            action={deleteListing}
            onSubmit={(e) => {
              if (
                !confirm(
                  "Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
                )
              ) {
                e.preventDefault()
              }
            }}
          >
            <input type="hidden" name="id" value={listing.id} />
            <PendingButton variant="destructive" className="gap-2" pendingText="Excluindo...">
              <Trash2 className="h-4 w-4" />
              Excluir
            </PendingButton>
          </form>
        </div>
      </div>

      {/* Banner pós-criação/envio: só afirma "publicado" quando realmente está
          PUBLISHED — anúncio recém-criado entra em análise e ainda NÃO está no ar. */}
      {(justCreated || publishState.success) && !isPublished && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <Clock className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              {justCreated
                ? "Anúncio criado com sucesso!"
                : "Anúncio enviado para revisão!"}
            </p>
            <p className="mt-1 text-blue-800">
              Ele está <strong>em análise pela nossa equipe</strong> e será
              publicado após a aprovação. Você receberá o status aqui no painel.
              {!hasPhotos && " Aproveite para adicionar fotos abaixo: anúncios sem foto não são aprovados."}
            </p>
          </div>
        </div>
      )}

      {(justCreated || publishState.success) && isPublished && (
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

      {/* Motivo da rejeição vindo da moderação — sem isso o anunciante não
          sabe o que corrigir antes de reenviar. */}
      {listing.status === "REJECTED" && listing.rejectionReason && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-medium">Anúncio rejeitado pela moderação</p>
          <p className="mt-1">
            <strong>Motivo:</strong> {listing.rejectionReason}
          </p>
          <p className="mt-1 text-red-800">
            Corrija o que foi apontado e clique em{" "}
            <strong>Enviar para revisão</strong> para uma nova análise.
          </p>
        </div>
      )}

      {/* Anúncio sem foto não é aprovado nem aparece no marketplace — avisa
          antes do anunciante descobrir na rejeição. */}
      {!hasPhotos && !justCreated && !publishState.success && !isPublished && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ImageIcon className="h-5 w-5 shrink-0" />
          <p>
            <strong>Seu anúncio ainda não tem fotos.</strong> Adicione pelo
            menos 1 foto: anúncios sem foto não são aprovados e não aparecem
            para os médicos.
          </p>
        </div>
      )}

      {publishState.errors?._form && !publishErrorDismissed && (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <span>{publishState.errors._form[0]}</span>
          <button
            type="button"
            onClick={() => setPublishErrorDismissed(true)}
            className="shrink-0 rounded p-0.5 hover:bg-destructive/10"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <SaveStatusModal
        open={saveStatus !== null}
        status={saveStatus ?? "success"}
        message={
          saveStatus === "error"
            ? updateState.errors?._form?.[0] ??
              "Verifique os campos destacados no formulário."
            : updateState.demoted
              ? "Suas alterações foram salvas. Como o anúncio estava publicado, ele voltou para análise e ficará fora do ar até ser aprovado novamente."
              : isPublished
                ? "Suas alterações foram salvas e já estão no ar."
                : "Suas alterações foram salvas. O anúncio será publicado após a aprovação da nossa equipe."
        }
        onClose={() => setSaveStatus(null)}
      />

      <div className="mt-6">
        <ImageUpload listingId={listing.id} initialImages={listing.images} />
      </div>

      <div className="mt-6">
        <ListingForm
          formAction={updateAction}
          state={updateState}
          isPending={isUpdating}
          submitNote={
            isPublished
              ? "Ao salvar, o anúncio voltará para análise e ficará fora do ar até ser aprovado novamente pela nossa equipe."
              : undefined
          }
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
            allSpecialties: listing.allSpecialties,
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
