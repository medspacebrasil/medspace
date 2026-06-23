"use server"

import { randomBytes, createHash } from "crypto"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators"
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit"
import { sendPasswordResetEmail } from "@/lib/email"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "https"
  return `${proto}://${host}`
}

/**
 * Solicita a redefinição de senha. Sempre retorna sucesso genérico, mesmo
 * quando o e-mail não existe, para não revelar quais e-mails têm conta
 * (anti-enumeração).
 */
export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const email = parsed.data.email.toLowerCase()

  // Rate limit por IP e por e-mail.
  const ip = await getClientIp()
  const byIp = await rateLimit(RATE_LIMITS.passwordReset, `ip:${ip}`)
  const byEmail = await rateLimit(RATE_LIMITS.passwordReset, `email:${email}`)
  if (!byIp.success || !byEmail.success) {
    // Resposta genérica para não vazar nada.
    return { success: true }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    // Invalida tokens anteriores e cria um novo.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    const rawToken = randomBytes(32).toString("hex")
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(rawToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })
    const resetUrl = `${await baseUrl()}/redefinir-senha?token=${rawToken}`
    try {
      await sendPasswordResetEmail(user.email, resetUrl)
    } catch (error) {
      console.error("[requestPasswordReset] falha ao enviar e-mail:", error)
      // Não revela falha ao usuário; mantém resposta genérica.
    }
  }

  return { success: true }
}

/**
 * Redefine a senha a partir do token recebido por e-mail. Token é de uso
 * único e expira em 1 hora.
 */
export async function resetPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  })

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {})
    }
    return {
      success: false,
      errors: { _form: ["Link inválido ou expirado. Solicite uma nova redefinição."] },
    }
  }

  const passwordHash = await hash(parsed.data.password, 12)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    // Invalida todos os tokens do usuário após o uso.
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ])

  try {
    redirect("/login?reset=1")
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: true }
  }
  return { success: true }
}
