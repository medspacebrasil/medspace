"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createEducationSchema, updateEducationSchema } from "@/lib/validators"
import { generateSlug } from "@/lib/utils"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
}

/** Maps validated form fields to the Listing columns used by EDUCATION listings. */
function toListingData(data: {
  title: string
  educationType: string
  area?: string
  description: string
  audience?: string
  educationModality: string
  workload?: string
  duration?: string
  city?: string
  state?: string
  investment?: string
  whatsapp: string
  externalLink?: string
}) {
  return {
    title: data.title,
    // Short summary for cards (column is VarChar 300); full text goes to fullDescription.
    description: data.description.slice(0, 300),
    fullDescription: data.description,
    city: data.city || "",
    state: data.state || "",
    neighborhood: "",
    whatsapp: data.whatsapp,
    educationType: data.educationType as never,
    educationModality: data.educationModality as never,
    audience: data.audience || null,
    workload: data.workload || null,
    duration: data.duration || null,
    investment: data.investment || null,
    externalLink: data.externalLink || null,
    customSpecialties: data.area || null,
  }
}

function rawFromForm(formData: FormData) {
  return {
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
  }
}

export async function createEducation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] } }
  }

  try {
    const parsed = createEducationSchema.safeParse(rawFromForm(formData))
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const baseSlug = generateSlug(parsed.data.title)
    let slug = baseSlug
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`

    const listing = await prisma.listing.create({
      data: {
        ...toListingData(parsed.data),
        slug,
        type: "EDUCATION",
        // Entra em fila de verificação antes de ficar visível (briefing 5.6).
        status: "PENDING",
        clinicId: session.user.clinicId,
      },
    })

    revalidatePath("/painel")
    redirect(`/painel/educacao/${listing.id}/editar?created=1`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar anúncio"] } }
  }
}

export async function updateEducation(
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
  if (!listing || listing.clinicId !== session.user.clinicId || listing.type !== "EDUCATION") {
    return { success: false, errors: { _form: ["Anúncio não encontrado"] } }
  }

  try {
    const parsed = updateEducationSchema.safeParse(rawFromForm(formData))
    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    const d = parsed.data
    await prisma.listing.update({
      where: { id },
      data: {
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

    revalidatePath("/painel")
    revalidatePath("/educacao-medica")
    return { success: true }
  } catch {
    return { success: false, errors: { _form: ["Erro ao atualizar anúncio"] } }
  }
}

export async function deleteEducation(formData: FormData): Promise<void> {
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
  if (!listing || listing.clinicId !== session.user.clinicId || listing.type !== "EDUCATION") {
    throw new Error("Anúncio não encontrado")
  }

  await prisma.listing.delete({ where: { id } })
  revalidatePath("/painel")
  revalidatePath("/educacao-medica")
}

/** Resubmit a rejected education listing for review. */
export async function resubmitEducation(
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
    select: { clinicId: true, type: true, status: true },
  })
  if (!listing || listing.clinicId !== session.user.clinicId || listing.type !== "EDUCATION") {
    return { success: false, errors: { _form: ["Anúncio não encontrado"] } }
  }
  if (listing.status !== "REJECTED" && listing.status !== "DRAFT") {
    return { success: false, errors: { _form: ["Apenas anúncios rejeitados podem ser reenviados"] } }
  }

  await prisma.listing.update({ where: { id }, data: { status: "PENDING" } })
  revalidatePath("/painel")
  return { success: true }
}
