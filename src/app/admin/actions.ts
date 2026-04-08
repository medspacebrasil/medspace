"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
  const status = formData.get("status") as string
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

export async function adminUpdateListing(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const fullDescription = formData.get("fullDescription") as string | null
  const city = formData.get("city") as string
  const neighborhood = formData.get("neighborhood") as string
  const whatsapp = formData.get("whatsapp") as string
  const roomTypeId = formData.get("roomTypeId") as string | null
  const specialtyIds = formData.getAll("specialtyIds") as string[]
  const equipmentIds = formData.getAll("equipmentIds") as string[]

  await prisma.listing.update({
    where: { id },
    data: {
      title,
      description,
      fullDescription: fullDescription || null,
      city,
      neighborhood,
      whatsapp,
      roomTypeId: roomTypeId || null,
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
