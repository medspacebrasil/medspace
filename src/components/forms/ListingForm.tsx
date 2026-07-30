"use client"

import { useEffect, useRef, useState } from "react"
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

interface EquipmentOption extends FilterOption {
  category?: string
}

const CATEGORY_ORDER = ["Estrutura", "Procedimentos", "Premium"]

function groupByCategory(items: EquipmentOption[]): Map<string, EquipmentOption[]> {
  const groups = new Map<string, EquipmentOption[]>()
  for (const item of items) {
    const cat = item.category || "Outros"
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(item)
  }
  // Return groups in the desired order
  const ordered = new Map<string, EquipmentOption[]>()
  for (const cat of CATEGORY_ORDER) {
    if (groups.has(cat)) ordered.set(cat, groups.get(cat)!)
  }
  for (const [cat, list] of groups) {
    if (!ordered.has(cat)) ordered.set(cat, list)
  }
  return ordered
}

interface ListingFormProps {
  formAction: (payload: FormData) => void
  state: ActionState
  isPending: boolean
  /** Aviso exibido junto ao botão de submit (ex.: anúncio publicado voltará para análise). */
  submitNote?: string
  defaultValues?: {
    id?: string
    title: string
    description: string
    fullDescription: string
    city: string
    state?: string
    neighborhood: string
    whatsapp: string
    roomTypeId: string
    allSpecialties?: boolean
    specialtyIds: string[]
    equipmentIds: string[]
    customSpecialties?: string
    customEquipment?: string
    requiresRqe?: boolean
  }
  specialties?: FilterOption[]
  roomTypes?: FilterOption[]
  equipment?: EquipmentOption[]
}

export function ListingForm({
  formAction,
  state,
  isPending,
  submitNote,
  defaultValues,
  specialties: propSpecialties,
  roomTypes: propRoomTypes,
  equipment: propEquipment,
}: ListingFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [specialties, setSpecialties] = useState<FilterOption[]>(propSpecialties ?? [])
  const [roomTypes, setRoomTypes] = useState<FilterOption[]>(propRoomTypes ?? [])
  const [equipment, setEquipment] = useState<EquipmentOption[]>(propEquipment ?? [])
  // Especialidades são controladas (checked + onChange), então sobrevivem ao
  // reset de inputs não-controlados do React 19 — dispensa o eco via state.values.
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
    defaultValues?.specialtyIds ?? []
  )
  // "Atende todas as especialidades": o anúncio exibe uma etiqueta única em
  // vez da lista — mais limpo e cobre especialidades que não estão na lista.
  const [allSpecialties, setAllSpecialties] = useState<boolean>(
    defaultValues?.allSpecialties ?? false
  )

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

  // Em forms longos o erro de validação pode ficar fora da viewport (o botão
  // de submit fica no fim da página) — leva o usuário até o primeiro erro.
  useEffect(() => {
    if (!state.errors) return
    const el = formRef.current?.querySelector(".text-destructive")
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [state])

  // Após falha da action, o React reseta inputs não-controlados; os valores
  // ecoados em state.values (multi-valor juntado por vírgula) têm prioridade.
  // Quando o eco existe mas a chave está ausente, o usuário desmarcou tudo —
  // não voltar aos defaultValues nesse caso.
  const selectedEquipmentIds = state.values
    ? (state.values.equipmentIds?.split(",") ?? [])
    : defaultValues?.equipmentIds

  return (
    <form ref={formRef} action={formAction}>
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
              defaultValue={state.values?.description ?? defaultValues?.description}
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
              defaultValue={state.values?.fullDescription ?? defaultValues?.fullDescription}
              placeholder="Detalhes completos sobre o espaço, horários, condições..."
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
            <div className="space-y-2">
              <Label htmlFor="roomTypeId">Tipo de sala</Label>
              <Select
                id="roomTypeId"
                name="roomTypeId"
                defaultValue={state.values?.roomTypeId ?? defaultValues?.roomTypeId}
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
            <label className="flex items-start gap-2 rounded-md border border-gold/40 bg-gold/5 p-3 text-sm font-medium">
              <input
                type="checkbox"
                name="allSpecialties"
                value="true"
                checked={allSpecialties}
                onChange={(e) => setAllSpecialties(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                Atende todas as especialidades
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  O anúncio exibirá a etiqueta “Todas as especialidades” em vez
                  da lista — fica mais limpo e cobre especialidades que não
                  estão abaixo.
                </span>
              </span>
            </label>
            {allSpecialties ? (
              <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                A seleção individual fica desativada enquanto esta opção
                estiver marcada.
              </p>
            ) : (
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
            )}
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
              defaultValue={state.values?.customSpecialties ?? defaultValues?.customSpecialties}
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
            <Label className="flex items-center gap-2 text-sm font-normal">
              <input
                type="checkbox"
                name="requiresRqe"
                value="true"
                defaultChecked={
                  state.values
                    ? state.values.requiresRqe === "true"
                    : (defaultValues?.requiresRqe ?? false)
                }
                className="rounded"
              />
              Exige RQE (Registro de Qualificação de Especialista)
            </Label>
            <p className="text-xs text-muted-foreground">
              Marque se a clínica exige que o médico tenha RQE na especialidade
              atendida.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Recursos disponíveis</Label>
            {Array.from(groupByCategory(equipment)).map(([category, items]) => (
              <div key={category} className="space-y-2 rounded-md border border-border/50 bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {category}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((eq) => (
                    <label key={eq.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="equipmentIds"
                        value={eq.id}
                        defaultChecked={selectedEquipmentIds?.includes(eq.id)}
                        className="rounded"
                      />
                      {eq.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customEquipment">
              Outros recursos (opcional)
            </Label>
            <Input
              id="customEquipment"
              name="customEquipment"
              defaultValue={state.values?.customEquipment ?? defaultValues?.customEquipment}
              placeholder="Separe por vírgula: Ar condicionado, Cafeteria, Sala de espera..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Use para adicionar recursos que não estão na lista acima.
            </p>
            {state.errors?.customEquipment && (
              <p className="text-sm text-destructive">
                {state.errors.customEquipment[0]}
              </p>
            )}
          </div>

          {submitNote && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              {submitNote}
            </p>
          )}

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
