"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod/v4"

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
