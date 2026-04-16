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
import { prisma } from "@/lib/db"
import { ListingCard } from "@/components/anuncios/ListingCard"
import { HeroSearch } from "@/components/home/HeroSearch"
import Image from "next/image"
import {
  Search,
  Building2,
  Stethoscope,
  MessageCircle,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

export default async function HomePage() {
  const [featuredListings, specialties, cities] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: {
        clinic: true,
        roomType: true,
        specialties: { include: { specialty: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.specialty.findMany({ orderBy: { name: "asc" }, take: 8 }),
    prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      select: { city: true, state: true },
      distinct: ["city", "state"],
    }),
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
            Conectamos clínicas e médicos para{" "}
            <span className="text-gold">sublocação de espaços e equipamentos médicos</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Encontre salas, aparelhos e estruturas prontas para atender — direto
            com a clínica, sem burocracia.
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

      {/* Featured listings (images) */}
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
                  Encontre salas por cidade, especialidade ou tipo de equipamento.
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
                  Veja fotos, equipamentos disponíveis e detalhes de cada espaço.
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
                  Entre em contato direto com a clínica pelo WhatsApp e combine tudo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why MedSpace */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Por que usar o MedSpace?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/60">
              A forma mais moderna e prática de encontrar espaços médicos no Brasil.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
                <MessageCircle className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Sem intermediários
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Conecte-se diretamente com a clínica e negocie com total
                autonomia.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
                <Clock className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Contato rápido
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Agilidade no contato para você começar a atender sem demora.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
                <Building2 className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Espaços completos
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Salas equipadas com tudo que você precisa para atender seus
                pacientes com qualidade.
              </p>
            </div>
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

      {/* CTA - Clinic owners */}
      <section className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-sm md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">
              Você tem uma clínica?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Cadastre-se gratuitamente e comece a receber contatos de médicos
              interessados nos seus espaços.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Cadastro gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Anuncie seus espaços</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Receba contatos pelo WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Gerencie tudo pelo painel</span>
              </div>
            </div>
            <Link href="/cadastro">
              <Button
                size="lg"
                className="mt-8 gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                Cadastrar minha clínica
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Plano inicial gratuito &middot; Sem taxas de cadastro &middot;
              Comece hoje mesmo
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-16 md:py-20">
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
                  O MedSpace é um marketplace que conecta médicos a clínicas que
                  oferecem salas e equipamentos para uso profissional. Nossa
                  plataforma facilita a busca e o contato direto entre
                  profissionais de saúde e espaços disponíveis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger>
                  Como faço para encontrar uma sala?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Basta acessar a página de anúncios e usar os filtros por
                  cidade, especialidade, tipo de sala ou equipamento. Ao
                  encontrar um espaço que atenda suas necessidades, clique no
                  botão de WhatsApp para falar direto com a clínica.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger>A plataforma é gratuita?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Tanto para médicos que buscam salas quanto para clínicas
                  que anunciam seus espaços, o cadastro e uso da plataforma é
                  totalmente gratuito.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger>
                  Como posso anunciar minha clínica?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Crie uma conta como clínica, preencha os dados do seu espaço,
                  adicione fotos e publique. Após a verificação pela nossa
                  equipe, seu anúncio ficará visível para milhares de médicos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border-border/50">
                <AccordionTrigger>
                  Como funciona o contato com a clínica?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O contato é feito diretamente pelo WhatsApp. Ao clicar no
                  botão de contato em um anúncio, você será redirecionado para
                  uma conversa com a clínica, sem intermediários.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
