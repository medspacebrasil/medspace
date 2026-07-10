"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CepInput } from "@/components/forms/CepInput"
import type { ActionState } from "@/app/painel/aparelhos/actions"

interface Option {
  id: string
  name: string
  slug: string
}

interface EquipmentFormProps {
  formAction: (payload: FormData) => void
  state: ActionState
  isPending: boolean
  defaultValues?: {
    id?: string
    title: string
    description: string
    fullDescription: string
    city: string
    state?: string
    cep?: string
    neighborhood: string
    whatsapp: string
    equipmentCategoryId: string
    brand: string
    model: string
    condition: string
  }
  categories: Option[]
}

export function EquipmentForm({
  formAction,
  state,
  isPending,
  defaultValues,
  categories,
}: EquipmentFormProps) {
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
              defaultValue={state.values?.title ?? defaultValues?.title}
              placeholder="Ex: Ultrassom portátil Mindray DP-10"
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipmentCategoryId">Categoria do aparelho</Label>
            <Select
              id="equipmentCategoryId"
              name="equipmentCategoryId"
              defaultValue={
                state.values?.equipmentCategoryId ??
                defaultValues?.equipmentCategoryId
              }
              required
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {state.errors?.equipmentCategoryId && (
              <p className="text-sm text-destructive">
                {state.errors.equipmentCategoryId[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca (opcional)</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={state.values?.brand ?? defaultValues?.brand}
                placeholder="Ex: Mindray"
                maxLength={80}
              />
              {state.errors?.brand && (
                <p className="text-sm text-destructive">
                  {state.errors.brand[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo (opcional)</Label>
              <Input
                id="model"
                name="model"
                defaultValue={state.values?.model ?? defaultValues?.model}
                placeholder="Ex: DP-10"
                maxLength={80}
              />
              {state.errors?.model && (
                <p className="text-sm text-destructive">
                  {state.errors.model[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Estado de conservação (opcional)</Label>
            <Select
              id="condition"
              name="condition"
              defaultValue={state.values?.condition ?? defaultValues?.condition}
            >
              <option value="">Selecione...</option>
              <option value="NOVO">Novo</option>
              <option value="SEMINOVO">Seminovo</option>
              <option value="USADO">Usado</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição curta (até 300 caracteres)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={state.values?.description ?? defaultValues?.description}
              placeholder="Descrição resumida do aparelho..."
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
              defaultValue={
                state.values?.fullDescription ?? defaultValues?.fullDescription
              }
              placeholder="Detalhes completos: estado, acessórios inclusos, condições de locação..."
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
            defaultCity={defaultValues?.city}
            defaultNeighborhood={defaultValues?.neighborhood}
            defaultState={defaultValues?.state}
            defaultCep={defaultValues?.cep}
          />
          {state.errors?.city && (
            <p className="text-sm text-destructive">{state.errors.city[0]}</p>
          )}
          {state.errors?.neighborhood && (
            <p className="text-sm text-destructive">
              {state.errors.neighborhood[0]}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (DDD + número)</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              defaultValue={state.values?.whatsapp ?? defaultValues?.whatsapp}
              placeholder="11999998888"
              required
            />
            {state.errors?.whatsapp && (
              <p className="text-sm text-destructive">
                {state.errors.whatsapp[0]}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : defaultValues?.id
                ? "Salvar Alterações"
                : "Criar Aparelho"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
