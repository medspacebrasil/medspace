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
  const firstImage = [...listing.images].sort((a, b) => a.order - b.order)[0]

  return (
    <Link href={`/anuncios/${listing.slug}`}>
      <Card className="group overflow-hidden border-border/50 transition-all hover:border-gold/30 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-warm-gray">
              <Building2 className="h-10 w-10 text-muted-foreground/30" />
              <span className="text-xs text-muted-foreground/40">Sem foto</span>
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
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {listing.neighborhood}, {listing.city}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {listing.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {listing.roomType && (
              <Badge className="bg-gold/10 text-gold-dark border-0 text-xs">
                {listing.roomType.name}
              </Badge>
            )}
            {listing.specialties.slice(0, 2).map((ls) => (
              <Badge key={ls.specialty.name} variant="outline" className="text-xs">
                {ls.specialty.name}
              </Badge>
            ))}
            {listing.specialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{listing.specialties.length - 2}
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
}
