"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  EDUCATION_TYPES,
  EDUCATION_MODALITIES,
  EDUCATION_TYPE_LABELS,
  EDUCATION_MODALITY_LABELS,
} from "@/lib/validators"
import type { ActionState } from "@/app/painel/educacao/actions"

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const

const WORKLOAD_OPTIONS = [
  "Menos de 10h",
  "10h a 40h",
  "40h a 120h",
  "120h a 360h",
  "Acima de 360h",
  "A combinar",
] as const

export interface EducationFormDefaults {
  id?: string
  title: string
  educationType: string
  area: string
  description: string
  audience: string
  educationModality: string
  workload: string
  duration: string
  city: string
  state: string
  investment: string
  whatsapp: string
  externalLink: string
}

interface EducationFormProps {
  formAction: (payload: FormData) => void
  state: ActionState
  isPending: boolean
  defaultValues?: EducationFormDefaults
}

export function EducationForm({
  formAction,
  state,
  isPending,
  defaultValues,
}: EducationFormProps) {
  const [modality, setModality] = useState(defaultValues?.educationModality ?? "")
  const showLocation = modality === "PRESENCIAL" || modality === "HIBRIDO"

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

          {/* Tipo de oportunidade */}
          <div className="space-y-2">
            <Label htmlFor="educationType">Tipo de oportunidade</Label>
            <Select
              id="educationType"
              name="educationType"
              defaultValue={defaultValues?.educationType ?? ""}
              required
            >
              <option value="">Selecione...</option>
              {EDUCATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EDUCATION_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
            {state.errors?.educationType && (
              <p className="text-sm text-destructive">{state.errors.educationType[0]}</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do anúncio</Label>
            <Input
              id="title"
              name="title"
              defaultValue={defaultValues?.title}
              placeholder="Ex: Mentoria em Gestão de Consultório para Médicos"
              maxLength={100}
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição completa</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description}
              placeholder="Descreva o conteúdo, metodologia, diferenciais e o que o participante vai aprender ou conquistar."
              rows={6}
              maxLength={2000}
              required
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label htmlFor="educationModality">Formato</Label>
            <Select
              id="educationModality"
              name="educationModality"
              defaultValue={defaultValues?.educationModality ?? ""}
              onChange={(e) => setModality(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {EDUCATION_MODALITIES.map((m) => (
                <option key={m} value={m}>
                  {EDUCATION_MODALITY_LABELS[m]}
                </option>
              ))}
            </Select>
            {state.errors?.educationModality && (
              <p className="text-sm text-destructive">{state.errors.educationModality[0]}</p>
            )}
          </div>

          {/* Localização — apenas presencial/híbrido */}
          {showLocation && (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={defaultValues?.city}
                  placeholder="Ex: Brasília"
                  maxLength={100}
                />
                {state.errors?.city && (
                  <p className="text-sm text-destructive">{state.errors.city[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select
                  id="state"
                  name="state"
                  defaultValue={defaultValues?.state ?? ""}
                  className="w-24"
                >
                  <option value="">UF</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* WhatsApp */}
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
              <p className="text-sm text-destructive">{state.errors.whatsapp[0]}</p>
            )}
          </div>

          {/* Detalhes adicionais — recolhidos p/ simplificar o cadastro.
              Os campos continuam sendo enviados mesmo com o bloco fechado. */}
          <details className="rounded-md border border-border/60">
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
              Detalhes adicionais (opcional)
            </summary>
            <div className="space-y-4 border-t border-border/60 p-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área / Especialidade</Label>
                <Input
                  id="area"
                  name="area"
                  defaultValue={defaultValues?.area}
                  placeholder="Ex: Cardiologia, Gestão médica, Dermatologia"
                  maxLength={300}
                />
                {state.errors?.area && (
                  <p className="text-sm text-destructive">{state.errors.area[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Para quem é indicado</Label>
                <Textarea
                  id="audience"
                  name="audience"
                  defaultValue={defaultValues?.audience}
                  placeholder="Ex: Médicos em início de carreira, residentes, especialistas que querem abrir consultório..."
                  rows={2}
                  maxLength={300}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workload">Carga horária</Label>
                  <Select
                    id="workload"
                    name="workload"
                    defaultValue={defaultValues?.workload ?? ""}
                  >
                    <option value="">Selecione...</option>
                    {WORKLOAD_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração / Período</Label>
                  <Input
                    id="duration"
                    name="duration"
                    defaultValue={defaultValues?.duration}
                    placeholder="Ex: 3 meses, encontros semanais por 8 semanas"
                    maxLength={120}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment">Investimento</Label>
                <Input
                  id="investment"
                  name="investment"
                  defaultValue={defaultValues?.investment}
                  placeholder="Ex: Gratuito, A combinar, R$ 1.200"
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalLink">Link externo</Label>
                <Input
                  id="externalLink"
                  name="externalLink"
                  type="url"
                  defaultValue={defaultValues?.externalLink}
                  placeholder="https://site, página de inscrição ou Instagram"
                  maxLength={300}
                />
                {state.errors?.externalLink && (
                  <p className="text-sm text-destructive">{state.errors.externalLink[0]}</p>
                )}
              </div>
            </div>
          </details>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : defaultValues?.id
                ? "Salvar Alterações"
                : "Publicar anúncio"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
