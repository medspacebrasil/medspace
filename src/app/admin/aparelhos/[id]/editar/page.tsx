export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AdminEditAparelhoClient } from "./AdminEditAparelhoClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditarAparelhoPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      clinic: { select: { name: true } },
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
    },
  })

  if (!listing || listing.type !== "EQUIPMENT") notFound()

  const categories = await prisma.equipmentCategory.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <AdminEditAparelhoClient
      listing={listing}
      clinicName={listing.clinic.name}
      categories={categories}
    />
  )
}
