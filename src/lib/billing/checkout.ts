import type { Listing, Clinic } from "@prisma/client"
import { prisma } from "@/lib/db"
import {
  createCustomer,
  createPayment,
  deletePayment,
  getPayment,
  getPixQrCode,
  toAsaasDate,
  AsaasError,
  type AsaasBilling,
} from "@/lib/asaas/client"
import { activatePublication, createPublicationOrder } from "./orders"
import { COBRANCA_TERMINAL, PAGO_STATUS } from "./status"

/**
 * Checkout da taxa de publicação.
 *
 * Regra de ouro deste arquivo: nada aqui publica anúncio. A publicação só
 * acontece pelo webhook, depois da confirmação do Asaas. O checkout apenas cria
 * o pedido e a cobrança, e devolve ao anunciante a forma de pagar.
 */

export interface CheckoutResult {
  orderId: string
  billingType: AsaasBilling
  /** Cartão: fatura hospedada no Asaas, fora do escopo PCI. */
  invoiceUrl?: string
  /** Pix: copia e cola e QR em base64. */
  pixPayload?: string
  pixQrCodeBase64?: string
  pixExpiresAt?: Date
}

type ClinicForCheckout = Pick<
  Clinic,
  "id" | "name" | "document" | "whatsapp" | "asaasCustomerId"
>

/**
 * Garante o cliente correspondente no Asaas.
 *
 * O id é guardado na clínica e reusado nas cobranças seguintes, como a
 * documentação recomenda: criar um cliente novo a cada cobrança encheria a conta
 * de duplicados e quebraria a conciliação pelo painel do Asaas.
 */
async function ensureCustomer(
  clinic: ClinicForCheckout,
  email: string
): Promise<string> {
  if (clinic.asaasCustomerId) return clinic.asaasCustomerId

  if (!clinic.document) {
    throw new AsaasError(
      "CPF ou CNPJ é obrigatório para emitir a cobrança",
      "MISSING_DOCUMENT",
      400
    )
  }

  const customer = await createCustomer({
    name: clinic.name,
    cpfCnpj: clinic.document,
    email,
    mobilePhone: clinic.whatsapp,
  })

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: { asaasCustomerId: customer.id },
  })

  return customer.id
}

export interface StartCheckoutInput {
  listing: Pick<Listing, "id" | "clinicId" | "title" | "type">
  clinic: ClinicForCheckout
  email: string
  billingType: AsaasBilling
}

/**
 * Fecha as cobranças abertas de um pedido antes de gerar outra.
 *
 * Duas cobranças vivas para o mesmo pedido podem ser pagas as duas, e aí o
 * relatório mostra um pagamento onde entraram dois. Cobrança que a API diz
 * estar paga muda tudo: ativa o pedido e interrompe o checkout, porque não
 * existe mais nada a cobrar.
 */
async function encerrarCobrancasAbertas(order: {
  id: string
  charges: { id: string; asaasPaymentId: string }[]
}) {
  for (const c of order.charges) {
    const atual = await getPayment(c.asaasPaymentId)
    if (PAGO_STATUS.has(atual.status)) {
      await prisma.asaasCharge.update({ where: { id: c.id }, data: { status: atual.status } })
      await activatePublication(order.id, { settled: atual.status !== "CONFIRMED" })
      throw new AsaasError(
        "Encontramos um pagamento já confirmado para este anúncio. Ele será publicado em instantes, sem nova cobrança.",
        "ALREADY_PAID",
        409
      )
    }
    try {
      await deletePayment(c.asaasPaymentId)
      await prisma.asaasCharge.update({ where: { id: c.id }, data: { status: "DELETED" } })
    } catch (error) {
      // Não impede a nova cobrança: fica registrado e a varredura diária
      // reconfere as vencidas.
      console.error("[checkout] falha ao cancelar cobranca anterior", c.asaasPaymentId, error)
    }
  }
}

export async function startCheckout({
  listing,
  clinic,
  email,
  billingType,
}: StartCheckoutInput): Promise<CheckoutResult> {
  const customerId = await ensureCustomer(clinic, email)

  // Reaproveita pedido sem pagamento em vez de criar um novo a cada tentativa:
  // o anunciante que gera um Pix, desiste e volta no cartão precisa continuar
  // no mesmo pedido, senão a vigência e o histórico ficam duplicados. Vale
  // também para o pedido cuja cobrança venceu: pagar atrasado é fluxo normal.
  const existente = await prisma.publicationOrder.findFirst({
    where: {
      listingId: listing.id,
      status: { in: ["PENDING_PAYMENT", "EXPIRED_UNPAID"] },
      paidAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      charges: {
        where: { status: { notIn: [...COBRANCA_TERMINAL] } },
        select: { id: true, asaasPaymentId: true },
      },
    },
  })
  if (existente) await encerrarCobrancasAbertas(existente)

  const order =
    existente ??
    (await createPublicationOrder({ listing, clinicName: clinic.name }))

  const vencimento = new Date()
  // Pix sem chave cadastrada expira às 23:59 do mesmo dia, então o vencimento
  // no mesmo dia evita prometer prazo que o gateway não sustenta.
  if (billingType === "CREDIT_CARD") {
    vencimento.setDate(vencimento.getDate() + 3)
  }

  const payment = await createPayment({
    customer: customerId,
    billingType,
    value: order.amountCents / 100,
    dueDate: toAsaasDate(vencimento),
    description: `Publicação do anúncio "${listing.title}" por ${order.durationDays} dias`,
    // Reconciliação pelo painel do Asaas sem depender do mapeamento interno.
    externalReference: order.id,
  })

  const charge = await prisma.asaasCharge.create({
    data: {
      orderId: order.id,
      asaasPaymentId: payment.id,
      billingType,
      valueCents: order.amountCents,
      status: payment.status,
      invoiceUrl: payment.invoiceUrl,
      dueDate: vencimento,
    },
  })

  if (billingType !== "PIX") {
    return { orderId: order.id, billingType, invoiceUrl: payment.invoiceUrl }
  }

  const qr = await getPixQrCode(payment.id)
  const expira = qr.expirationDate ? new Date(qr.expirationDate) : undefined

  await prisma.asaasCharge.update({
    where: { id: charge.id },
    data: { pixPayload: qr.payload, pixExpiresAt: expira },
  })

  return {
    orderId: order.id,
    billingType,
    pixPayload: qr.payload,
    pixQrCodeBase64: qr.encodedImage,
    pixExpiresAt: expira,
  }
}
