export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { priceFor, formatBRL } from "@/lib/billing/pricing"
import { PagamentoClient } from "./PagamentoClient"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PagamentoPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.clinicId) redirect("/login")

  // Escopo por clínica na própria consulta: o anunciante não pode nem abrir a
  // tela de pagamento de um anúncio que não é dele.
  const listing = await prisma.listing.findFirst({
    where: { id, clinicId: session.user.clinicId },
    select: { id: true, title: true, type: true, status: true, paidUntil: true },
  })
  if (!listing) notFound()

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId },
    select: { document: true },
  })

  const preco = priceFor(listing.type)
  const pagavel =
    listing.status === "AWAITING_PAYMENT" || listing.status === "EXPIRED"

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/painel"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para meus anúncios
      </Link>

      <div className="mt-4">
        {pagavel ? (
          <PagamentoClient
            listingId={listing.id}
            listingTitle={listing.title}
            precoFormatado={formatBRL(preco.amountCents)}
            duracaoDias={preco.durationDays}
            precisaDocumento={!clinic?.document}
          />
        ) : (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Nada a pagar por aqui</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {listing.status === "PUBLISHED" && listing.paidUntil
                ? `Este anúncio está publicado até ${new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "long",
                    timeZone: "America/Sao_Paulo",
                  }).format(listing.paidUntil)}.`
                : "Este anúncio ainda não está aguardando pagamento. Ele precisa passar pela análise antes."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
