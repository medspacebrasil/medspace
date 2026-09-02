export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  getCachedPublishedClinicCities,
  getCachedClinicListingsPage,
  getCachedClinicListingsCount,
} from "@/lib/cache"
import { resolverCidade, slugDaCidade } from "@/lib/cidades"
import { ListingCard } from "@/components/anuncios/ListingCard"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, PlusCircle } from "lucide-react"

/**
 * Página de destino por cidade.
 *
 * Existe para o visitante de fora de Brasília não cair numa lista sem nada da
 * cidade dele e ir embora: mostra a oferta local quando há, e quando não há
 * convida a clínica da região a abrir a praça, que é como a oferta nasce.
 */

interface PageProps {
  params: Promise<{ cidade: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { cidade: slug } = await params
  const cidade = resolverCidade(slug, await getCachedPublishedClinicCities())
  // notFound() aqui, e não só no corpo: quando só o corpo decide, o status 200
  // já foi enviado com o streaming e o 404 vira "soft 404" para o Google.
  if (!cidade) notFound()
  return {
    title: `Consultórios e salas médicas em ${cidade.nome}`,
    description: `Encontre consultórios, salas e espaços médicos para alugar em ${cidade.nome}, direto com o anunciante e sem burocracia. Contato pelo WhatsApp.`,
  }
}

export default async function CidadePage({ params }: PageProps) {
  const { cidade: slug } = await params
  const cidades = await getCachedPublishedClinicCities()
  const cidade = resolverCidade(slug, cidades)
  if (!cidade) notFound()

  // A UF entra no filtro para homônimas não se misturarem. Fica de fora
  // apenas quando a cidade veio de registro antigo sem UF preenchida.
  const where = {
    status: "PUBLISHED" as const,
    type: "CLINIC" as const,
    images: { some: {} },
    city: cidade.nome,
    ...(cidade.uf ? { state: cidade.uf } : {}),
  }
  const [listings, total] = await Promise.all([
    getCachedClinicListingsPage(where, "recent", 0, 12),
    getCachedClinicListingsCount(where),
  ])

  const outras = cidades
    .filter((c) => slugDaCidade(c, cidades) !== slug)
    .slice(0, 12)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        {cidade.nome}
        {cidade.uf ? `, ${cidade.uf}` : ""}
      </div>
      <h1 className="mt-1 text-2xl font-bold md:text-3xl">
        Consultórios e salas médicas em {cidade.nome}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {total > 0
          ? `${total} ${total === 1 ? "espaço disponível" : "espaços disponíveis"} para atender em ${cidade.nome}.`
          : `Espaços para atender em ${cidade.nome}, direto com o anunciante.`}
      </p>

      {listings.length > 0 ? (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {total > listings.length && (
            <div className="mt-8 text-center">
              <Link href={`/anuncios?city=${encodeURIComponent(cidade.nome)}`}>
                <Button variant="outline">
                  Ver todos os {total} espaços em {cidade.nome}
                </Button>
              </Link>
            </div>
          )}
          <div className="mt-10 rounded-lg border bg-muted/30 p-6 text-center">
            <p className="font-medium">
              Tem uma clínica ou consultório em {cidade.nome}?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Anuncie seu espaço e receba contato de médicos direto no WhatsApp.
            </p>
            <Link href="/cadastro">
              <Button className="mt-4 gap-2">
                <PlusCircle className="h-4 w-4" />
                Cadastrar minha clínica
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-lg border bg-muted/30 p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">
            Ainda não temos consultórios anunciados em {cidade.nome}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            A MedSpace está chegando na sua região. Se você tem uma clínica ou
            consultório em {cidade.nome}, seja a primeira da cidade a anunciar
            e receba contato de médicos direto no WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/cadastro">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Cadastrar minha clínica
              </Button>
            </Link>
            <Link href="/anuncios">
              <Button variant="outline">Ver anúncios em outras cidades</Button>
            </Link>
          </div>
        </div>
      )}

      {outras.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Outras cidades com espaços publicados
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {outras.map((c) => (
              <Link
                key={`${c.city}-${c.state}`}
                href={`/consultorios/${slugDaCidade(c, cidades)}`}
                className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
              >
                {c.city}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
