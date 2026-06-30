export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AdminEditEducacaoClient } from "./AdminEditEducacaoClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditarEducacaoPage({ params }: PageProps) {
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

  if (!listing || listing.type !== "EDUCATION") notFound()

  return (
    <AdminEditEducacaoClient listing={listing} clinicName={listing.clinic.name} />
  )
}
