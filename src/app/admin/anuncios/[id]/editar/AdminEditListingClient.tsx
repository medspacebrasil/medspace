"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { adminUpdateListing, type AdminUpdateListingState } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CepInput } from "@/components/forms/CepInput"
import { ImageUpload } from "@/components/anuncios/ImageUpload"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"
import { ArrowLeft, Save } from "lucide-react"

interface FilterOption {
  id: string
  name: string
  slug: string
}

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
  clinicName: string
  specialties: FilterOption[]
  roomTypes: FilterOption[]
  equipment: FilterOption[]
}

export function AdminEditListingClient({
  listing,
  clinicName,
  specialties,
  roomTypes,
  equipment,
}: Props) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<AdminUpdateListingState, FormData>(
    adminUpdateListing,
    { success: false }
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStatus, setModalStatus] = useState<"success" | "error">("success")
  // Especialidades são controladas (checked + onChange), então sobrevivem ao
  // reset de inputs não-controlados do React 19 — dispensa o eco via state.values.
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
    listing.specialties.map((s) => s.specialtyId)
  )

  // Open the modal on every action return: success or validation failure.
  // The initial state ({ success: false } without errors) must not open it.
  // On validation errors, React 19 resets uncontrolled inputs after the action
  // completes, so each field falls back to state.values (echoed back by the
  // action) to keep what the admin typed.
  useEffect(() => {
    if (state.success) {
      setModalStatus("success")
      setModalOpen(true)
    } else if (state.errors) {
      setModalStatus("error")
      setModalOpen(true)
    }
  }, [state])

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/anuncios")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Anúncio (Admin)</h1>
          <p className="text-sm text-muted-foreground">
            Clínica: {clinicName} &middot;{" "}
            <Badge variant="secondary">{listing.status}</Badge>
          </p>
        </div>
      </div>

      <SaveStatusModal
        open={modalOpen}
        status={modalStatus}
        message={
          modalStatus === "success"
            ? "Suas alterações foram salvas e já estão no ar."
            : state.errors?._form?.[0] ??
              "Verifique os campos destacados no formulário."
        }
        onClose={() => setModalOpen(false)}
      />

      <div className="mt-6">
        <ImageUpload listingId={listing.id} initialImages={listing.images} />
      </div>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="id" value={listing.id} />

        <Card>
          <CardContent className="space-y-4 pt-6">
            {state.errors?._form && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.errors._form[0]}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título do anúncio</Label>
              <Input
                id="title"
                name="title"
                defaultValue={state.values?.title ?? listing.title}
                required
              />
              {state.errors?.title && (
                <p className="text-sm text-destructive">{state.errors.title[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição curta</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={state.values?.description ?? listing.description}
                maxLength={300}
                required
              />
              {state.errors?.description && (
                <p className="text-sm text-destructive">{state.errors.description[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Descrição completa</Label>
              <Textarea
                id="fullDescription"
                name="fullDescription"
                defaultValue={state.values?.fullDescription ?? listing.fullDescription ?? ""}
                rows={6}
                maxLength={5000}
              />
              {state.errors?.fullDescription && (
                <p className="text-sm text-destructive">
                  {state.errors.fullDescription[0]}
                </p>
              )}
            </div>

            <CepInput
              defaultCity={listing.city}
              defaultNeighborhood={listing.neighborhood}
              defaultState={listing.state}
            />
            {state.errors?.city && (
              <p className="text-sm text-destructive">{state.errors.city[0]}</p>
            )}
            {state.errors?.neighborhood && (
              <p className="text-sm text-destructive">{state.errors.neighborhood[0]}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  defaultValue={state.values?.whatsapp ?? listing.whatsapp}
                  required
                />
                {state.errors?.whatsapp && (
                  <p className="text-sm text-destructive">{state.errors.whatsapp[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomTypeId">Tipo de sala</Label>
                <Select
                  id="roomTypeId"
                  name="roomTypeId"
                  defaultValue={state.values?.roomTypeId ?? listing.roomTypeId ?? ""}
                >
                  <option value="">Selecione...</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Especialidades</Label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    specialties.length > 0 &&
                    selectedSpecialtyIds.length === specialties.length
                  }
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedSpecialtyIds.length > 0 &&
                        selectedSpecialtyIds.length < specialties.length
                    }
                  }}
                  onChange={(e) =>
                    setSelectedSpecialtyIds(
                      e.target.checked ? specialties.map((s) => s.id) : []
                    )
                  }
                  className="rounded"
                />
                Selecionar todas
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {specialties.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="specialtyIds"
                      value={s.id}
                      checked={selectedSpecialtyIds.includes(s.id)}
                      onChange={(e) =>
                        setSelectedSpecialtyIds((prev) =>
                          e.target.checked
                            ? [...prev, s.id]
                            : prev.filter((id) => id !== s.id)
                        )
                      }
                      className="rounded"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customSpecialties">
                Outras especialidades (opcional)
              </Label>
              <Input
                id="customSpecialties"
                name="customSpecialties"
                defaultValue={state.values?.customSpecialties ?? listing.customSpecialties ?? ""}
                placeholder="Separe por vírgula"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Use para adicionar especialidades que não estão na lista acima.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Recursos</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {equipment.map((eq) => (
                  <label key={eq.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="equipmentIds"
                      value={eq.id}
                      defaultChecked={
                        state.values
                          ? (state.values.equipmentIds?.split(",") ?? []).includes(eq.id)
                          : listing.equipment.some((le) => le.equipmentId === eq.id)
                      }
                      className="rounded"
                    />
                    {eq.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customEquipment">
                Outros recursos (opcional)
              </Label>
              <Input
                id="customEquipment"
                name="customEquipment"
                defaultValue={state.values?.customEquipment ?? listing.customEquipment ?? ""}
                placeholder="Separe por vírgula"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-normal">
                <input
                  type="checkbox"
                  name="requiresRqe"
                  value="true"
                  defaultChecked={
                    state.values ? state.values.requiresRqe === "true" : listing.requiresRqe
                  }
                  className="rounded"
                />
                Exige RQE (Registro de Qualificação de Especialista)
              </Label>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
