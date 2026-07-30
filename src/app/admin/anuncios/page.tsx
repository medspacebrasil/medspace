export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PendingButton } from "@/components/ui/pending-button"
import { Card, CardContent } from "@/components/ui/card"
import { approveListing, archiveListing, toggleFeatured, markReviewed } from "../actions"
import { DeleteListingButton } from "@/components/anuncios/DeleteListingButton"
import { RejectListingButton } from "@/components/anuncios/RejectListingButton"
import { AdminListingsSearch } from "@/components/anuncios/AdminListingsSearch"
import { formatDocument } from "@/lib/validators/document"
import { CheckCircle, Archive, RotateCcw, Pencil, Star, Eye } from "lucide-react"

const PAGE_SIZE = 20

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Rascunho", variant: "secondary" },
  PENDING: { label: "Pendente", variant: "warning" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  REJECTED: { label: "Rejeitado", variant: "destructive" },
  ARCHIVED: { label: "Arquivado", variant: "outline" },
}

const typeConfig: Record<string, { label: string }> = {
  CLINIC: { label: "Clínica" },
  EQUIPMENT: { label: "Aparelho" },
  EDUCATION: { label: "Educação" },
}

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    type?: string
    review?: string
    q?: string
    page?: string
  }>
}) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const VALID_STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"]
  const VALID_TYPES = ["CLINIC", "EQUIPMENT", "EDUCATION"]
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const where: Record<string, unknown> = {}
  if (params.status && VALID_STATUSES.includes(params.status)) where.status = params.status
  if (params.type && VALID_TYPES.includes(params.type)) where.type = params.type
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

  const [listings, total, pendingByType] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        clinic: { select: { name: true, document: true, documentType: true } },
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
        _count: { select: { specialties: true, images: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
    prisma.listing.groupBy({
      by: ["type"],
      where: { status: "PENDING" },
      _count: { _all: true },
    }),
  ])

  // Pending-moderation counts per type, shown as badges on the type tabs.
  const pendingCounts = pendingByType.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.type] = row._count._all
      return acc
    },
    {}
  )
  const pendingTotal = Object.values(pendingCounts).reduce((a, b) => a + b, 0)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Helper to build pagination links preserving current filters
  function pageHref(p: number): string {
    const sp = new URLSearchParams()
    if (params.status) sp.set("status", params.status)
    if (params.type) sp.set("type", params.type)
    if (params.review) sp.set("review", params.review)
    if (q) sp.set("q", q)
    sp.set("page", String(p))
    return `/admin/anuncios?${sp.toString()}`
  }

  // Build a type-filter href preserving the other active filters (status,
  // review, busca) — antes as tabs descartavam a busca sem aviso.
  function typeHref(t: string): string {
    const sp = new URLSearchParams()
    if (params.status) sp.set("status", params.status)
    if (params.review) sp.set("review", params.review)
    if (q) sp.set("q", q)
    if (t) sp.set("type", t)
    return `/admin/anuncios?${sp.toString()}`
  }

  // Status-filter href preserving type and busca.
  function statusHref(s: string): string {
    const sp = new URLSearchParams()
    if (s) sp.set("status", s)
    if (params.type) sp.set("type", params.type)
    if (q) sp.set("q", q)
    const qs = sp.toString()
    return qs ? `/admin/anuncios?${qs}` : "/admin/anuncios"
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
            <Link
              key={s}
              href={statusHref(s)}
              className={`rounded-md px-3 py-1 text-sm ${
                (params.status ?? "") === s && !params.review
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {s ? statusConfig[s]?.label || s : "Todos"}
            </Link>
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

      {/* Type filter tabs with pending-moderation counts */}
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { value: "", label: "Todos os tipos", pending: pendingTotal },
          { value: "CLINIC", label: "Clínicas", pending: pendingCounts.CLINIC ?? 0 },
          { value: "EQUIPMENT", label: "Aparelhos", pending: pendingCounts.EQUIPMENT ?? 0 },
          { value: "EDUCATION", label: "Educação", pending: pendingCounts.EDUCATION ?? 0 },
        ].map((t) => {
          const active = (params.type ?? "") === t.value
          return (
            <Link
              key={t.value}
              href={typeHref(t.value)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm ${
                active ? "bg-gold text-navy" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.label}
              {t.pending > 0 && (
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    active ? "bg-navy text-white" : "bg-amber-500 text-white"
                  }`}
                  title={`${t.pending} pendente(s) de moderação`}
                >
                  {t.pending}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {listings.map((listing) => {
          const cfg = statusConfig[listing.status]
          // Clínicas e aparelhos precisam de ao menos 1 foto para ir ao ar.
          // (Educação/mentoria é isenta — foto é opcional lá.)
          const requiresPhoto = listing.type === "CLINIC" || listing.type === "EQUIPMENT"
          const missingPhoto = requiresPhoto && listing._count.images === 0
          return (
            <Card key={listing.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{listing.title}</h3>
                    <Badge variant="outline" className="border-navy/30 text-navy">
                      {typeConfig[listing.type]?.label ?? listing.type}
                    </Badge>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {!listing.reviewedAt && (
                      <Badge variant="warning" className="border-amber-300 bg-amber-100 text-amber-800">
                        Não revisado
                      </Badge>
                    )}
                    {listing.featured && <Badge variant="default" className="bg-gold text-navy">Destaque</Badge>}
                    {missingPhoto && (
                      <Badge variant="destructive">Sem foto</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {listing.clinic.name}
                    {listing.clinic.document && listing.clinic.documentType && (
                      <span className="text-xs">
                        {" "}
                        ({listing.clinic.documentType}{" "}
                        {formatDocument(listing.clinic.document, listing.clinic.documentType)})
                      </span>
                    )}{" "}
                    &middot; {listing.city},{" "}
                    {listing.neighborhood} &middot; {listing._count.images}{" "}
                    fotos
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={listing.id} />
                    <PendingButton
                      size="sm"
                      variant={listing.featured ? "default" : "ghost"}
                      className="gap-1"
                      title={listing.featured ? "Remover destaque" : "Destacar"}
                    >
                      <Star className={`h-3.5 w-3.5 ${listing.featured ? "fill-current" : ""}`} />
                    </PendingButton>
                  </form>
                  {!listing.reviewedAt && (
                    <form action={markReviewed}>
                      <input type="hidden" name="id" value={listing.id} />
                      <PendingButton
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        title="Marcar como revisado"
                        pendingText="Salvando..."
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Revisado
                      </PendingButton>
                    </form>
                  )}
                  <Link
                    href={
                      listing.type === "EQUIPMENT"
                        ? `/admin/aparelhos/${listing.id}/editar`
                        : listing.type === "EDUCATION"
                          ? `/admin/educacao/${listing.id}/editar`
                          : `/admin/anuncios/${listing.id}/editar`
                    }
                  >
                    <Button size="sm" variant="outline" className="gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </Link>
                  {listing.status === "PENDING" && (
                    <>
                      {missingPhoto ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          className="gap-1 opacity-50"
                          disabled
                          title="Adicione ao menos 1 foto antes de aprovar"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Aprovar
                        </Button>
                      ) : (
                        <form action={approveListing}>
                          <input type="hidden" name="id" value={listing.id} />
                          <PendingButton
                            size="sm"
                            variant="default"
                            className="gap-1"
                            pendingText="Aprovando..."
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Aprovar
                          </PendingButton>
                        </form>
                      )}
                      <RejectListingButton id={listing.id} title={listing.title} />
                    </>
                  )}
                  {listing.status === "PUBLISHED" && (
                    <form action={archiveListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <PendingButton
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        pendingText="Arquivando..."
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Arquivar
                      </PendingButton>
                    </form>
                  )}
                  {(listing.status === "ARCHIVED" || listing.status === "REJECTED" || listing.status === "DRAFT") && (
                    <form action={approveListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <PendingButton
                        size="sm"
                        variant="default"
                        className="gap-1"
                        pendingText="Publicando..."
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Publicar
                      </PendingButton>
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
