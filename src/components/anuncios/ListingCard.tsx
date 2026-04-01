import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2 } from "lucide-react"

interface ListingCardProps {
  listing: {
    id: string
    title: string
    slug: string
    description: string
    city: string
    neighborhood: string
    roomType?: { name: string } | null
    specialties: { specialty: { name: string } }[]
    images: { url: string; order: number }[]
    clinic: { name: string }
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const firstImage = listing.images.sort((a, b) => a.order - b.order)[0]

  return (
    <Link href={`/anuncios/${listing.slug}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{listing.title}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {listing.neighborhood}, {listing.city}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {listing.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {listing.roomType && (
              <Badge variant="secondary">{listing.roomType.name}</Badge>
            )}
            {listing.specialties.slice(0, 2).map((ls) => (
              <Badge key={ls.specialty.name} variant="outline">
                {ls.specialty.name}
              </Badge>
            ))}
            {listing.specialties.length > 2 && (
              <Badge variant="outline">+{listing.specialties.length - 2}</Badge>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {listing.clinic.name}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
