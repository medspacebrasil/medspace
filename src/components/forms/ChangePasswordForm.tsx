"use client"

import { useActionState } from "react"
import { changePassword } from "@/app/painel/perfil/actions"
import type { ActionState } from "@/app/painel/perfil/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    changePassword,
    { success: false }
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5" />
          Alterar Senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.errors?._form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.errors._form[0]}
            </div>
          )}
          {state.success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              Senha alterada com sucesso!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
            {state.errors?.currentPassword && (
              <p className="text-sm text-destructive">{state.errors.currentPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
            />
            {state.errors?.newPassword && (
              <p className="text-sm text-destructive">{state.errors.newPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
            {state.errors?.confirmPassword && (
              <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
