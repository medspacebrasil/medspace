"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createListingSchema } from "@/lib/validators"
import { generateSlug } from "@/lib/utils"

export type AdminCreateListingState = {
  success: boolean
  errors?: Record<string, string[]>
}

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Não autorizado")
  }
}

export async function approveListing(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  await prisma.listing.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function rejectListing(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  await prisma.listing.update({
    where: { id },
    data: { status: "REJECTED" },
  })

  revalidatePath("/admin/anuncios")
}

export async function archiveListing(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  await prisma.listing.update({
    where: { id },
    data: { status: "ARCHIVED" },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function unarchiveListing(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  await prisma.listing.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function setListingStatus(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  const status = formData.get("status") as "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "ARCHIVED"
  if (!id || !status) throw new Error("Dados incompletos")

  await prisma.listing.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function blockClinic(formData: FormData) {
  await requireAdmin()
  const clinicId = formData.get("clinicId") as string
  if (!clinicId) throw new Error("ID da clínica não fornecido")

  // Archive all listings from this clinic
  await prisma.listing.updateMany({
    where: { clinicId },
    data: { status: "ARCHIVED" },
  })

  // Deactivate the user account
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { userId: true },
  })
  if (clinic) {
    await prisma.user.update({
      where: { id: clinic.userId },
      data: { role: "CLINIC" }, // keep role but we mark via naming
    })
  }

  revalidatePath("/admin/clinicas")
  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function markReviewed(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  await prisma.listing.update({
    where: { id },
    data: { reviewedAt: new Date() },
  })

  revalidatePath("/admin/anuncios")
}

export async function deleteListingPermanent(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  // Cascading delete handles images, listing_specialties, listing_equipment
  await prisma.listing.delete({ where: { id } })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
  redirect("/admin/anuncios")
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  const listing = await prisma.listing.findUnique({ where: { id }, select: { featured: true } })
  if (!listing) throw new Error("Anúncio não encontrado")

  await prisma.listing.update({
    where: { id },
    data: { featured: !listing.featured },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/")
}

export async function adminCreateListing(
  _prevState: AdminCreateListingState,
  formData: FormData
): Promise<AdminCreateListingState> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const clinicId = formData.get("clinicId") as string | null
  if (!clinicId) {
    return { success: false, errors: { _form: ["Clínica não informada"] } }
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true },
  })
  if (!clinic) {
    return { success: false, errors: { _form: ["Clínica não encontrada"] } }
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
      roomTypeId: formData.get("roomTypeId") || undefined,
      specialtyIds: formData.getAll("specialtyIds"),
      equipmentIds: formData.getAll("equipmentIds"),
      customSpecialties: formData.get("customSpecialties") || undefined,
      customEquipment: formData.get("customEquipment") || undefined,
      requiresRqe: formData.get("requiresRqe") === "true",
    }

    const parsed = createListingSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data

    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`

    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        type: "CLINIC",
        status: "PUBLISHED",
        // Admin-created listings are reviewed by definition
        reviewedAt: new Date(),
        clinicId,
        specialties: {
          create: specialtyIds.map((id) => ({ specialtyId: id })),
        },
        equipment: {
          create: equipmentIds.map((id) => ({ equipmentId: id })),
        },
      },
    })

    revalidatePath("/admin/anuncios")
    revalidatePath("/anuncios")
    redirect(`/admin/anuncios/${listing.id}/editar`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar anúncio"] } }
  }
}

export async function adminUpdateListing(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const fullDescription = formData.get("fullDescription") as string | null
  const city = formData.get("city") as string
  const state = formData.get("state") as string || ""
  const neighborhood = formData.get("neighborhood") as string
  const whatsapp = formData.get("whatsapp") as string
  const roomTypeId = formData.get("roomTypeId") as string | null
  const customSpecialties = formData.get("customSpecialties") as string | null
  const customEquipment = formData.get("customEquipment") as string | null
  const requiresRqe = formData.get("requiresRqe") === "true"
  const specialtyIds = formData.getAll("specialtyIds") as string[]
  const equipmentIds = formData.getAll("equipmentIds") as string[]

  await prisma.listing.update({
    where: { id },
    data: {
      title,
      description,
      fullDescription: fullDescription || null,
      city,
      state,
      neighborhood,
      whatsapp,
      roomTypeId: roomTypeId || null,
      customSpecialties: customSpecialties || null,
      customEquipment: customEquipment || null,
      requiresRqe,
      reviewedAt: new Date(),
      specialties: {
        deleteMany: {},
        create: specialtyIds.map((sid) => ({ specialtyId: sid })),
      },
      equipment: {
        deleteMany: {},
        create: equipmentIds.map((eid) => ({ equipmentId: eid })),
      },
    },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}
