"use client"

import { useActionState } from "react"
import Link from "next/link"
import { registerClinic, type ActionState } from "../actions"
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
import { Separator } from "@/components/ui/separator"

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerClinic,
    { success: false }
  )

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cadastrar Clínica</CardTitle>
        <CardDescription>
          Crie sua conta gratuitamente e comece a anunciar
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.errors?._form && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {state.errors._form[0]}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input id="name" name="name" placeholder="João da Silva" autoComplete="name" required />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <Separator className="my-2" />

          <div className="space-y-2">
            <Label htmlFor="clinicName">Nome da Clínica</Label>
            <Input
              id="clinicName"
              name="clinicName"
              placeholder="Clínica Saúde Total"
              required
            />
            {state.errors?.clinicName && (
              <p className="text-sm text-destructive">
                {state.errors.clinicName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (DDD + número)</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              placeholder="11999998888"
              required
            />
            {state.errors?.whatsapp && (
              <p className="text-sm text-destructive">
                {state.errors.whatsapp[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" placeholder="São Paulo" required />
              {state.errors?.city && (
                <p className="text-sm text-destructive">
                  {state.errors.city[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                placeholder="Centro"
                required
              />
              {state.errors?.neighborhood && (
                <p className="text-sm text-destructive">
                  {state.errors.neighborhood[0]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
            disabled={isPending}
          >
            {isPending ? "Cadastrando..." : "Cadastrar Clínica"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-gold-dark hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
