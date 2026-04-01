"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createListingSchema, updateListingSchema } from "@/lib/validators"
import { generateSlug } from "@/lib/utils"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function createListing(
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
      neighborhood: formData.get("neighborhood"),
      whatsapp: formData.get("whatsapp"),
      roomTypeId: formData.get("roomTypeId") || undefined,
      specialtyIds: formData.getAll("specialtyIds"),
      equipmentIds: formData.getAll("equipmentIds"),
    }

    const parsed = createListingSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data

    let slug = generateSlug(data.title)
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        clinicId: session.user.clinicId,
        specialties: {
          create: specialtyIds.map((id) => ({ specialtyId: id })),
        },
        equipment: {
          create: equipmentIds.map((id) => ({ equipmentId: id })),
        },
      },
    })

    revalidatePath("/painel")
    redirect(`/painel/anuncios/${listing.id}/editar`)
  } catch (error) {
    // redirect throws, re-throw
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error
    return { success: false, errors: { _form: ["Erro ao criar anúncio"] } }
  }
}

export async function updateListing(
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
    select: { clinicId: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId) {
    return { success: false, errors: { _form: ["Anúncio não encontrado"] } }
  }

  try {
    const raw = {
      title: formData.get("title") || undefined,
      description: formData.get("description") || undefined,
      fullDescription: formData.get("fullDescription") || undefined,
      city: formData.get("city") || undefined,
      neighborhood: formData.get("neighborhood") || undefined,
      whatsapp: formData.get("whatsapp") || undefined,
      roomTypeId: formData.get("roomTypeId") || undefined,
      specialtyIds: formData.getAll("specialtyIds").length > 0
        ? formData.getAll("specialtyIds")
        : undefined,
      equipmentIds: formData.getAll("equipmentIds").length > 0
        ? formData.getAll("equipmentIds")
        : undefined,
    }

    const parsed = updateListingSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data

    await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        ...(specialtyIds && {
          specialties: {
            deleteMany: {},
            create: specialtyIds.map((sid) => ({ specialtyId: sid })),
          },
        }),
        ...(equipmentIds && {
          equipment: {
            deleteMany: {},
            create: equipmentIds.map((eid) => ({ equipmentId: eid })),
          },
        }),
      },
    })

    revalidatePath("/painel")
    revalidatePath(`/anuncios`)
    return { success: true }
  } catch {
    return { success: false, errors: { _form: ["Erro ao atualizar anúncio"] } }
  }
}

export async function deleteListing(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user?.clinicId) return

  const id = formData.get("id") as string
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId) return

  await prisma.listing.delete({ where: { id } })
  revalidatePath("/painel")
}

export async function publishListing(formData: FormData): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const id = formData.get("id") as string
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: true,
      specialties: true,
    },
  })

  if (!listing || listing.clinicId !== session.user.clinicId) {
    return { success: false, errors: { _form: ["Anúncio não encontrado"] } }
  }

  if (listing.images.length === 0) {
    return {
      success: false,
      errors: { _form: ["Adicione pelo menos 1 foto para publicar"] },
    }
  }

  if (listing.specialties.length === 0) {
    return {
      success: false,
      errors: { _form: ["Selecione pelo menos 1 especialidade"] },
    }
  }

  await prisma.listing.update({
    where: { id },
    data: { status: "PENDING" },
  })

  revalidatePath("/painel")
  return { success: true }
}
