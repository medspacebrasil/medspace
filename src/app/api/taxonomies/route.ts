import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const [specialties, roomTypes, equipment] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
  ])

  return NextResponse.json({ specialties, roomTypes, equipment })
}
