"use client"

import { useState, type FormEvent } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LoginForm({ justReset }: { justReset: boolean }) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha incorretos")
        setLoading(false)
      } else if (result?.ok) {
        // Mantém loading=true durante a navegação: reabilitar o botão aqui
        // permitiria re-submits que consomem o rate limit à toa.
        // Volta para a página que o usuário tentava acessar (callbackUrl do
        // middleware); só aceita caminho relativo para evitar open redirect.
        const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl")
        const safeTarget =
          callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
            ? callbackUrl
            : "/painel"
        window.location.href = safeTarget
      } else {
        setError("Resposta inesperada do servidor")
        setLoading(false)
      }
    } catch {
      setError("Não foi possível entrar. Verifique sua conexão e tente novamente.")
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>Acesse sua conta para continuar</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {justReset && !error && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Senha redefinida com sucesso! Faça login com a nova senha.
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
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
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-gold-dark hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-gold-dark hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
