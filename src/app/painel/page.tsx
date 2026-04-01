import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, FileText, Eye, Clock } from "lucide-react"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  PENDING: { label: "Pendente", variant: "warning" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "destructive" },
  ARCHIVED: { label: "Arquivado", variant: "outline" },
}

export default async function PainelPage() {
  const session = await auth()

  const listings = await prisma.listing.findMany({
    where: { clinicId: session!.user.clinicId! },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { images: true, specialties: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const counts = {
    total: listings.length,
    published: listings.filter((l) => l.status === "PUBLISHED").length,
    pending: listings.filter((l) => l.status === "PENDING").length,
    draft: listings.filter((l) => l.status === "DRAFT").length,
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Anúncios</h1>
          <p className="text-muted-foreground">
            Gerencie os anúncios da sua clínica
          </p>
        </div>
        <Link href="/painel/anuncios/novo">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Novo Anúncio
          </Button>
        </Link>
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
              <p className="text-sm text-muted-foreground">Pendentes</p>
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

      {/* Listings table */}
      <div className="mt-8">
        {listings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                Você ainda não criou nenhum anúncio.
              </p>
              <Link href="/painel/anuncios/novo">
                <Button className="mt-4 gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Criar Primeiro Anúncio
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => {
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
                        {listing._count.images} fotos &middot;{" "}
                        {listing._count.specialties} especialidades
                      </p>
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
    </div>
  )
}
