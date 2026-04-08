import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { createListingSchema } from "@/lib/validators"
import { generateSlug } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20))
  const city = searchParams.get("city")
  const neighborhood = searchParams.get("neighborhood")
  const specialty = searchParams.get("specialty")
  const roomType = searchParams.get("roomType")
  const equipment = searchParams.get("equipment")
  const sort = searchParams.get("sort")

  const where: Record<string, unknown> = { status: "PUBLISHED" as const }
  if (city) where.city = city
  if (neighborhood) where.neighborhood = neighborhood
  if (specialty) {
    where.specialties = { some: { specialty: { slug: specialty } } }
  }
  if (roomType) {
    where.roomType = { slug: roomType }
  }
  if (equipment) {
    where.equipment = { some: { equipment: { slug: equipment } } }
  }

  const [data, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        clinic: { select: { name: true } },
        roomType: { select: { name: true, slug: true } },
        specialties: {
          include: { specialty: { select: { name: true, slug: true } } },
        },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ])

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createListingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data

    // Generate unique slug with random suffix to avoid race conditions
    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    const existing = await prisma.listing.findUnique({ where: { slug } })
    if (existing) {
      slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
    }

    const listing = await prisma.listing.create({
      data: {
        ...data,
        slug,
        clinicId: session.user.clinicId,
        specialties: {
          create: specialtyIds.map((id) => ({ specialtyId: id })),
        },
        equipment: {
          create: equipmentIds.map((id) => ({ equipmentId: id })),
        },
      },
      include: {
        specialties: { include: { specialty: true } },
        equipment: { include: { equipment: true } },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
