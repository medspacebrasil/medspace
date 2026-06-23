"use client"

import { useActionState } from "react"
import Link from "next/link"
import { requestPasswordReset, type ActionState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function RecuperarSenhaPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    { success: false }
  )

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para criar uma nova senha.
        </CardDescription>
      </CardHeader>

      {state.success ? (
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Se existir uma conta com esse e-mail, enviamos um link de
            redefinição. Confira sua caixa de entrada (e o spam). O link é
            válido por 1 hora.
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Voltar para o login
            </Button>
          </Link>
        </CardContent>
      ) : (
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
              disabled={isPending}
            >
              {isPending ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Lembrou a senha?{" "}
              <Link href="/login" className="font-medium text-gold-dark hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
