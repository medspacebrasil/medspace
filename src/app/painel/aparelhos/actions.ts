"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createEquipmentSchema, updateEquipmentSchema } from "@/lib/validators"
import { generateSlug } from "@/lib/utils"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function createEquipment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  try {
    const raw = {
      title: formData.get("title"),
      description: formData.get("description"),
      fullDescription: formData.get("fullDescription") || undefined,
      city: formData.get("city"),
      state: formData.get("state") || "",
      neighborhood: formData.get("neighborhood"),
      whatsapp: formData.get("whatsapp"),
      equipmentCategoryId: formData.get("equipmentCategoryId"),
      brand: formData.get("brand") || undefined,
      model: formData.get("model") || undefined,
      condition: formData.get("condition") || undefined,
    }

    const parsed = createEquipmentSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const data = parsed.data

    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`

    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        type: "EQUIPMENT",
        status: "PENDING",
        clinicId: session.user.clinicId,
      },
    })

    revalidatePath("/painel")
    redirect(`/painel/aparelhos/${listing.id}/editar`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar aparelho"] } }
  }
}

export async function updateEquipment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const id = formData.get("id") as string
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true, type: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId || listing.type !== "EQUIPMENT") {
    return { success: false, errors: { _form: ["Aparelho não encontrado"] } }
  }

  try {
    const raw = {
      title: formData.get("title") || undefined,
      description: formData.get("description") || undefined,
      fullDescription: formData.get("fullDescription") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      neighborhood: formData.get("neighborhood") || undefined,
      whatsapp: formData.get("whatsapp") || undefined,
      equipmentCategoryId: formData.get("equipmentCategoryId") || undefined,
      brand: formData.get("brand") || undefined,
      model: formData.get("model") || undefined,
      condition: formData.get("condition") || undefined,
    }

    const parsed = updateEquipmentSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    await prisma.listing.update({
      where: { id },
      data: parsed.data,
    })

    revalidatePath("/painel")
    revalidatePath("/aparelhos")
    return { success: true }
  } catch {
    return { success: false, errors: { _form: ["Erro ao atualizar aparelho"] } }
  }
}

export async function deleteEquipment(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    throw new Error("Não autorizado")
  }

  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true, type: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId || listing.type !== "EQUIPMENT") {
    throw new Error("Aparelho não encontrado")
  }

  await prisma.listing.delete({ where: { id } })
  revalidatePath("/painel")
}

export async function publishEquipment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const id = formData.get("id") as string
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId || listing.type !== "EQUIPMENT") {
    return { success: false, errors: { _form: ["Aparelho não encontrado"] } }
  }

  if (listing.status !== "DRAFT" && listing.status !== "REJECTED") {
    return {
      success: false,
      errors: { _form: ["Apenas rascunhos ou aparelhos rejeitados podem ser enviados para revisão"] },
    }
  }

  if (listing.images.length === 0) {
    return {
      success: false,
      errors: { _form: ["Adicione pelo menos 1 foto para publicar"] },
    }
  }

  await prisma.listing.update({
    where: { id },
    data: { status: "PENDING" },
  })

  revalidatePath("/painel")
  return { success: true }
}
