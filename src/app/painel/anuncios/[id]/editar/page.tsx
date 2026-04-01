import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { EditListingClient } from "./EditListingClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAnuncioPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      specialties: true,
      equipment: true,
      images: { orderBy: { order: "asc" } },
    },
  })

  if (!listing || listing.clinicId !== session!.user.clinicId) {
    notFound()
  }

  const [specialties, roomTypes, equipmentList] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <EditListingClient
      listing={listing}
      specialties={specialties}
      roomTypes={roomTypes}
      equipment={equipmentList}
    />
  )
}
