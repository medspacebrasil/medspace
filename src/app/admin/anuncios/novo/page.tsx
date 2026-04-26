export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AdminNewListingClient } from "./AdminNewListingClient"

interface PageProps {
  searchParams: Promise<{ clinicId?: string }>
}

export default async function AdminNovoAnuncioPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const { clinicId } = await searchParams
  if (!clinicId) {
    redirect("/admin/clinicas")
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!clinic) notFound()

  const [specialties, roomTypes, equipment] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      <Link href="/admin/clinicas">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para clínicas
        </Button>
      </Link>

      <div className="mt-2">
        <h1 className="text-2xl font-bold">Novo Anúncio (Admin)</h1>
        <p className="text-sm text-muted-foreground">
          Criando em nome de:{" "}
          <strong>{clinic.name}</strong> &middot; {clinic.user.name} (
          {clinic.user.email})
        </p>
      </div>

      <div className="mt-6">
        <AdminNewListingClient
          clinicId={clinic.id}
          defaultCity={clinic.city}
          defaultState={clinic.state}
          defaultNeighborhood={clinic.neighborhood}
          defaultWhatsapp={clinic.whatsapp}
          specialties={specialties}
          roomTypes={roomTypes}
          equipment={equipment}
        />
      </div>
    </div>
  )
}
