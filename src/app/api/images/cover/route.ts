import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { imageId } = (await request.json()) as { imageId?: string }
  if (!imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 })
  }

  const image = await prisma.listingImage.findUnique({
    where: { id: imageId },
    include: { listing: { select: { clinicId: true } } },
  })

  if (!image || image.listing.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.listingImage.updateMany({
      where: { listingId: image.listingId },
      data: { isCover: false },
    }),
    prisma.listingImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ])

  return NextResponse.json({ success: true })
}
