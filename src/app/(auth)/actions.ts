"use server"

import { hash } from "bcryptjs"
import { signIn as nextAuthSignIn } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { registerSchema, loginSchema } from "@/lib/validators"
import { AuthError } from "next-auth"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function registerClinic(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
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

  // signIn with redirectTo throws a NEXT_REDIRECT on success
  // which must be re-thrown for the redirect to work
  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, errors: { _form: ["Conta criada! Faça login para continuar."] } }
    }
    // Re-throw redirect errors and any other non-auth errors
    throw error
  }

  return { success: true }
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    if (error instanceof AuthError) {
      return { success: false, errors: { _form: ["Email ou senha incorretos"] } }
    }
    // Re-throw redirect errors (NEXT_REDIRECT) — this is how
    // Auth.js v5 signals a successful login in server actions
    throw error
  }

  return { success: true }
}
