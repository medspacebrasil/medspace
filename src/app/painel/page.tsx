export const dynamic = "force-dynamic"

import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WelcomeModal } from "@/components/WelcomeModal"
import { EquipmentMigrationNotice } from "@/components/EquipmentMigrationNotice"
import { PlanStatusBanner } from "@/components/PlanStatusBanner"
import { ListingInterest } from "@/components/anuncios/ListingInterest"
import { listingMetricsSince } from "@/lib/metrics"
import {
  PlusCircle,
  FileText,
  Eye,
  Clock,
  Building2,
  Wrench,
  GraduationCap,
} from "lucide-react"

const statusLabels: Record<
  string,
  {
    label: string
    variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
  }
> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  PENDING: { label: "Em análise", variant: "warning" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "destructive" },
  ARCHIVED: { label: "Arquivado", variant: "outline" },
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; excluido?: string }>
}) {
  const sp = await searchParams
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.clinicId) {
    if (session.user.role === "ADMIN") {
      redirect("/admin")
    }
    redirect("/login")
  }

  const listings = await prisma.listing.findMany({
    where: { clinicId: session.user.clinicId },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
      _count: { select: { images: true, specialties: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const clinicListings = listings.filter((l) => l.type === "CLINIC")
  const equipmentListings = listings.filter((l) => l.type === "EQUIPMENT")
  const educationListings = listings.filter((l) => l.type === "EDUCATION")

  // Show migration notice only to clinics with CLINIC listings created BEFORE
  // the taxonomy migration (2026-05-10, same date as the notice storage key) —
  // accounts created after never saw the old resource list, so the blocking
  // modal is pure noise for them. Equipment listings don't use this taxonomy.
  const EQUIPMENT_TAXONOMY_MIGRATION = new Date("2026-05-10")
  const showMigrationNotice = clinicListings.some(
    (l) => l.createdAt < EQUIPMENT_TAXONOMY_MIGRATION
  )

  const counts = {
    total: listings.length,
    published: listings.filter((l) => l.status === "PUBLISHED").length,
    pending: listings.filter((l) => l.status === "PENDING").length,
    draft: listings.filter((l) => l.status === "DRAFT").length,
  }

  // Interesse dos últimos 30 dias por anúncio. Vale para todos os planos,
  // inclusive o gratuito: é o número que mostra ao anunciante o que ele já
  // recebe da plataforma.
  const metrics = await listingMetricsSince(
    listings.map((l) => l.id),
    30
  )

  return (
    <div>
      {sp.welcome === "1" && <WelcomeModal />}
      {showMigrationNotice && <EquipmentMigrationNotice />}
      <PlanStatusBanner />
      {sp.excluido === "1" && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Anúncio excluído.
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">Meus Anúncios</h1>
        <p className="text-muted-foreground">
          Gerencie anúncios de clínicas, aparelhos e educação médica.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{counts.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Eye className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{counts.published}</p>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{counts.pending}</p>
              <p className="text-sm text-muted-foreground">Em análise</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <FileText className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold">{counts.draft}</p>
              <p className="text-sm text-muted-foreground">Rascunhos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clínicas */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-bold">Clínicas</h2>
            <Badge variant="secondary">{clinicListings.length}</Badge>
          </div>
          <Link href="/painel/anuncios/novo">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Anúncio de Clínica
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          {clinicListings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum anúncio de clínica ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clinicListings.map((listing) => {
                const status = statusLabels[listing.status]
                return (
                  <Card key={listing.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{listing.title}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {listing.city}, {listing.neighborhood} &middot;{" "}
                          {listing._count.images} {listing._count.images === 1 ? "foto" : "fotos"} &middot;{" "}
                          {listing.allSpecialties
                            ? "Todas as especialidades"
                            : `${listing._count.specialties} ${listing._count.specialties === 1 ? "especialidade" : "especialidades"}`}
                        </p>
                        <ListingInterest
                          metrics={metrics.get(listing.id)}
                          published={listing.status === "PUBLISHED"}
                        />
                      </div>
                      <Link href={`/painel/anuncios/${listing.id}/editar`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Aparelhos */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-bold">Aparelhos</h2>
            <Badge variant="secondary">{equipmentListings.length}</Badge>
          </div>
          <Link href="/painel/aparelhos/novo">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Aparelho
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          {equipmentListings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum aparelho anunciado ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {equipmentListings.map((listing) => {
                const status = statusLabels[listing.status]
                return (
                  <Card key={listing.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{listing.title}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {listing.city}, {listing.neighborhood} &middot;{" "}
                          {listing._count.images} {listing._count.images === 1 ? "foto" : "fotos"}
                        </p>
                        <ListingInterest
                          metrics={metrics.get(listing.id)}
                          published={listing.status === "PUBLISHED"}
                        />
                      </div>
                      <Link href={`/painel/aparelhos/${listing.id}/editar`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Educação Médica */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-bold">Educação Médica</h2>
            <Badge variant="secondary">{educationListings.length}</Badge>
          </div>
          <Link href="/painel/educacao/novo">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Oportunidade
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          {educationListings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma oportunidade educacional anunciada ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {educationListings.map((listing) => {
                const status = statusLabels[listing.status]
                return (
                  <Card key={listing.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{listing.title}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {listing.city || "Online"} &middot;{" "}
                          {listing._count.images} {listing._count.images === 1 ? "foto" : "fotos"}
                        </p>
                        <ListingInterest
                          metrics={metrics.get(listing.id)}
                          published={listing.status === "PUBLISHED"}
                        />
                      </div>
                      <Link href={`/painel/educacao/${listing.id}/editar`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
