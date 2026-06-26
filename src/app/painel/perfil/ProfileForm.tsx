"use client"

import { useActionState } from "react"
import { updateProfile, type ActionState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileFormProps {
  clinic: {
    id: string
    name: string
    phone: string | null
    whatsapp: string
    city: string
    neighborhood: string
    description: string | null
    user: { email: string; name: string }
  }
}

export function ProfileForm({ clinic }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateProfile,
    { success: false }
  )

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          {state.errors?._form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.errors._form[0]}
            </div>
          )}
          {state.success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              Perfil atualizado com sucesso!
            </div>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={clinic.user.email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Clínica</Label>
            <Input
              id="name"
              name="name"
              defaultValue={clinic.name}
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={clinic.phone ?? ""}
              />
              {state.errors?.phone && (
                <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={clinic.whatsapp}
                required
              />
              {state.errors?.whatsapp && (
                <p className="text-sm text-destructive">{state.errors.whatsapp[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                defaultValue={clinic.city}
                required
              />
              {state.errors?.city && (
                <p className="text-sm text-destructive">{state.errors.city[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                defaultValue={clinic.neighborhood}
                required
              />
              {state.errors?.neighborhood && (
                <p className="text-sm text-destructive">{state.errors.neighborhood[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição da clínica</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={clinic.description ?? ""}
              rows={4}
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
