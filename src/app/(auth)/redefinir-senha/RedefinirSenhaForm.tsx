"use client"

import { useActionState } from "react"
import Link from "next/link"
import { resetPassword, type ActionState } from "../recuperar-senha/actions"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"

export function RedefinirSenhaForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resetPassword,
    { success: false }
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <CardContent className="space-y-4">
        {state.errors?._form && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {state.errors._form[0]}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
          />
          {state.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
          />
          {state.errors?.confirmPassword && (
            <p className="text-sm text-destructive">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
          disabled={isPending}
        >
          {isPending ? "Salvando..." : "Redefinir senha"}
        </Button>
        <p className="text-sm text-muted-foreground">
          <Link href="/recuperar-senha" className="font-medium text-gold-dark hover:underline">
            Solicitar um novo link
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}
