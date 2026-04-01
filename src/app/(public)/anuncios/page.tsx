import { Suspense } from "react"
import { prisma } from "@/lib/db"
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
  const where: Record<string, unknown> = { status: "PUBLISHED" as const }
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
    where.equipment = {
      some: { equipment: { slug: params.equipment } },
    }
  }

  const [listings, total, specialties, roomTypes, equipmentList, cities] =
    await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          clinic: true,
          roomType: true,
          specialties: { include: { specialty: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
        },
        orderBy: {
          createdAt: params.sort === "oldest" ? "asc" : "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
      prisma.specialty.findMany({ orderBy: { name: "asc" } }),
      prisma.roomType.findMany({ orderBy: { name: "asc" } }),
      prisma.equipment.findMany({ orderBy: { name: "asc" } }),
      prisma.listing
        .findMany({
          where: { status: "PUBLISHED" },
          select: { city: true },
          distinct: ["city"],
          orderBy: { city: "asc" },
        })
        .then((rows) => rows.map((r) => r.city)),
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
            cities={cities}
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
