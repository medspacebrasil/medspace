import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const clinics = await prisma.clinic.findMany({
    include: {
      user: { select: { email: true, role: true } },
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clinics)
}
