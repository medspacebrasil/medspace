"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CepInput } from "@/components/forms/CepInput"
import type { ActionState } from "@/app/painel/anuncios/actions"

interface FilterOption {
  id: string
  name: string
  slug: string
}

interface ListingFormProps {
  formAction: (payload: FormData) => void
  state: ActionState
  isPending: boolean
  defaultValues?: {
    id?: string
    title: string
    description: string
    fullDescription: string
    city: string
    neighborhood: string
    whatsapp: string
    roomTypeId: string
    specialtyIds: string[]
    equipmentIds: string[]
    customSpecialties?: string
  }
  specialties?: FilterOption[]
  roomTypes?: FilterOption[]
  equipment?: FilterOption[]
}

export function ListingForm({
  formAction,
  state,
  isPending,
  defaultValues,
  specialties: propSpecialties,
  roomTypes: propRoomTypes,
  equipment: propEquipment,
}: ListingFormProps) {
  const [specialties, setSpecialties] = useState<FilterOption[]>(propSpecialties ?? [])
  const [roomTypes, setRoomTypes] = useState<FilterOption[]>(propRoomTypes ?? [])
  const [equipment, setEquipment] = useState<FilterOption[]>(propEquipment ?? [])

  useEffect(() => {
    if (!propSpecialties) {
      fetch("/api/taxonomies")
        .then((r) => r.json())
        .then((data) => {
          setSpecialties(data.specialties ?? [])
          setRoomTypes(data.roomTypes ?? [])
          setEquipment(data.equipment ?? [])
        })
        .catch(() => {})
    }
  }, [propSpecialties])

  return (
    <form action={formAction}>
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

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
              defaultValue={defaultValues?.title}
              placeholder="Ex: Consultório equipado no Centro de SP"
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição curta (até 300 caracteres)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description}
              placeholder="Descrição resumida do espaço..."
              maxLength={300}
              required
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Descrição completa (opcional)</Label>
            <Textarea
              id="fullDescription"
              name="fullDescription"
              defaultValue={defaultValues?.fullDescription}
              placeholder="Detalhes completos sobre o espaço, horários, condições..."
              rows={6}
            />
          </div>

          <CepInput
            defaultCity={defaultValues?.city}
            defaultNeighborhood={defaultValues?.neighborhood}
          />
          {state.errors?.city && (
            <p className="text-sm text-destructive">{state.errors.city[0]}</p>
          )}
          {state.errors?.neighborhood && (
            <p className="text-sm text-destructive">{state.errors.neighborhood[0]}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (DDD + número)</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={defaultValues?.whatsapp}
                placeholder="11999998888"
                required
              />
              {state.errors?.whatsapp && (
                <p className="text-sm text-destructive">
                  {state.errors.whatsapp[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomTypeId">Tipo de sala</Label>
              <Select
                id="roomTypeId"
                name="roomTypeId"
                defaultValue={defaultValues?.roomTypeId}
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
            <Label>Especialidades disponíveis</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {specialties.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="specialtyIds"
                    value={s.id}
                    defaultChecked={defaultValues?.specialtyIds?.includes(s.id)}
                    className="rounded"
                  />
                  {s.name}
                </label>
              ))}
            </div>
            {state.errors?.specialtyIds && (
              <p className="text-sm text-destructive">
                {state.errors.specialtyIds[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customSpecialties">
              Outras especialidades (opcional)
            </Label>
            <Input
              id="customSpecialties"
              name="customSpecialties"
              defaultValue={defaultValues?.customSpecialties}
              placeholder="Separe por vírgula: Mastologia, Medicina Preventiva..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Use para adicionar especialidades que não estão na lista acima.
            </p>
            {state.errors?.customSpecialties && (
              <p className="text-sm text-destructive">
                {state.errors.customSpecialties[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Recursos disponíveis</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {equipment.map((eq) => (
                <label key={eq.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="equipmentIds"
                    value={eq.id}
                    defaultChecked={defaultValues?.equipmentIds?.includes(eq.id)}
                    className="rounded"
                  />
                  {eq.name}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : defaultValues?.id
                ? "Salvar Alterações"
                : "Criar Anúncio"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
