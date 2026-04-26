export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { approveListing, rejectListing, archiveListing, toggleFeatured, markReviewed } from "../actions"
import { DeleteListingButton } from "@/components/anuncios/DeleteListingButton"
import { AdminListingsSearch } from "@/components/anuncios/AdminListingsSearch"
import { CheckCircle, XCircle, Archive, RotateCcw, Pencil, Star, Eye } from "lucide-react"

const PAGE_SIZE = 20

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  PENDING: { label: "Pendente", variant: "warning" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "destructive" },
  ARCHIVED: { label: "Arquivado", variant: "outline" },
}

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    review?: string
    q?: string
    page?: string
  }>
}) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const VALID_STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"]
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const where: Record<string, unknown> = {}
  if (params.status && VALID_STATUSES.includes(params.status)) where.status = params.status
  if (params.review === "pending") where.reviewedAt = null

  const q = (params.q ?? "").trim()
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { neighborhood: { contains: q, mode: "insensitive" } },
      { clinic: { name: { contains: q, mode: "insensitive" } } },
    ]
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        clinic: { select: { name: true } },
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
        _count: { select: { specialties: true, images: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Helper to build pagination links preserving current filters
  function pageHref(p: number): string {
    const sp = new URLSearchParams()
    if (params.status) sp.set("status", params.status)
    if (params.review) sp.set("review", params.review)
    if (q) sp.set("q", q)
    sp.set("page", String(p))
    return `/admin/anuncios?${sp.toString()}`
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Moderação de Anúncios</h1>
      <p className="text-muted-foreground">
        {total} anúncio(s) encontrado(s)
        {totalPages > 1 && ` · página ${page} de ${totalPages}`}
      </p>

      <div className="mt-4">
        <AdminListingsSearch />
      </div>

      {/* Status filter tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {["", "PENDING", "PUBLISHED", "REJECTED", "DRAFT", "ARCHIVED"].map(
          (s) => (
            <a
              key={s}
              href={s ? `/admin/anuncios?status=${s}` : "/admin/anuncios"}
              className={`rounded-md px-3 py-1 text-sm ${
                (params.status ?? "") === s && !params.review
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {s ? statusConfig[s]?.label || s : "Todos"}
            </a>
          )
        )}
        <a
          href="/admin/anuncios?review=pending"
          className={`rounded-md px-3 py-1 text-sm ${
            params.review === "pending"
              ? "bg-amber-500 text-white"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
          }`}
        >
          Não revisados
        </a>
      </div>

      <div className="mt-6 space-y-3">
        {listings.map((listing) => {
          const cfg = statusConfig[listing.status]
          return (
            <Card key={listing.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{listing.title}</h3>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {!listing.reviewedAt && (
                      <Badge variant="warning" className="border-amber-300 bg-amber-100 text-amber-800">
                        Não revisado
                      </Badge>
                    )}
                    {listing.featured && <Badge variant="default" className="bg-gold text-navy">Destaque</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {listing.clinic.name} &middot; {listing.city},{" "}
                    {listing.neighborhood} &middot; {listing._count.images}{" "}
                    fotos
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={listing.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant={listing.featured ? "default" : "ghost"}
                      className="gap-1"
                      title={listing.featured ? "Remover destaque" : "Destacar"}
                    >
                      <Star className={`h-3.5 w-3.5 ${listing.featured ? "fill-current" : ""}`} />
                    </Button>
                  </form>
                  {!listing.reviewedAt && (
                    <form action={markReviewed}>
                      <input type="hidden" name="id" value={listing.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        title="Marcar como revisado"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Revisado
                      </Button>
                    </form>
                  )}
                  <Link href={`/admin/anuncios/${listing.id}/editar`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </Link>
                  {listing.status === "PENDING" && (
                    <>
                      <form action={approveListing}>
                        <input type="hidden" name="id" value={listing.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="default"
                          className="gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Aprovar
                        </Button>
                      </form>
                      <form action={rejectListing}>
                        <input type="hidden" name="id" value={listing.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rejeitar
                        </Button>
                      </form>
                    </>
                  )}
                  {listing.status === "PUBLISHED" && (
                    <form action={archiveListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Arquivar
                      </Button>
                    </form>
                  )}
                  {(listing.status === "ARCHIVED" || listing.status === "REJECTED" || listing.status === "DRAFT") && (
                    <form action={approveListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="default"
                        className="gap-1"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Publicar
                      </Button>
                    </form>
                  )}
                  <DeleteListingButton id={listing.id} title={listing.title} />
                </div>
              </CardContent>
            </Card>
          )
        })}
        {listings.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhum anúncio encontrado.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={pageHref(page - 1)}>
              <Button variant="outline" size="sm">
                Anterior
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)}>
              <Button variant="outline" size="sm">
                Próxima
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Próxima
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
