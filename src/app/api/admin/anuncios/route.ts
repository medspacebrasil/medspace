import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const listings = await prisma.listing.findMany({
    where,
    include: {
      clinic: { select: { name: true } },
      roomType: { select: { name: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(listings)
}
