import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { ListingCard } from "@/components/anuncios/ListingCard"
import { Search, Building2, Stethoscope, MessageCircle } from "lucide-react"

export default async function HomePage() {
  const [featuredListings, stats] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      include: {
        clinic: true,
        roomType: true,
        specialties: { include: { specialty: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-primary px-4 py-16 text-primary-foreground md:py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold md:text-5xl">
            Encontre o espaço ideal para sua{" "}
            <span className="text-secondary">prática médica</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Conectamos médicos a clínicas com salas e equipamentos disponíveis.
            Sem burocracia, direto pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/anuncios">
              <Button size="lg" variant="secondary" className="gap-2">
                <Search className="h-5 w-5" />
                Buscar Salas
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Building2 className="h-5 w-5" />
                Anunciar Espaço
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            Como funciona
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">1. Busque</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Encontre salas por cidade, especialidade ou tipo de
                  equipamento.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">2. Escolha</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Veja fotos, equipamentos disponíveis e detalhes de cada
                  espaço.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">3. Contate</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Entre em contato direto com a clínica pelo WhatsApp e combine
                  tudo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featuredListings.length > 0 && (
        <section className="bg-muted/50 px-4 py-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Destaques</h2>
              <Link href="/anuncios">
                <Button variant="ghost">Ver todos</Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Tem uma clínica com espaço disponível?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Cadastre-se gratuitamente e comece a receber contatos de médicos
            interessados.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="mt-6">
              Cadastrar Clínica Grátis
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
