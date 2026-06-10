"use client"

import { useActionState, useState } from "react"
import { deleteAccount, type ActionState } from "./actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, ShieldAlert, Trash2 } from "lucide-react"

/**
 * LGPD self-service: export personal data (portability) and permanently
 * delete the account (right to erasure).
 */
export function DataRights() {
  const [confirming, setConfirming] = useState(false)
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    deleteAccount,
    { success: false }
  )

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldAlert className="h-5 w-5 text-gold-dark" />
            Seus dados e privacidade (LGPD)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Você pode baixar uma cópia dos seus dados ou excluir
            permanentemente sua conta a qualquer momento.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Exportar meus dados</h3>
          <p className="text-sm text-muted-foreground">
            Baixe um arquivo JSON com seus dados de cadastro, da clínica e dos
            anúncios (portabilidade).
          </p>
          <a
            href="/api/me/export"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="h-4 w-4" />
            Baixar meus dados (JSON)
          </a>
        </div>

        <Separator />

        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="text-sm font-semibold text-destructive">
            Excluir minha conta
          </h3>
          <p className="text-sm text-muted-foreground">
            Esta ação é <strong>permanente e irreversível</strong>. Sua conta, o
            perfil da clínica, todos os anúncios e as imagens enviadas serão
            apagados definitivamente.
          </p>

          {state.errors?._form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.errors._form[0]}
            </div>
          )}

          {!confirming ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir minha conta
            </Button>
          ) : (
            <form action={formAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="delete-password">
                  Confirme sua senha para excluir
                </Label>
                <Input
                  id="delete-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  required
                />
                {state.errors?.password && (
                  <p className="text-sm text-destructive">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                >
                  {isPending ? "Excluindo..." : "Excluir definitivamente"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
