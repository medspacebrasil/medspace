export const dynamic = "force-dynamic"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  getCachedFeaturedClinicListings,
  getCachedTopSpecialties,
  getCachedPublishedClinicCities,
} from "@/lib/cache"
import { ListingCard } from "@/components/anuncios/ListingCard"
import { HeroSearch } from "@/components/home/HeroSearch"
import Image from "next/image"
import type { Metadata } from "next"
import {
  Search,
  Stethoscope,
  MessageCircle,
  ArrowRight,
  Wrench,
  Building2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Para Médicos | MedSpace",
  description:
    "Encontre salas, aparelhos e estruturas prontas para atender — direto com a clínica, sem burocracia.",
}

export default async function ParaMedicosPage() {
  const [featuredListings, specialties, cities] = await Promise.all([
    getCachedFeaturedClinicListings(6),
    getCachedTopSpecialties(8),
    getCachedPublishedClinicCities(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,168,76,0.15),_transparent_60%)]" />
        <div className="container relative mx-auto text-center">
          <Image
            src="/logo.png"
            alt="MedSpace"
            width={400}
            height={150}
            className="mx-auto mb-8 h-32 w-auto brightness-150 md:h-44 lg:h-52"
            priority
          />
          <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Encontre o espaço ideal para sua{" "}
            <span className="text-gold">prática médica</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Conectamos médicos e clínicas com salas e equipamentos disponíveis.
            Sem burocracia, direto pelo WhatsApp.
          </p>

          {/* Search bar */}
          <HeroSearch
            states={Object.entries(
              cities.reduce<Record<string, string[]>>((acc, c) => {
                const st = c.state || "Outros"
                if (!acc[st]) acc[st] = []
                if (!acc[st].includes(c.city)) acc[st].push(c.city)
                return acc
              }, {})
            )
              .map(([state, stateCities]) => ({ state, cities: stateCities.sort() }))
              .sort((a, b) => a.state.localeCompare(b.state))}
            specialties={specialties.map((s) => ({ slug: s.slug, name: s.name }))}
          />
        </div>
      </section>

      {/* Quick access: Salas / Aparelhos */}
      <section className="px-4 py-12">
        <div className="container mx-auto">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/anuncios"
              className="group flex items-center gap-4 rounded-2xl border border-gold/20 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <Building2 className="h-7 w-7 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Salas e consultórios</h3>
                <p className="text-sm text-muted-foreground">
                  Espaços equipados para atender seus pacientes.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/aparelhos"
              className="group flex items-center gap-4 rounded-2xl border border-gold/20 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <Wrench className="h-7 w-7 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Aparelhos médicos</h3>
                <p className="text-sm text-muted-foreground">
                  Aparelhos disponíveis para locação direto com a clínica.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featuredListings.length > 0 && (
        <section className="px-4 py-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">Espaços em Destaque</h2>
              <Link href="/anuncios">
                <Button variant="ghost" className="gap-1 text-gold hover:text-gold-dark">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
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

      {/* How it works */}
      <section id="como-funciona" className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Como funciona</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Em 3 passos simples, encontre o espaço perfeito para atender seus
              pacientes.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Search className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">1. Busque</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Encontre salas e equipamentos por cidade, especialidade ou
                  estrutura.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Stethoscope className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">2. Escolha</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Compare opções, veja fotos e detalhes.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <MessageCircle className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">3. Contate</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fale direto com a clínica pelo WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      {specialties.length > 0 && (
        <section className="px-4 py-16 md:py-20">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold md:text-3xl">
                Especialidades Médicas
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Encontre espaços especializados para cada área médica.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {specialties.map((spec) => (
                <Link
                  key={spec.id}
                  href={`/anuncios?specialty=${spec.slug}`}
                  className="group rounded-xl border border-border bg-white p-5 text-center transition-all hover:border-gold/50 hover:shadow-md"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                    <Stethoscope className="h-5 w-5 text-gold" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{spec.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Perguntas Frequentes
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Tire suas dúvidas sobre a plataforma
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger>O que é o MedSpace?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O MedSpace é um marketplace que conecta médicos a clínicas
                  que oferecem salas e equipamentos para uso profissional.
                  Nossa plataforma facilita a busca e o contato direto entre
                  profissionais de saúde e espaços disponíveis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger>
                  Como faço para encontrar uma sala?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Basta acessar a página de anúncios e usar os filtros por
                  cidade, especialidade, tipo de sala ou recursos disponíveis.
                  Ao encontrar um espaço que atenda suas necessidades, clique
                  no botão de WhatsApp para falar direto com a clínica.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger>A plataforma é gratuita?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Para médicos que buscam salas, o uso da plataforma é
                  totalmente gratuito.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger>
                  Como funciona o contato com a clínica?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O contato é feito diretamente pelo WhatsApp. Ao clicar no
                  botão de contato em um anúncio, você será redirecionado
                  para uma conversa com a clínica, sem intermediários.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
