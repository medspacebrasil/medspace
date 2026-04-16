export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { EditAparelhoClient } from "./EditAparelhoClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAparelhoPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
    },
  })

  if (
    !listing ||
    listing.clinicId !== session!.user.clinicId ||
    listing.type !== "EQUIPMENT"
  ) {
    notFound()
  }

  const categories = await prisma.equipmentCategory.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <EditAparelhoClient listing={listing} categories={categories} />
  )
}
