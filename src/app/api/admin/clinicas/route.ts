import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Limite de segurança contra payload ilimitado. Paginação opcional via ?page/?limit.
  const { searchParams } = new URL(request.url)
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 200))
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const clinics = await prisma.clinic.findMany({
    include: {
      user: { select: { email: true, role: true } },
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  })

  return NextResponse.json(clinics)
}
