import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { getPayment } from "@/lib/asaas/client"
import {
  activatePublication,
  markOrderOverdue,
  openChargeback,
  refundOrder,
} from "@/lib/billing/orders"

/**
 * Webhook de cobranças do Asaas.
 *
 * É o único caminho confiável de confirmação de pagamento. O redirecionamento
 * de sucesso na tela nunca é fonte de verdade: o usuário pode fechar o
 * navegador antes, e a URL de retorno é falsificável.
 *
 * Três decisões que sustentam este arquivo:
 *
 * 1. Responder 200 mesmo quando o processamento falha, gravando o erro. Quinze
 *    falhas consecutivas interrompem a fila inteira do Asaas, e os eventos só
 *    ficam 14 dias lá. Travar a fila por um erro nosso perderia pagamentos de
 *    outros anunciantes.
 * 2. Reconsultar a cobrança na API antes de liberar qualquer publicação. O
 *    payload não é assinado, então o corpo recebido não prova nada.
 * 3. Ignorar em silêncio evento sem cobrança nossa. A conta recebe evento de
 *    qualquer entrada de valor, inclusive Pix e transferência que não vieram da
 *    plataforma.
 */

function tokenValido(recebido: string | null): boolean {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN
  if (!esperado || !recebido) return false
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  // Comprimentos diferentes já reprovam, e timingSafeEqual exige tamanho igual.
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

interface AsaasEvent {
  id?: string
  event?: string
  payment?: { id?: string; status?: string; externalReference?: string }
}

/** Status do Asaas que significam dinheiro entrando. */
const PAGO = new Set(["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"])

export async function POST(request: Request) {
  // Lido do proprio Request, e nao de next/headers: o webhook nao precisa do
  // escopo de requisicao do Next, e assim a rota fica testavel isoladamente.
  if (!tokenValido(request.headers.get("asaas-access-token"))) {
    return NextResponse.json({ error: "Token inválido" }, { status: 403 })
  }

  let body: AsaasEvent
  try {
    body = (await request.json()) as AsaasEvent
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const eventId = body.id
  const evento = body.event
  const paymentId = body.payment?.id
  if (!eventId || !evento) {
    return NextResponse.json({ error: "Evento sem id" }, { status: 400 })
  }

  // Primeira camada de idempotência: o id do evento é a única chave de
  // deduplicação que o Asaas oferece.
  try {
    await prisma.asaasWebhookEvent.create({
      data: { eventId, event: evento, paymentId, payload: body as Prisma.InputJsonValue },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new NextResponse(null, { status: 200 })
    }
    throw error
  }

  try {
    await processar(evento, paymentId)
    await prisma.asaasWebhookEvent.update({
      where: { eventId },
      data: { processedAt: new Date() },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[asaas] falha ao processar evento", eventId, msg)
    await prisma.asaasWebhookEvent.update({
      where: { eventId },
      data: { error: msg.slice(0, 500) },
    })
  }

  return new NextResponse(null, { status: 200 })
}

async function processar(evento: string, paymentId?: string) {
  if (!paymentId) return

  const charge = await prisma.asaasCharge.findUnique({
    where: { asaasPaymentId: paymentId },
    select: { id: true, orderId: true },
  })
  // Entrada de valor que não veio da plataforma. Ignorar em silêncio, senão a
  // tabela de eventos enche de falha falsa e o cron reprocessa lixo pra sempre.
  if (!charge) return

  switch (evento) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED":
    case "PAYMENT_RECEIVED_IN_CASH": {
      // Segunda camada: o estado que vale é o da API, não o do corpo recebido.
      const atual = await getPayment(paymentId)
      if (!PAGO.has(atual.status)) return

      await prisma.asaasCharge.update({
        where: { id: charge.id },
        data: { status: atual.status },
      })
      // Terceira camada, a decisiva: transição condicional ao estado do pedido.
      await activatePublication(charge.orderId, {
        settled: evento !== "PAYMENT_CONFIRMED",
      })
      return
    }

    case "PAYMENT_OVERDUE":
      await prisma.asaasCharge.update({
        where: { id: charge.id },
        data: { status: "OVERDUE" },
      })
      await markOrderOverdue(charge.orderId)
      return

    case "PAYMENT_CHARGEBACK_REQUESTED":
    case "PAYMENT_AWAITING_CHARGEBACK_REVERSAL":
      await openChargeback(charge.orderId)
      return

    case "PAYMENT_REFUNDED":
      await refundOrder(charge.orderId)
      return

    // PAYMENT_REFUND_IN_PROGRESS não é devolução efetivada, e
    // PAYMENT_CREDIT_CARD_CAPTURE_REFUSED e PAYMENT_DELETED não mudam vigência.
    // Só espelham o estado da cobrança.
    default: {
      const atual = await getPayment(paymentId).catch(() => null)
      if (atual) {
        await prisma.asaasCharge.update({
          where: { id: charge.id },
          data: { status: atual.status },
        })
      }
    }
  }
}
