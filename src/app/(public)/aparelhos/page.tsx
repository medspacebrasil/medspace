export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Wrench } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aparelhos disponíveis | MedSpace",
  description:
    "Encontre aparelhos médicos disponíveis para locação — direto com a clínica, sem burocracia.",
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    state?: string
    city?: string
    condition?: string
    page?: string
  }>
}

export default async function AparelhosMarketplace({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const limit = 20

  const where: Record<string, unknown> = {
    status: "PUBLISHED" as const,
    type: "EQUIPMENT" as const,
  }
  if (params.state) where.state = params.state
  if (params.city) where.city = params.city
  if (params.category) {
    where.equipmentCategory = { slug: params.category }
  }
  if (params.condition) where.condition = params.condition

  const [listings, total, categories] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        clinic: true,
        equipmentCategory: true,
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
    prisma.equipmentCategory.findMany({ orderBy: { name: "asc" } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Aparelhos Disponíveis</h1>
      <p className="mt-1 text-muted-foreground">
        {total} {total === 1 ? "aparelho disponível" : "aparelhos disponíveis"}
      </p>

      {/* Category filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/aparelhos"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            !params.category
              ? "border-gold bg-gold text-navy"
              : "border-border hover:border-gold/50"
          }`}
        >
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/aparelhos?category=${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              params.category === c.slug
                ? "border-gold bg-gold text-navy"
                : "border-border hover:border-gold/50"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {listings.length > 0 ? (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const img = listing.images[0]
              return (
                <Link key={listing.id} href={`/aparelhos/${listing.slug}`}>
                  <Card className="group overflow-hidden border-border/50 transition-all hover:border-gold/30 hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={listing.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-warm-gray">
                          <Wrench className="h-10 w-10 text-muted-foreground/30" />
                          <span className="text-xs text-muted-foreground/40">
                            Sem foto
                          </span>
                        </div>
                      )}
                      {listing.city && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-navy/80 text-white backdrop-blur-sm text-xs">
                            <MapPin className="mr-1 h-3 w-3" />
                            {listing.city}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-foreground">
                        {listing.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {listing.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {listing.equipmentCategory && (
                          <Badge className="bg-gold/10 text-gold-dark border-0 text-xs">
                            {listing.equipmentCategory.name}
                          </Badge>
                        )}
                        {listing.condition && (
                          <Badge variant="outline" className="text-xs">
                            {conditionLabel(listing.condition)}
                          </Badge>
                        )}
                        {listing.brand && (
                          <Badge variant="outline" className="text-xs">
                            {listing.brand}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {listing.clinic.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/aparelhos?${new URLSearchParams({
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
                  href={`/aparelhos?${new URLSearchParams({
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
            Nenhum aparelho encontrado com esses filtros.
          </p>
          <Link href="/aparelhos">
            <Button variant="outline" className="mt-4">
              Limpar filtros
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function conditionLabel(c: string) {
  switch (c) {
    case "NOVO":
      return "Novo"
    case "SEMINOVO":
      return "Seminovo"
    case "USADO":
      return "Usado"
    default:
      return c
  }
}
