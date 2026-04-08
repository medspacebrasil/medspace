"use server"

import { hash } from "bcryptjs"
import { signIn as nextAuthSignIn } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { registerSchema, loginSchema } from "@/lib/validators"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function registerClinic(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      clinicName: formData.get("clinicName"),
      whatsapp: formData.get("whatsapp"),
      city: formData.get("city"),
      neighborhood: formData.get("neighborhood"),
    }

    const parsed = registerSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const { email, password, name, clinicName, whatsapp, city, neighborhood } =
      parsed.data

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
        clinic: {
          create: {
            name: clinicName,
            whatsapp,
            city,
            neighborhood,
          },
        },
      },
    })

    await nextAuthSignIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    })

    return { success: true }
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      return { success: false, errors: { _form: ["Erro ao fazer login após cadastro"] } }
    }
    if (
      error instanceof Object &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false, errors: { email: ["Este email já está cadastrado"] } }
    }
    return { success: false, errors: { _form: ["Erro interno. Tente novamente."] } }
  }
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    }

    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    await nextAuthSignIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/painel",
    })

    return { success: true }
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      return { success: false, errors: { _form: ["Email ou senha incorretos"] } }
    }
    return { success: false, errors: { _form: ["Erro interno. Tente novamente."] } }
  }
}
