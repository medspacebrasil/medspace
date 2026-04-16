export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { WhatsAppButton } from "@/components/anuncios/WhatsAppButton"
import { MapPin, Wrench, Phone } from "lucide-react"
import { formatPhone } from "@/lib/utils"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const listing = await prisma.listing.findFirst({
    where: { slug, status: "PUBLISHED", type: "EQUIPMENT" },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
  })

  if (!listing) return { title: "Aparelho não encontrado" }

  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.images[0]?.url ? [listing.images[0].url] : [],
    },
  }
}

function conditionLabel(c: string | null) {
  switch (c) {
    case "NOVO":
      return "Novo"
    case "SEMINOVO":
      return "Seminovo"
    case "USADO":
      return "Usado"
    default:
      return null
  }
}

export default async function AparelhoDetailPage({ params }: PageProps) {
  const { slug } = await params

  const listing = await prisma.listing.findFirst({
    where: { slug, status: "PUBLISHED", type: "EQUIPMENT" },
    include: {
      clinic: true,
      equipmentCategory: true,
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
    },
  })

  if (!listing) notFound()

  const condLabel = conditionLabel(listing.condition)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {listing.images.length > 0 ? (
            <div className="grid gap-2">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={listing.images[0].url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-md"
                    >
                      <Image
                        src={img.url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
              <Wrench className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}

          <h1 className="mt-6 text-2xl font-bold md:text-3xl">{listing.title}</h1>

          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {listing.neighborhood}, {listing.city}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {listing.equipmentCategory && (
              <Badge variant="secondary">{listing.equipmentCategory.name}</Badge>
            )}
            {condLabel && <Badge variant="outline">{condLabel}</Badge>}
            {listing.brand && <Badge variant="outline">{listing.brand}</Badge>}
            {listing.model && <Badge variant="outline">{listing.model}</Badge>}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Descrição</h2>
            <p className="mt-2 text-muted-foreground">{listing.description}</p>
            {listing.fullDescription && (
              <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
                {listing.fullDescription}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4 rounded-lg border bg-card p-6">
            <h3 className="font-semibold">{listing.clinic.name}</h3>
            {listing.clinic.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {formatPhone(listing.clinic.phone)}
              </div>
            )}
            <WhatsAppButton phone={listing.whatsapp} />
            <p className="text-center text-xs text-muted-foreground">
              Contato direto via WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
