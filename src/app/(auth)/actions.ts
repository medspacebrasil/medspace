"use server"

import { hash } from "bcryptjs"
import { signIn as nextAuthSignIn } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { registerSchema, loginSchema, TERMS_VERSION } from "@/lib/validators"
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function registerClinic(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp()
  const limit = await rateLimit(RATE_LIMITS.register, ip)
  if (!limit.success) {
    return {
      success: false,
      errors: { _form: ["Muitas tentativas de cadastro. Tente novamente mais tarde."] },
    }
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    clinicName: formData.get("clinicName"),
    whatsapp: formData.get("whatsapp"),
    city: formData.get("city"),
    state: formData.get("state") || "",
    neighborhood: formData.get("neighborhood"),
    acceptTerms: formData.get("acceptTerms"),
    marketingOptIn: formData.get("marketingOptIn") === "on",
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const {
    email,
    password,
    name,
    clinicName,
    whatsapp,
    city,
    state,
    neighborhood,
    marketingOptIn,
  } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, errors: { email: ["Este email já está cadastrado"] } }
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
    return { success: false, errors: { _form: ["Conta criada! Faça login para continuar."] } }
  }

  return { success: true }
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp()
  const limit = await rateLimit(RATE_LIMITS.login, ip)
  if (!limit.success) {
    return {
      success: false,
      errors: {
        _form: [
          `Muitas tentativas de login. Aguarde ${limit.retryAfter || 60}s e tente novamente.`,
        ],
      },
    }
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await nextAuthSignIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/painel",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    // Generic message only — never leak internal error details to the client.
    return {
      success: false,
      errors: { _form: ["Email ou senha incorretos"] },
    }
  }

  return { success: true }
}
