export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Building2, Wrench, GraduationCap } from "lucide-react"
import { AdminNewListingClient } from "./AdminNewListingClient"
import { AdminNewAparelhoClient } from "./AdminNewAparelhoClient"
import { AdminNewEducacaoClient } from "./AdminNewEducacaoClient"

interface PageProps {
  searchParams: Promise<{ clinicId?: string; tipo?: string }>
}

const TIPOS = [
  {
    value: "clinica",
    label: "Anúncio de Clínica",
    description: "Sala ou espaço para atendimento.",
    icon: Building2,
  },
  {
    value: "aparelho",
    label: "Aparelho",
    description: "Equipamento médico disponível.",
    icon: Wrench,
  },
  {
    value: "educacao",
    label: "Mentoria / Educação",
    description: "Curso, mentoria ou pós-graduação.",
    icon: GraduationCap,
  },
] as const

export default async function AdminNovoAnuncioPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const { clinicId, tipo } = await searchParams
  if (!clinicId) {
    redirect("/admin/clinicas")
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!clinic) notFound()

  const header = (
    <>
      <Link href="/admin/clinicas">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para cadastros
        </Button>
      </Link>
      <div className="mt-2">
        <h1 className="text-2xl font-bold">Novo Anúncio (Admin)</h1>
        <p className="text-sm text-muted-foreground">
          Criando em nome de: <strong>{clinic.name}</strong> &middot;{" "}
          {clinic.user.name} ({clinic.user.email})
        </p>
      </div>
    </>
  )

  // Step 1: choose the category.
  if (!tipo) {
    return (
      <div>
        {header}
        <p className="mt-6 text-sm font-medium">O que você quer anunciar?</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {TIPOS.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.value}
                href={`/admin/anuncios/novo?clinicId=${clinic.id}&tipo=${t.value}`}
              >
                <Card className="h-full transition-colors hover:border-gold/60">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Step 2: render the chosen form.
  if (tipo === "aparelho") {
    const categories = await prisma.equipmentCategory.findMany({
      orderBy: { name: "asc" },
    })
    return (
      <div>
        {header}
        <div className="mt-6">
          <AdminNewAparelhoClient
            clinicId={clinic.id}
            defaultCity={clinic.city}
            defaultNeighborhood={clinic.neighborhood}
            defaultWhatsapp={clinic.whatsapp}
            categories={categories}
          />
        </div>
      </div>
    )
  }

  if (tipo === "educacao") {
    return (
      <div>
        {header}
        <div className="mt-6">
          <AdminNewEducacaoClient
            clinicId={clinic.id}
            defaultCity={clinic.city}
            defaultState={clinic.state}
            defaultWhatsapp={clinic.whatsapp}
          />
        </div>
      </div>
    )
  }

  // Default: clinic listing.
  const [specialties, roomTypes, equipment] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.roomType.findMany({ orderBy: { name: "asc" } }),
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div>
      {header}
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
