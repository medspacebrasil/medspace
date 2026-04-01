import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod/v4"

const statusSchema = z.object({
  status: z.enum(["PUBLISHED", "REJECTED", "ARCHIVED"]),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params

  try {
    const body = await request.json()
    const parsed = statusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
