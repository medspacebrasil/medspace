import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase/client"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES_PER_LISTING = 10

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const listingId = formData.get("listingId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum: 5MB" },
        { status: 413 }
      )
    }

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { clinicId: true, _count: { select: { images: true } } },
      })

      if (!listing || listing.clinicId !== session.user.clinicId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (listing._count.images >= MAX_IMAGES_PER_LISTING) {
        return NextResponse.json(
          { error: `Maximum ${MAX_IMAGES_PER_LISTING} images per listing` },
          { status: 400 }
        )
      }
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const fileName = `${session.user.clinicId}/${Date.now()}.${ext}`
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

    return NextResponse.json(
      { url: publicUrl, id: imageRecord?.id },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
