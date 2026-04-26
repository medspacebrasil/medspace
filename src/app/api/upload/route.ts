import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase/client"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES_PER_LISTING = 10

export async function POST(request: Request) {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"

  if (!session?.user || (!isAdmin && !session.user.clinicId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const listingId = formData.get("listingId") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não aceito. Envie um arquivo JPEG, PNG ou WebP." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / 1024 / 1024).toFixed(1)
      return NextResponse.json(
        { error: `Arquivo muito grande (${sizeMb}MB). O tamanho máximo é 5MB.` },
        { status: 413 }
      )
    }

    // Resolve the clinic id used for the storage path
    let storageClinicId = session.user.clinicId ?? null

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { clinicId: true, _count: { select: { images: true } } },
      })

      if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 })
      }

      if (!isAdmin && listing.clinicId !== session.user.clinicId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (listing._count.images >= MAX_IMAGES_PER_LISTING) {
        return NextResponse.json(
          {
            error: `Limite de ${MAX_IMAGES_PER_LISTING} fotos por anúncio atingido.`,
          },
          { status: 400 }
        )
      }

      // Admin uploading on behalf of a clinic: use that clinic's id for storage path
      storageClinicId = listing.clinicId
    }

    if (!storageClinicId) {
      return NextResponse.json(
        { error: "Listing is required for admin uploads" },
        { status: 400 }
      )
    }

    const MIME_TO_EXT: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }
    const ext = MIME_TO_EXT[file.type] ?? "jpg"
    const fileName = `${storageClinicId}/${crypto.randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabase = getSupabaseAdmin()

    const { error: uploadError } = await supabase.storage
      .from("listings")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("listings").getPublicUrl(fileName)

    let imageRecord = null
    if (listingId) {
      const maxOrder = await prisma.listingImage.aggregate({
        where: { listingId },
        _max: { order: true },
      })

      imageRecord = await prisma.listingImage.create({
        data: {
          listingId,
          url: publicUrl,
          order: (maxOrder._max.order ?? -1) + 1,
        },
      })
    }

    if (listingId) revalidateTag("listings")

    return NextResponse.json(
      { url: publicUrl, id: imageRecord?.id },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
