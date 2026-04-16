import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { updateListingSchema } from "@/lib/validators"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params

  const listing = await prisma.listing.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      status: "PUBLISHED",
    },
    include: {
      clinic: { select: { name: true } },
      roomType: true,
      specialties: { include: { specialty: true } },
      equipment: { include: { equipment: true } },
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
    },
  })

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(listing)
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true },
  })

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (listing.clinicId !== session.user.clinicId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = updateListingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { specialtyIds, equipmentIds, ...data } = parsed.data

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        ...(specialtyIds && {
          specialties: {
            deleteMany: {},
            create: specialtyIds.map((sid) => ({ specialtyId: sid })),
          },
        }),
        ...(equipmentIds && {
          equipment: {
            deleteMany: {},
            create: equipmentIds.map((eid) => ({ equipmentId: eid })),
          },
        }),
      },
      include: {
        specialties: { include: { specialty: true } },
        equipment: { include: { equipment: true } },
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.clinicId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { clinicId: true },
  })

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (listing.clinicId !== session.user.clinicId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.listing.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
