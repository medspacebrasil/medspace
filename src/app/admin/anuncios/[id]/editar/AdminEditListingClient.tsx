"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CepInput } from "@/components/forms/CepInput"
import { ImageUpload } from "@/components/anuncios/ImageUpload"
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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setMessage("")

    try {
      const { adminUpdateListing } = await import("@/app/admin/actions")
      await adminUpdateListing(formData)
      setMessage("Anúncio atualizado com sucesso!")
    } catch {
      setMessage("Erro ao atualizar anúncio")
    } finally {
      setSaving(false)
    }
  }

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

      {message && (
        <div className={`mt-4 rounded-md p-3 text-sm ${
          message.includes("sucesso")
            ? "bg-green-50 text-green-800"
            : "bg-destructive/10 text-destructive"
        }`}>
          {message}
        </div>
      )}

      <div className="mt-6">
        <ImageUpload listingId={listing.id} initialImages={listing.images} />
      </div>

      <form action={handleSubmit} className="mt-6">
        <input type="hidden" name="id" value={listing.id} />

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do anúncio</Label>
              <Input
                id="title"
                name="title"
                defaultValue={listing.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição curta</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={listing.description}
                maxLength={300}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Descrição completa</Label>
              <Textarea
                id="fullDescription"
                name="fullDescription"
                defaultValue={listing.fullDescription ?? ""}
                rows={6}
              />
            </div>

            <CepInput
              defaultCity={listing.city}
              defaultNeighborhood={listing.neighborhood}
              defaultState={listing.state}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  defaultValue={listing.whatsapp}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomTypeId">Tipo de sala</Label>
                <Select
                  id="roomTypeId"
                  name="roomTypeId"
                  defaultValue={listing.roomTypeId ?? ""}
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {specialties.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="specialtyIds"
                      value={s.id}
                      defaultChecked={listing.specialties.some(
                        (ls) => ls.specialtyId === s.id
                      )}
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
                defaultValue={listing.customSpecialties ?? ""}
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
                      defaultChecked={listing.equipment.some(
                        (le) => le.equipmentId === eq.id
                      )}
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
                defaultValue={listing.customEquipment ?? ""}
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
                  defaultChecked={listing.requiresRqe}
                  className="rounded"
                />
                Exige RQE (Registro de Qualificação de Especialista)
              </Label>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
