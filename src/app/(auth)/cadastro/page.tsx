"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { registerClinic, type ActionState } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { CepInput } from "@/components/forms/CepInput"
import { formatDocument } from "@/lib/validators/document"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const ADVERTISER_OPTIONS = [
  { value: "MEDICO", label: "Médico" },
  { value: "CLINICA", label: "Clínica ou consultório" },
  { value: "COWORKING", label: "Coworking médico" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "INSTITUICAO", label: "Instituição de ensino" },
] as const

const NAME_LABEL: Record<string, string> = {
  MEDICO: "Seu nome profissional ou do consultório",
  CLINICA: "Nome da clínica",
  COWORKING: "Nome do coworking",
  EMPRESA: "Nome da empresa",
  INSTITUICAO: "Nome da instituição",
}

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerClinic,
    { success: false }
  )

  const [advertiserType, setAdvertiserType] = useState<string>("MEDICO")
  const isMedico = advertiserType === "MEDICO"
  const docType = isMedico ? "CPF" : "CNPJ"
  const [document, setDocument] = useState("")

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crie sua conta</CardTitle>
        <CardDescription>
          Para médicos, clínicas, coworkings, empresas e instituições que querem
          anunciar na MedSpace.
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
            <PasswordInput
              id="password"
              name="password"
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
            <Label htmlFor="advertiserType">Tipo de anunciante</Label>
            <select
              id="advertiserType"
              name="advertiserType"
              value={advertiserType}
              onChange={(e) => {
                setAdvertiserType(e.target.value)
                setDocument("")
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ADVERTISER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {isMedico
                ? "Médicos anunciam como pessoa física (CPF)."
                : "Empresas, clínicas, coworkings e instituições anunciam com CNPJ."}
            </p>
            {state.errors?.advertiserType && (
              <p className="text-sm text-destructive">
                {state.errors.advertiserType[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicName">{NAME_LABEL[advertiserType]}</Label>
            <Input
              id="clinicName"
              name="clinicName"
              placeholder={
                isMedico
                  ? "Dr. João Silva ou Consultório Silva"
                  : "Clínica Saúde Total"
              }
              required
            />
            {state.errors?.clinicName && (
              <p className="text-sm text-destructive">
                {state.errors.clinicName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">{docType}</Label>
            <Input
              id="document"
              name="document"
              inputMode="numeric"
              value={document}
              onChange={(e) => setDocument(formatDocument(e.target.value, docType))}
              placeholder={isMedico ? "000.000.000-00" : "00.000.000/0000-00"}
              maxLength={isMedico ? 14 : 18}
              required
            />
            {state.errors?.document && (
              <p className="text-sm text-destructive">
                {state.errors.document[0]}
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

          <CepInput />
          {state.errors?.city && (
            <p className="text-sm text-destructive">{state.errors.city[0]}</p>
          )}
          {state.errors?.neighborhood && (
            <p className="text-sm text-destructive">{state.errors.neighborhood[0]}</p>
          )}

          <Separator className="my-2" />

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="acceptTerms"
                value="on"
                required
                className="mt-1 rounded"
              />
              <span>
                Li e concordo com os{" "}
                <Link
                  href="/termos-de-uso"
                  target="_blank"
                  className="font-medium text-gold-dark underline"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/politica-de-privacidade"
                  target="_blank"
                  className="font-medium text-gold-dark underline"
                >
                  Política de Privacidade
                </Link>{" "}
                da MedSpace, e confirmo que tenho pelo menos 18 anos de idade.
              </span>
            </label>
            {state.errors?.acceptTerms && (
              <p className="text-sm text-destructive">
                {state.errors.acceptTerms[0]}
              </p>
            )}

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="marketingOptIn"
                value="on"
                className="mt-1 rounded"
              />
              <span>
                Aceito receber comunicações ocasionais sobre novidades,
                oportunidades e conteúdos da MedSpace por e-mail. Você pode
                cancelar a qualquer momento.
              </span>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
            disabled={isPending}
          >
            {isPending ? "Cadastrando..." : "Criar conta"}
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
