"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function approveListing(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const id = formData.get("id") as string
  await prisma.listing.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function rejectListing(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const id = formData.get("id") as string
  await prisma.listing.update({
    where: { id },
    data: { status: "REJECTED" },
  })

  revalidatePath("/admin/anuncios")
}

export async function archiveListing(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const id = formData.get("id") as string
  await prisma.listing.update({
    where: { id },
    data: { status: "ARCHIVED" },
  })

  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}

export async function blockClinic(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const clinicId = formData.get("clinicId") as string

  await prisma.listing.updateMany({
    where: { clinicId },
    data: { status: "ARCHIVED" },
  })

  revalidatePath("/admin/clinicas")
  revalidatePath("/admin/anuncios")
  revalidatePath("/anuncios")
}
