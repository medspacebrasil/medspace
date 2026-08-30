"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { startCheckout, type CheckoutResult } from "@/lib/billing/checkout"
import { AsaasError } from "@/lib/asaas/client"
import { isValidCPF, isValidCNPJ } from "@/lib/validators"

export type CheckoutState = {
  success: boolean
  errors?: Record<string, string[]>
  values?: Record<string, string>
  result?: CheckoutResult
}

const schema = z.object({
  listingId: z.string().min(1),
  billingType: z.enum(["PIX", "CREDIT_CARD"]),
  // Contas legadas nao tem documento: pedimos aqui em vez de bloquear o
  // checkout, porque o Asaas exige CPF ou CNPJ para criar o cliente.
  document: z.string().optional(),
})

export async function iniciarPagamento(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Sessão expirada."] } }
  }

  const raw = {
    listingId: String(formData.get("listingId") ?? ""),
    billingType: String(formData.get("billingType") ?? ""),
    document: String(formData.get("document") ?? "").replace(/\D/g, ""),
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      values: { billingType: raw.billingType },
    }
  }

  const limite = await rateLimit(RATE_LIMITS.checkout, session.user.clinicId)
  if (!limite.success) {
    return {
      success: false,
      errors: { _form: ["Muitas tentativas. Tente novamente em instantes."] },
    }
  }

  // Escopo por clínica: sem isso um anunciante geraria cobranca no anuncio de
  // outro so trocando o id no formulario.
  const listing = await prisma.listing.findFirst({
    where: { id: parsed.data.listingId, clinicId: session.user.clinicId },
    select: { id: true, clinicId: true, title: true, type: true, status: true },
  })
  if (!listing) {
    return { success: false, errors: { _form: ["Anúncio não encontrado."] } }
  }
  if (listing.status !== "AWAITING_PAYMENT" && listing.status !== "EXPIRED") {
    return {
      success: false,
      errors: { _form: ["Este anúncio não está aguardando pagamento."] },
    }
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId },
    select: {
      id: true,
      name: true,
      document: true,
      whatsapp: true,
      asaasCustomerId: true,
      user: { select: { email: true } },
    },
  })
  if (!clinic) {
    return { success: false, errors: { _form: ["Cadastro não encontrado."] } }
  }

  // Completa o documento quando faltar, validando de verdade antes de gravar.
  let documento = clinic.document
  if (!documento) {
    const informado = parsed.data.document ?? ""
    const valido =
      (informado.length === 11 && isValidCPF(informado)) ||
      (informado.length === 14 && isValidCNPJ(informado))
    if (!valido) {
      return {
        success: false,
        errors: { document: ["Informe um CPF ou CNPJ válido."] },
        values: { billingType: raw.billingType },
      }
    }
    await prisma.clinic.update({
      where: { id: clinic.id },
      data: {
        document: informado,
        documentType: informado.length === 11 ? "CPF" : "CNPJ",
      },
    })
    documento = informado
  }

  try {
    const result = await startCheckout({
      listing,
      clinic: { ...clinic, document: documento },
      email: clinic.user.email,
      billingType: parsed.data.billingType,
    })
    revalidatePath(`/painel/anuncios/${listing.id}/pagamento`)
    return { success: true, result }
  } catch (error) {
    if (error instanceof AsaasError) {
      console.error("[checkout] Asaas recusou:", error.code, error.message)
      return { success: false, errors: { _form: [error.message] } }
    }
    console.error("[checkout] falha inesperada:", error)
    return {
      success: false,
      errors: { _form: ["Não foi possível gerar a cobrança. Tente novamente."] },
    }
  }
}
