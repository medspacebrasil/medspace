"use client"

import { useState, type FormEvent } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [debug, setDebug] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setDebug("Iniciando login...")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      setDebug(`Chamando signIn com email: ${email}`)

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      setDebug(`Resultado: ${JSON.stringify(result)}`)

      if (result?.error) {
        setError("Email ou senha incorretos")
      } else if (result?.ok) {
        setDebug("Login OK! Redirecionando...")
        router.push("/painel")
        router.refresh()
      } else {
        setError("Resposta inesperada do servidor")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Erro: ${msg}`)
      setDebug(`Exceção: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  async function testAuth() {
    setDebug("Testando /api/auth/providers...")
    try {
      const res = await fetch("/api/auth/providers")
      const data = await res.json()
      setDebug(`Providers (${res.status}): ${JSON.stringify(data)}`)
    } catch (err) {
      setDebug(`Erro ao testar: ${err instanceof Error ? err.message : String(err)}`)
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
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {debug && (
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 font-mono break-all">
              DEBUG: {debug}
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
              defaultValue="admin@medspace.com.br"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="current-password"
              required
              defaultValue="admin123456"
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
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={testAuth}
          >
            Testar API Auth
          </Button>
          <p className="text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-gold-dark hover:underline">
              Cadastre sua clínica
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
