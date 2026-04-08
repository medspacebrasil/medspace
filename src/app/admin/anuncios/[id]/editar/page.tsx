export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AdminEditListingClient } from "./AdminEditListingClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditarAnuncioPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      clinic: { select: { name: true } },
      specialties: true,
      equipment: true,
      images: { orderBy: { order: "asc" } },
    },
  })

  if (!listing) notFound()

  const [specialties, roomTypes, equipmentList] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <AdminEditListingClient
      listing={listing}
      clinicName={listing.clinic.name}
      specialties={specialties}
      roomTypes={roomTypes}
      equipment={equipmentList}
    />
  )
}
