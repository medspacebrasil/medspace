"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  createListingSchema,
  updateListingSchema,
  createEquipmentSchema,
  updateEquipmentSchema,
  createEducationSchema,
  updateEducationSchema,
} from "@/lib/validators"
import { generateSlug } from "@/lib/utils"

export type AdminCreateListingState = {
  success: boolean
  errors?: Record<string, string[]>
}

export type AdminUpdateEquipmentState = {
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
  revalidateTag("listings", "max")
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
  revalidatePath("/anuncios")
  revalidateTag("listings", "max")
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
  revalidateTag("listings", "max")
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
  revalidateTag("listings", "max")
}

const LISTING_STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"] as const
type ListingStatusValue = (typeof LISTING_STATUSES)[number]

export async function setListingStatus(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  const status = formData.get("status") as string | null
  if (!id || !status) throw new Error("Dados incompletos")
  if (!LISTING_STATUSES.includes(status as ListingStatusValue)) {
    throw new Error("Status inválido")
  }

  await prisma.listing.update({
    where: { id },
    data: { status: status as ListingStatusValue },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
  revalidateTag("listings", "max")
}

export async function deleteClinicPermanent(formData: FormData) {
  await requireAdmin()
  const clinicId = formData.get("clinicId") as string
  if (!clinicId) throw new Error("ID da clínica não fornecido")

  // Find the user that owns the clinic so we can delete them too.
  // Cascading deletes on the schema (Clinic -> Listing -> ListingImage, ListingSpecialty, ListingEquipment)
  // remove related rows automatically. User -> Clinic is also Cascade,
  // so deleting the user will delete the clinic and everything under it.
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { userId: true },
  })
  if (!clinic) throw new Error("Clínica não encontrada")

  await prisma.user.delete({ where: { id: clinic.userId } })

  revalidatePath("/admin/clinicas")
  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
  revalidateTag("listings", "max")
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

  // Bloqueia a conta de verdade: marca blockedAt. O login passa a ser negado
  // (authorize) e os guards de escrita (getActiveClinicSession) rejeitam a
  // sessão atual imediatamente, mesmo com JWT ainda válido.
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { userId: true },
  })
  if (clinic) {
    await prisma.user.update({
      where: { id: clinic.userId },
      data: { blockedAt: new Date() },
    })
  }

  revalidatePath("/admin/clinicas")
  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
  revalidateTag("listings", "max")
}

export async function unblockClinic(formData: FormData) {
  await requireAdmin()
  const clinicId = formData.get("clinicId") as string
  if (!clinicId) throw new Error("ID da clínica não fornecido")

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { userId: true },
  })
  if (clinic) {
    await prisma.user.update({
      where: { id: clinic.userId },
      data: { blockedAt: null },
    })
  }
  // Os anúncios arquivados pelo bloqueio permanecem arquivados; o admin pode
  // republicá-los individualmente (não restauramos status automaticamente).

  revalidatePath("/admin/clinicas")
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
  revalidateTag("listings", "max")
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
  revalidateTag("listings", "max")
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
    revalidateTag("listings", "max")
    redirect(`/admin/anuncios/${listing.id}/editar`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar anúncio"] } }
  }
}

export async function adminUpdateEquipment(
  _prevState: AdminUpdateEquipmentState,
  formData: FormData
): Promise<AdminUpdateEquipmentState> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { success: false, errors: { _form: ["ID não fornecido"] } }
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { type: true },
  })
  if (!listing || listing.type !== "EQUIPMENT") {
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
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    await prisma.listing.update({
      where: { id },
      data: { ...parsed.data, reviewedAt: new Date() },
    })

    revalidatePath("/admin/anuncios")
    revalidatePath("/aparelhos")
    revalidateTag("listings", "max")
    return { success: true }
  } catch {
    return { success: false, errors: { _form: ["Erro ao atualizar aparelho"] } }
  }
}

export type AdminUpdateListingState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function adminUpdateListing(
  _prevState: AdminUpdateListingState,
  formData: FormData
): Promise<AdminUpdateListingState> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const id = formData.get("id") as string
  if (!id) return { success: false, errors: { _form: ["ID não fornecido"] } }

  // Validate/normalize input even for admins — keeps malformed or oversized
  // data out of the DB and matches the validation used everywhere else.
  const parsed = updateListingSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    fullDescription: formData.get("fullDescription") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    neighborhood: formData.get("neighborhood") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    roomTypeId: formData.get("roomTypeId") || undefined,
    customSpecialties: formData.get("customSpecialties") || undefined,
    customEquipment: formData.get("customEquipment") || undefined,
    requiresRqe: formData.get("requiresRqe") === "true",
  })
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const specialtyIds = formData.getAll("specialtyIds").map(String).filter(Boolean)
  const equipmentIds = formData.getAll("equipmentIds").map(String).filter(Boolean)

  const { roomTypeId, ...data } = parsed.data

  try {
    await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        roomTypeId: roomTypeId || null,
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
  } catch (error) {
    console.error("[adminUpdateListing] prisma update failed:", error)
    return { success: false, errors: { _form: ["Erro ao atualizar anúncio"] } }
  }

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
  revalidateTag("listings", "max")
  return { success: true }
}

export type AdminUpdateEducationState = {
  success: boolean
  errors?: Record<string, string[]>
}

export async function adminUpdateEducation(
  _prevState: AdminUpdateEducationState,
  formData: FormData
): Promise<AdminUpdateEducationState> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const id = formData.get("id") as string
  if (!id) return { success: false, errors: { _form: ["ID não fornecido"] } }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { type: true },
  })
  if (!listing || listing.type !== "EDUCATION") {
    return { success: false, errors: { _form: ["Oportunidade não encontrada"] } }
  }

  const parsed = updateEducationSchema.safeParse({
    title: formData.get("title"),
    educationType: formData.get("educationType"),
    area: formData.get("area") || undefined,
    description: formData.get("description"),
    audience: formData.get("audience") || undefined,
    educationModality: formData.get("educationModality"),
    workload: formData.get("workload") || undefined,
    duration: formData.get("duration") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    investment: formData.get("investment") || undefined,
    whatsapp: formData.get("whatsapp"),
    externalLink: formData.get("externalLink") || undefined,
  })
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const d = parsed.data
  try {
    await prisma.listing.update({
      where: { id },
      data: {
        // Admin é o moderador: editar marca como revisado, sem reenviar p/ fila.
        reviewedAt: new Date(),
        ...(d.title !== undefined && { title: d.title }),
        ...(d.description !== undefined && {
          description: d.description.slice(0, 300),
          fullDescription: d.description,
        }),
        ...(d.city !== undefined && { city: d.city }),
        ...(d.state !== undefined && { state: d.state }),
        ...(d.whatsapp !== undefined && { whatsapp: d.whatsapp }),
        ...(d.educationType !== undefined && { educationType: d.educationType as never }),
        ...(d.educationModality !== undefined && { educationModality: d.educationModality as never }),
        ...(d.audience !== undefined && { audience: d.audience || null }),
        ...(d.workload !== undefined && { workload: d.workload || null }),
        ...(d.duration !== undefined && { duration: d.duration || null }),
        ...(d.investment !== undefined && { investment: d.investment || null }),
        ...(d.externalLink !== undefined && { externalLink: d.externalLink || null }),
        ...(d.area !== undefined && { customSpecialties: d.area || null }),
      },
    })
  } catch (error) {
    console.error("[adminUpdateEducation] prisma update failed:", error)
    return { success: false, errors: { _form: ["Erro ao atualizar oportunidade"] } }
  }

  revalidatePath("/admin/anuncios")
  revalidatePath("/educacao-medica")
  revalidateTag("listings", "max")
  return { success: true }
}

export async function adminCreateEquipment(
  _prevState: AdminCreateListingState,
  formData: FormData
): Promise<AdminCreateListingState> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const clinicId = formData.get("clinicId") as string | null
  if (!clinicId) {
    return { success: false, errors: { _form: ["Anunciante não informado"] } }
  }
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true } })
  if (!clinic) {
    return { success: false, errors: { _form: ["Anunciante não encontrado"] } }
  }

  try {
    const parsed = createEquipmentSchema.safeParse({
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
    })
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
        status: "PUBLISHED",
        reviewedAt: new Date(),
        clinicId,
      },
    })

    revalidatePath("/admin/anuncios")
    revalidatePath("/aparelhos")
    revalidateTag("listings", "max")
    redirect(`/admin/aparelhos/${listing.id}/editar`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar aparelho"] } }
  }
}

export async function adminCreateEducation(
  _prevState: AdminCreateListingState,
  formData: FormData
): Promise<AdminCreateListingState> {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  const clinicId = formData.get("clinicId") as string | null
  if (!clinicId) {
    return { success: false, errors: { _form: ["Anunciante não informado"] } }
  }
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true } })
  if (!clinic) {
    return { success: false, errors: { _form: ["Anunciante não encontrado"] } }
  }

  try {
    const parsed = createEducationSchema.safeParse({
      title: formData.get("title"),
      educationType: formData.get("educationType"),
      area: formData.get("area") || undefined,
      description: formData.get("description"),
      audience: formData.get("audience") || undefined,
      educationModality: formData.get("educationModality"),
      workload: formData.get("workload") || undefined,
      duration: formData.get("duration") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      investment: formData.get("investment") || undefined,
      whatsapp: formData.get("whatsapp"),
      externalLink: formData.get("externalLink") || undefined,
    })
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const d = parsed.data
    const baseSlug = generateSlug(d.title)
    let slug = baseSlug
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`

    const listing = await prisma.listing.create({
      data: {
        title: d.title,
        description: d.description.slice(0, 300),
        fullDescription: d.description,
        city: d.city || "",
        state: d.state || "",
        neighborhood: "",
        whatsapp: d.whatsapp,
        educationType: d.educationType as never,
        educationModality: d.educationModality as never,
        audience: d.audience || null,
        workload: d.workload || null,
        duration: d.duration || null,
        investment: d.investment || null,
        externalLink: d.externalLink || null,
        customSpecialties: d.area || null,
        slug,
        type: "EDUCATION",
        status: "PUBLISHED",
        reviewedAt: new Date(),
        clinicId,
      },
    })

    revalidatePath("/admin/anuncios")
    revalidatePath("/educacao-medica")
    revalidateTag("listings", "max")
    redirect(`/admin/educacao/${listing.id}/editar`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar oportunidade"] } }
  }
}
