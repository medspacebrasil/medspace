"use client"

import { useActionState, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { iniciarPagamento, type CheckoutState } from "./actions"
import { QrCode, CreditCard, Copy, Check, AlertCircle } from "lucide-react"

interface Props {
  listingId: string
  listingTitle: string
  precoFormatado: string
  duracaoDias: number
  /** Contas legadas não têm CPF/CNPJ, e o Asaas exige para emitir a cobrança. */
  precisaDocumento: boolean
}

const inicial: CheckoutState = { success: false }

export function PagamentoClient({
  listingId,
  listingTitle,
  precoFormatado,
  duracaoDias,
  precisaDocumento,
}: Props) {
  const [state, formAction, pending] = useActionState(iniciarPagamento, inicial)
  const [copiado, setCopiado] = useState(false)
  const r = state.result

  async function copiarPix() {
    if (!r?.pixPayload) return
    await navigator.clipboard.writeText(r.pixPayload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  // Pix: QR na própria página. Cartão: fatura hospedada no Asaas, o que mantém
  // o projeto fora do escopo PCI (nenhum dado de cartão passa por aqui).
  if (r?.billingType === "PIX" && r.pixQrCodeBase64) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold">Pague com Pix para publicar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assim que o pagamento for confirmado, o anúncio vai ao ar
            automaticamente.
          </p>
          <div className="mx-auto mt-5 w-fit rounded-lg border bg-white p-3">
            <Image
              src={`data:image/png;base64,${r.pixQrCodeBase64}`}
              alt="QR Code do Pix"
              width={220}
              height={220}
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={copiarPix}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {copiado ? (
              <>
                <Check className="h-4 w-4 text-green-600" /> Código copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar código Pix
              </>
            )}
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            {r.pixExpiresAt
              ? `Este código vale até ${new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "America/Sao_Paulo",
                }).format(new Date(r.pixExpiresAt))}.`
              : "Se o código expirar, é só voltar aqui e gerar outro."}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (r?.billingType === "CREDIT_CARD" && r.invoiceUrl) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold">Cobrança gerada</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O pagamento com cartão acontece em uma página segura do Asaas.
          </p>
          {/* Link comum, e nao redirect da action: a politica de seguranca do
              site (form-action 'self') bloquearia um redirect de formulario
              para outro dominio. */}
          <a
            href={r.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <CreditCard className="h-4 w-4" />
            Pagar com cartão
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            Depois de pagar, o anúncio é publicado automaticamente. Você pode
            fechar esta página.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold">Publicar anúncio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {listingTitle}
        </p>

        <div className="mt-4 rounded-lg border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Taxa de publicação</span>
            <span className="text-xl font-bold">{precoFormatado}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            O anúncio fica no ar por {duracaoDias} dias. Sem renovação
            automática e sem cobrança recorrente.
          </p>
        </div>

        {state.errors?._form && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.errors._form[0]}</span>
          </div>
        )}

        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="listingId" value={listingId} />

          {precisaDocumento && (
            <div>
              <label htmlFor="document" className="text-sm font-medium">
                CPF ou CNPJ do responsável pela cobrança
              </label>
              <input
                id="document"
                name="document"
                inputMode="numeric"
                placeholder="Somente números"
                defaultValue={state.values?.document ?? ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
              {state.errors?.document && (
                <p className="mt-1 text-xs text-destructive">
                  {state.errors.document[0]}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Exigido pelo sistema de pagamento para emitir a cobrança.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="submit"
              name="billingType"
              value="PIX"
              disabled={pending}
              className="w-full gap-2"
              size="lg"
            >
              <QrCode className="h-4 w-4" />
              {pending ? "Gerando..." : "Pagar com Pix"}
            </Button>
            <Button
              type="submit"
              name="billingType"
              value="CREDIT_CARD"
              disabled={pending}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <CreditCard className="h-4 w-4" />
              Pagar com cartão
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
