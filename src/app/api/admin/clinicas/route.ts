import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const clinics = await prisma.clinic.findMany({
    include: {
      user: { select: { email: true, role: true } },
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clinics)
}
