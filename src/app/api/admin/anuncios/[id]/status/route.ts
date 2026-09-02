import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod/v4"

const statusSchema = z.object({
  status: z.enum(["PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"]),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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

    // Publicação por esta rota também registra a primeira ida ao ar, para o
    // anúncio não ser cobrado numa re-aprovação futura. Uma escrita só: o
    // carimbo sai no mesmo commit e a resposta reflete o que foi gravado.
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status === "PUBLISHED" && !listing.firstPublishedAt
          ? { firstPublishedAt: new Date() }
          : {}),
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
