"use client"

import { useActionState, useState } from "react"
import { changePassword } from "@/app/painel/perfil/actions"
import type { ActionState } from "@/app/painel/perfil/actions"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    changePassword,
    { success: false }
  )

  // Campos controlados: o React 19 reseta inputs não-controlados após a
  // action, e senha nunca deve ser ecoada pelo servidor via state.values.
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5" />
          Alterar Senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          onSubmit={(e) => {
            // Validação local: evita ida ao servidor quando as senhas não
            // coincidem. Nos demais casos o submit segue para a action.
            if (newPassword !== confirmPassword) {
              e.preventDefault()
              setLocalError("As senhas não coincidem")
              return
            }
            setLocalError("")
          }}
          className="space-y-4"
        >
          {localError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {localError}
            </div>
          )}
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
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            {state.errors?.currentPassword && (
              <p className="text-sm text-destructive">{state.errors.currentPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {state.errors?.newPassword && (
              <p className="text-sm text-destructive">{state.errors.newPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
