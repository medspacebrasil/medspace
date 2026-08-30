import type { Listing, Clinic } from "@prisma/client"
import { prisma } from "@/lib/db"
import {
  createCustomer,
  createPayment,
  getPixQrCode,
  toAsaasDate,
  AsaasError,
  type AsaasBilling,
} from "@/lib/asaas/client"
import { createPublicationOrder } from "./orders"
import { priceFor } from "./pricing"

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

export async function startCheckout({
  listing,
  clinic,
  email,
  billingType,
}: StartCheckoutInput): Promise<CheckoutResult> {
  const customerId = await ensureCustomer(clinic, email)

  // Reaproveita pedido pendente em vez de criar um novo a cada tentativa: o
  // anunciante que gera um Pix, desiste e volta no cartão precisa continuar no
  // mesmo pedido, senão a vigência e o histórico ficam duplicados.
  const existente = await prisma.publicationOrder.findFirst({
    where: { listingId: listing.id, status: "PENDING_PAYMENT" },
    orderBy: { createdAt: "desc" },
  })

  const order =
    existente ??
    (await createPublicationOrder({ listing, clinicName: clinic.name }))

  const preco = priceFor(listing.type)
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
    description: `Publicação do anúncio "${listing.title}" por ${preco.durationDays} dias`,
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
