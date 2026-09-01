"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { auth } from "@/lib/auth"
import { getActiveClinicSession } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { createListingSchema, updateListingSchema } from "@/lib/validators"
import { generateSlug } from "@/lib/utils"
import { echoFormValues } from "@/lib/form-values"
import { validSpecialtyIds, validEquipmentIds } from "@/lib/listing-taxonomy"
import { cancelarPedidosPendentes } from "@/lib/billing/orders"

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
  /**
   * Valores submetidos, ecoados de volta em falhas para repopular o form.
   * O React 19 reseta inputs não-controlados após a action — sem isso o
   * usuário perde tudo que digitou quando a validação falha.
   */
  values?: Record<string, string>
  /**
   * true quando a edição devolveu um anúncio PUBLICADO para a fila de revisão
   * (re-moderação) — o cliente usa isso para avisar que o anúncio saiu do ar.
   */
  demoted?: boolean
}

export async function createListing(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const values = echoFormValues(formData)
  const session = await getActiveClinicSession()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] }, values }
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
      allSpecialties: formData.get("allSpecialties") === "true",
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
        values,
      }
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data
    // "Todas as especialidades" dispensa (e limpa) a marcação individual.
    const specIds = data.allSpecialties ? [] : await validSpecialtyIds(specialtyIds)
    const eqIds = await validEquipmentIds(equipmentIds)

    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`

    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        type: "CLINIC",
        // Entra na fila de verificação (PENDING) antes de ficar público; só o
        // admin pode aprovar (PUBLISHED). Igual a aparelhos/educação.
        status: "PENDING",
        clinicId: session.user.clinicId,
        specialties: {
          create: specIds.map((id) => ({ specialtyId: id })),
        },
        equipment: {
          create: eqIds.map((id) => ({ equipmentId: id })),
        },
      },
    })

    revalidatePath("/painel")
    revalidatePath("/anuncios")
    revalidateTag("listings", "max")
    redirect(`/painel/anuncios/${listing.id}/editar?created=1`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, errors: { _form: ["Erro ao criar anúncio"] }, values }
  }
}

export async function updateListing(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const values = echoFormValues(formData)
  const session = await getActiveClinicSession()
  if (!session?.user?.clinicId) {
    return { success: false, errors: { _form: ["Não autorizado"] }, values }
  }

  const id = formData.get("id") as string
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true, status: true, slug: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId) {
    return { success: false, errors: { _form: ["Anúncio não encontrado"] }, values }
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
      roomTypeId: formData.get("roomTypeId") || undefined,
      allSpecialties: formData.get("allSpecialties") === "true",
      specialtyIds: formData.getAll("specialtyIds").length > 0
        ? formData.getAll("specialtyIds")
        : undefined,
      equipmentIds: formData.getAll("equipmentIds").length > 0
        ? formData.getAll("equipmentIds")
        : undefined,
      customSpecialties: formData.get("customSpecialties") ?? undefined,
      customEquipment: formData.get("customEquipment") ?? undefined,
      requiresRqe: formData.get("requiresRqe") === "true",
    }

    const parsed = updateListingSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        values,
      }
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data
    // Com "todas as especialidades" a marcação individual é limpa; sem a flag,
    // undefined preserva as especialidades existentes (comportamento atual).
    const specIds = data.allSpecialties
      ? []
      : specialtyIds
        ? await validSpecialtyIds(specialtyIds)
        : undefined
    const eqIds = equipmentIds ? await validEquipmentIds(equipmentIds) : undefined

    // Anti bait-and-switch: editar um anúncio já PUBLICADO o devolve para a
    // fila de revisão (PENDING) — o conteúdo aprovado não pode ser trocado
    // sem nova moderação. Demais estados não mudam por uma edição do dono.
    const reReview =
      listing.status === "PUBLISHED"
        ? { status: "PENDING" as const, reviewedAt: null }
        : {}

    await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        ...reReview,
        ...(specIds && {
          specialties: {
            deleteMany: {},
            create: specIds.map((sid) => ({ specialtyId: sid })),
          },
        }),
        ...(eqIds && {
          equipment: {
            deleteMany: {},
            create: eqIds.map((eid) => ({ equipmentId: eid })),
          },
        }),
      },
    })

    revalidatePath("/painel")
    revalidatePath("/anuncios")
    revalidatePath(`/anuncios/${listing.slug}`)
    revalidateTag("listings", "max")
    return { success: true, demoted: listing.status === "PUBLISHED" }
  } catch (error) {
    console.error("[updateListing] falhou:", error)
    return { success: false, errors: { _form: ["Erro ao atualizar anúncio"] }, values }
  }
}

export async function deleteListing(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user?.clinicId) {
    throw new Error("Não autorizado")
  }

  const id = formData.get("id") as string
  if (!id) throw new Error("ID não fornecido")

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true, slug: true },
  })

  if (!listing || listing.clinicId !== session.user.clinicId) {
    throw new Error("Anúncio não encontrado")
  }

  // Antes do delete: depois dele o pedido perde o vínculo (SetNull) e a
  // cobrança continuaria pagável no Asaas para um anúncio que não existe mais.
  await cancelarPedidosPendentes({ listingId: id })
  await prisma.listing.delete({ where: { id } })
  revalidatePath("/painel")
  revalidatePath("/anuncios")
  revalidatePath(`/anuncios/${listing.slug}`)
  revalidateTag("listings", "max")
  // Leave the now-deleted listing's edit page back to the panel with a success
  // flag — otherwise the edit route 404s (the listing no longer exists).
  redirect("/painel?excluido=1")
}

export async function publishListing(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getActiveClinicSession()
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

  // O dono envia para revisão; quem publica (PUBLISHED) é só o admin.
  if (listing.status !== "DRAFT" && listing.status !== "REJECTED") {
    return {
      success: false,
      errors: {
        _form: [
          listing.status === "PENDING"
            ? "Este anúncio já está em análise. Não é preciso enviá-lo de novo."
            : "Este anúncio já está publicado.",
        ],
      },
    }
  }

  if (listing.images.length === 0) {
    return {
      success: false,
      errors: { _form: ["Adicione pelo menos 1 foto antes de enviar para revisão: anúncios sem foto não são aprovados."] },
    }
  }

  if (!listing.allSpecialties && listing.specialties.length === 0) {
    return {
      success: false,
      errors: { _form: ["Selecione pelo menos 1 especialidade ou marque “Atende todas as especialidades”"] },
    }
  }

  await prisma.listing.update({
    where: { id },
    data: { status: "PENDING", reviewedAt: null },
  })

  revalidatePath("/painel")
  revalidatePath("/anuncios")
  revalidatePath(`/anuncios/${listing.slug}`)
  revalidateTag("listings", "max")
  return { success: true }
}
