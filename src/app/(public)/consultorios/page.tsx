export const dynamic = "force-dynamic"

import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { CIDADES_CONHECIDAS, slugDaCidade } from "@/lib/cidades"
import { Button } from "@/components/ui/button"
import { MapPin, PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Consultórios por cidade",
  description:
    "Consultórios, salas e espaços médicos para alugar, organizados por cidade. Encontre a sua ou anuncie o seu espaço.",
}

export default async function CidadesIndexPage() {
  // Agrupa por (cidade, UF): homônimas de UFs diferentes são cidades
  // diferentes e não podem somar no mesmo cartão.
  const porCidade = await prisma.listing.groupBy({
    by: ["city", "state"],
    where: { status: "PUBLISHED", type: "CLINIC", images: { some: {} } },
    _count: true,
    orderBy: { _count: { city: "desc" } },
  })

  const todas = porCidade.map((c) => ({ city: c.city, state: c.state }))
  const comOferta = new Set(todas.map((c) => slugDaCidade(c, todas)))
  const semOferta = Object.entries(CIDADES_CONHECIDAS).filter(
    ([slug]) => !comOferta.has(slug)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Consultórios por cidade</h1>
      <p className="mt-1 text-muted-foreground">
        Espaços médicos para alugar, organizados pela cidade onde você atende.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {porCidade.map((c) => (
          <Link
            key={`${c.city}-${c.state}`}
            href={`/consultorios/${slugDaCidade(c, todas)}`}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-gold/40 hover:bg-muted/30"
          >
            <span className="flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4 text-gold" />
              {c.city}
            </span>
            <span className="text-sm text-muted-foreground">
              {c._count} {c._count === 1 ? "espaço" : "espaços"}
            </span>
          </Link>
        ))}
      </div>

      {semOferta.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Em breve na sua cidade
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nessas cidades a MedSpace ainda está começando. Tem clínica por lá?
            Seja a primeira a anunciar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {semOferta.map(([slug, c]) => (
              <Link
                key={slug}
                href={`/consultorios/${slug}`}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 rounded-lg border bg-muted/30 p-6 text-center">
        <p className="font-medium">Sua cidade não está na lista?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre sua clínica e abra a sua praça: o anúncio aparece na página
          da sua cidade assim que for publicado.
        </p>
        <Link href="/cadastro">
          <Button className="mt-4 gap-2">
            <PlusCircle className="h-4 w-4" />
            Cadastrar minha clínica
          </Button>
        </Link>
      </div>
    </div>
  )
}
