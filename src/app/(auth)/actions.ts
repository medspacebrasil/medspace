"use server"

import { hash } from "bcryptjs"
import { signIn as nextAuthSignIn } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { registerSchema, TERMS_VERSION, documentTypeFor } from "@/lib/validators"
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit"
import { echoFormValues } from "@/lib/form-values"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
  /**
   * Valores submetidos, ecoados de volta em falhas para repopular o form.
   * O React 19 reseta inputs não-controlados após a action — sem isso o
   * usuário perde tudo que digitou quando a validação falha (ex.: submissão
   * implícita pelo Enter do teclado do celular). Nunca incluir senha.
   */
  values?: Record<string, string>
  /**
   * Mensagem informativa de resultado positivo que NÃO é erro (ex.: conta
   * criada mas auto-login falhou) — renderizada em verde, não em vermelho.
   */
  info?: string
}

export async function registerClinic(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    advertiserType: formData.get("advertiserType"),
    clinicName: formData.get("clinicName"),
    document: formData.get("document"),
    whatsapp: formData.get("whatsapp"),
    city: formData.get("city"),
    state: formData.get("state") || "",
    neighborhood: formData.get("neighborhood"),
    acceptTerms: formData.get("acceptTerms"),
    marketingOptIn: formData.get("marketingOptIn") === "on",
  }

  const values = echoFormValues(formData)

  // Valida antes do rate limit: submissões implícitas (Enter do teclado no
  // celular) com dados incompletos não devem consumir as poucas tentativas
  // permitidas por hora. O limiter continua protegendo o caminho caro (DB).
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      values,
    }
  }

  const ip = await getClientIp()
  const limit = await rateLimit(RATE_LIMITS.register, ip)
  if (!limit.success) {
    return {
      success: false,
      errors: { _form: ["Muitas tentativas de cadastro. Tente novamente mais tarde."] },
      values,
    }
  }

  const {
    email,
    password,
    name,
    advertiserType,
    clinicName,
    document,
    whatsapp,
    city,
    state,
    neighborhood,
    marketingOptIn,
  } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return {
      success: false,
      errors: { email: ["Este email já está cadastrado"] },
      values,
    }
  }

  const passwordHash = await hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      acceptedTermsAt: new Date(),
      acceptedTermsVersion: TERMS_VERSION,
      marketingOptIn,
      clinic: {
        create: {
          name: clinicName,
          advertiserType,
          document,
          documentType: documentTypeFor(advertiserType),
          whatsapp,
          city,
          state: state || "",
          neighborhood,
        },
      },
    },
  })

  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirectTo: "/painel?welcome=1",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    // A conta FOI criada; só o auto-login falhou — não é um erro do usuário,
    // então vai em `info` (verde, com link para o login) e não em errors._form.
    return {
      success: false,
      info: "Sua conta foi criada com sucesso! Só não conseguimos entrar automaticamente. Faça login para continuar.",
      values,
    }
  }

  return { success: true }
}
