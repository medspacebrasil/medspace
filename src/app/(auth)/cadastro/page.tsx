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

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerClinic,
    { success: false }
  )

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Med<span className="text-secondary">Space</span>
        </CardTitle>
        <CardDescription>Cadastre sua clínica gratuitamente</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.errors?._form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.errors._form[0]}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input id="name" name="name" placeholder="João da Silva" required />
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
              required
            />
            {state.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <hr />

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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Cadastrando..." : "Cadastrar Clínica"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
