import { Suspense } from "react"
import {
  getCachedClinicListingsCount,
  getCachedClinicListingsPage,
  getCachedEquipment,
  getCachedPublishedClinicCities,
  getCachedRoomTypes,
  getCachedSpecialties,
} from "@/lib/cache"
import { ListingCard } from "@/components/anuncios/ListingCard"
import { ListingFilters } from "@/components/anuncios/ListingFilters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Encontrar Salas",
  description:
    "Busque salas médicas disponíveis por cidade, especialidade e tipo de equipamento.",
}

interface PageProps {
  searchParams: Promise<{
    state?: string
    city?: string
    specialty?: string
    roomType?: string
    equipment?: string
    page?: string
    sort?: string
  }>
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const limit = 20

  // Build where clause
  const where: Record<string, unknown> = {
    status: "PUBLISHED" as const,
    type: "CLINIC" as const,
  }
  if (params.state) where.state = params.state
  if (params.city) where.city = params.city
  if (params.specialty) {
    where.specialties = {
      some: { specialty: { slug: params.specialty } },
    }
  }
  if (params.roomType) {
    where.roomType = { slug: params.roomType }
  }
  if (params.equipment) {
    const equipmentSlugs = params.equipment.split(",").filter(Boolean)
    if (equipmentSlugs.length > 0) {
      where.AND = equipmentSlugs.map((slug) => ({
        equipment: { some: { equipment: { slug } } },
      }))
    }
  }

  const sort: "recent" | "oldest" = params.sort === "oldest" ? "oldest" : "recent"

  const [listings, total, specialties, roomTypes, equipmentList, cities] =
    await Promise.all([
      getCachedClinicListingsPage(where, sort, (page - 1) * limit, limit),
      getCachedClinicListingsCount(where),
      getCachedSpecialties(),
      getCachedRoomTypes(),
      getCachedEquipment(),
      getCachedPublishedClinicCities(),
    ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Encontrar Salas</h1>
      <p className="mt-1 text-muted-foreground">
        {total} {total === 1 ? "espaço disponível" : "espaços disponíveis"}
      </p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <ListingFilters
            specialties={specialties}
            roomTypes={roomTypes}
            equipment={equipmentList}
            states={Object.entries(
              cities.reduce<Record<string, string[]>>((acc, c) => {
                const st = c.state || "Outros"
                if (!acc[st]) acc[st] = []
                if (!acc[st].includes(c.city)) acc[st].push(c.city)
                return acc
              }, {})
            )
              .map(([state, stateCities]) => ({ state, cities: stateCities.sort() }))
              .sort((a, b) => a.state.localeCompare(b.state))}
          />
        </Suspense>
      </div>

      {listings.length > 0 ? (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/anuncios?${new URLSearchParams({
                    ...params,
                    page: String(page - 1),
                  }).toString()}`}
                >
                  <Button variant="outline" size="sm">
                    Anterior
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/anuncios?${new URLSearchParams({
                    ...params,
                    page: String(page + 1),
                  }).toString()}`}
                >
                  <Button variant="outline" size="sm">
                    Próxima
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">
            Nenhum espaço encontrado com esses filtros.
          </p>
          <Link href="/anuncios">
            <Button variant="outline" className="mt-4">
              Limpar filtros
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
