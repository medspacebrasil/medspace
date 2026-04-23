import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getSupabaseAdmin } from "@/lib/supabase/client"

interface RouteContext {
  params: Promise<{ id: string }>
}

function storagePathFromPublicUrl(url: string): string | null {
  // URL format: https://<project>.supabase.co/storage/v1/object/public/listings/<path>
  const marker = "/storage/v1/object/public/listings/"
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"

  if (!session?.user || (!isAdmin && !session.user.clinicId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 })
  }

  const image = await prisma.listingImage.findUnique({
    where: { id },
    include: { listing: { select: { clinicId: true } } },
  })

  if (!image || (!isAdmin && image.listing.clinicId !== session.user.clinicId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Try to remove the file from Supabase Storage; don't fail the request if it doesn't exist anymore
  const storagePath = storagePathFromPublicUrl(image.url)
  if (storagePath) {
    const supabase = getSupabaseAdmin()
    await supabase.storage.from("listings").remove([storagePath])
  }

  const wasCover = image.isCover
  const { listingId } = image

  await prisma.listingImage.delete({ where: { id } })

  // If we deleted the cover, promote the first remaining image
  if (wasCover) {
    const next = await prisma.listingImage.findFirst({
      where: { listingId },
      orderBy: { order: "asc" },
    })
    if (next) {
      await prisma.listingImage.update({
        where: { id: next.id },
        data: { isCover: true },
      })
    }
  }

  return NextResponse.json({ success: true })
}
