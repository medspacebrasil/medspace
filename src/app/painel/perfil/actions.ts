"use server"

import { revalidatePath } from "next/cache"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase/client"
import { compare, hash } from "bcryptjs"
import { z } from "zod/v4"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"

function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/listings/"
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

const profileSchema = z.object({
  name: z.string().min(2).max(150),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos").optional().or(z.literal("")),
  whatsapp: z.string().regex(/^\d{10,11}$/),
  city: z.string().min(2).max(100),
  neighborhood: z.string().min(2).max(100),
  description: z.string().max(2000, "Descrição muito longa").optional(),
})

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  try {
    const raw = {
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
      whatsapp: formData.get("whatsapp"),
      city: formData.get("city"),
      neighborhood: formData.get("neighborhood"),
      description: formData.get("description") || undefined,
    }

    const parsed = profileSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    await prisma.clinic.update({
      where: { id: session.user.clinicId },
      data: parsed.data,
    })

    revalidatePath("/painel/perfil")
    return { success: true }
  } catch {
    return { success: false, errors: { _form: ["Erro ao atualizar perfil"] } }
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres").max(128),
  confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export async function changePassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const limit = await rateLimit(RATE_LIMITS.password, session.user.id)
  if (!limit.success) {
    return {
      success: false,
      errors: { _form: ["Muitas tentativas. Tente novamente mais tarde."] },
    }
  }

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user) {
    return { success: false, errors: { _form: ["Usuário não encontrado"] } }
  }

  const isValid = await compare(parsed.data.currentPassword, user.passwordHash)
  if (!isValid) {
    return { success: false, errors: { currentPassword: ["Senha atual incorreta"] } }
  }

  const newHash = await hash(parsed.data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  return { success: true }
}

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Informe sua senha para confirmar"),
})

/**
 * LGPD — right to erasure (art. 18, VI). Permanently deletes the account and
 * everything tied to it: the clinic, its listings and listing images
 * (DB cascade), plus the image files in Supabase Storage. Requires the
 * current password as a confirmation step, then signs the user out.
 */
export async function deleteAccount(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id || !session.user.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const parsed = deleteAccountSchema.safeParse({
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })
  if (!user) {
    return { success: false, errors: { _form: ["Usuário não encontrado"] } }
  }

  const valid = await compare(parsed.data.password, user.passwordHash)
  if (!valid) {
    return { success: false, errors: { password: ["Senha incorreta"] } }
  }

  // Remove uploaded images from storage first (best effort — the legally
  // required erasure is the DB delete below, which must not be blocked by a
  // storage hiccup).
  try {
    const images = await prisma.listingImage.findMany({
      where: { listing: { clinicId: session.user.clinicId } },
      select: { url: true },
    })
    const paths = images
      .map((i) => storagePathFromPublicUrl(i.url))
      .filter((p): p is string => p !== null)
    if (paths.length > 0) {
      await getSupabaseAdmin().storage.from("listings").remove(paths)
    }
  } catch (error) {
    console.error("[deleteAccount] storage cleanup failed:", error)
  }

  // Cascade: User -> Clinic -> Listing -> (images, specialties, equipment)
  await prisma.user.delete({ where: { id: session.user.id } })

  revalidatePath("/anuncios")

  try {
    await signOut({ redirectTo: "/?conta-excluida=1" })
  } catch (error) {
    if (isRedirectError(error)) throw error
    // Account is already deleted; if sign-out fails, the stale session will be
    // rejected on the next request anyway.
  }

  return { success: true }
}
