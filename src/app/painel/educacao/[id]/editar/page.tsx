export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { EditEducacaoClient } from "./EditEducacaoClient"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

export default async function EditarEducacaoPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { created } = await searchParams
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
    listing.type !== "EDUCATION"
  ) {
    notFound()
  }

  return <EditEducacaoClient listing={listing} justCreated={created === "1"} />
}
