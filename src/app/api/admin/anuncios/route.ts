import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const VALID_STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"]

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status && VALID_STATUSES.includes(status)) where.status = status

  // Limite de segurança contra payload ilimitado (DoS por consumo). Paginação
  // opcional via ?page e ?limit (máx. 200 por página).
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 200))
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const listings = await prisma.listing.findMany({
    where,
    include: {
      clinic: { select: { name: true } },
      roomType: { select: { name: true } },
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  })

  return NextResponse.json(listings)
}
