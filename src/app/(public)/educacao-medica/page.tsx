export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WhatsAppButton } from "@/components/anuncios/WhatsAppButton"
import { LaunchBanner } from "@/components/layout/LaunchBanner"
import {
  GraduationCap,
  BookOpen,
  Award,
  Search,
  MessageCircle,
  ArrowRight,
  ShieldAlert,
  MapPin,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Educação Médica",
  description:
    "Mentorias, cursos, pós-graduações e eventos para profissionais de saúde. Anúncios publicados diretamente pelos organizadores — contato direto via WhatsApp.",
}

const LEGAL_NOTICE =
  "Os cursos, mentorias e eventos divulgados nesta página são de responsabilidade exclusiva dos respectivos anunciantes. A MedSpace não organiza, certifica, valida nem garante os conteúdos anunciados."

export default async function EducacaoMedicaPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED", type: "EDUCATION" },
    include: {
      clinic: true,
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 60,
  })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-4 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,168,76,0.15),_transparent_60%)]" />
        <div className="container relative mx-auto text-center">
          <Image
            src="/logo.png"
            alt="MedSpace"
            width={400}
            height={150}
            className="mx-auto mb-8 h-28 w-auto brightness-150 md:h-36"
            priority
          />
          <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
            Novo na MedSpace
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Encontre <span className="text-gold">mentorias</span>, cursos e
            pós-graduações para avançar na medicina
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Conectamos médicos que buscam crescimento com profissionais e
            instituições que ensinam. Direto, sem burocracia.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="#oportunidades">
              <Button
                size="lg"
                className="gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold text-base px-8"
              >
                Ver oportunidades disponíveis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
            <Link href="/cadastro">
              <Button
                size="lg"
                variant="ghost"
                className="font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                Quero anunciar uma oportunidade educacional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              O que você encontra aqui?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Oportunidades de aprendizado anunciadas por quem está no mercado.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="border-gold/20 bg-gold/5 text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <BookOpen className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Mentorias</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aprenda com médicos experientes em sessões individuais ou em
                  grupo. Foco em carreira, gestão ou especialidade.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gold/20 bg-gold/5 text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <GraduationCap className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Cursos</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cursos práticos e teóricos de curta duração em diversas
                  especialidades e áreas de gestão médica.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gold/20 bg-gold/5 text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Award className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Pós-Graduação</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Programas de pós-graduação e especialização para aprofundar o
                  conhecimento e ampliar possibilidades de atuação.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Como funciona para quem busca
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Em 3 passos simples, encontre a oportunidade certa para você.
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
                  Encontre mentorias, cursos e pós-graduações por área de
                  interesse, formato ou cidade.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <GraduationCap className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">2. Escolha</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Veja detalhes, carga horária, formato e informações do
                  anunciante.
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
                  Fale direto com o anunciante pelo WhatsApp. Você negocia
                  direto, sem intermediários.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="oportunidades" className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold md:text-3xl">
            Oportunidades disponíveis
          </h2>

          {/* Legal notice (Doc 3 — required on the page) */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
            <p>{LEGAL_NOTICE}</p>
          </div>

          {listings.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => {
                const img = listing.images[0]
                return (
                  <Card
                    key={listing.id}
                    className="group flex flex-col overflow-hidden border-border/50 transition-all hover:border-gold/30 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={listing.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-warm-gray">
                          <GraduationCap className="h-10 w-10 text-muted-foreground/30" />
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
                    <CardContent className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 font-semibold text-foreground">
                        {listing.title}
                      </h3>
                      <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">
                        {listing.description}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {listing.clinic.name}
                      </p>
                      <WhatsAppButton
                        phone={listing.whatsapp}
                        message={`Olá! Vi seu anúncio "${listing.title}" na MedSpace e tenho interesse.`}
                        className="mt-3 block"
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-warm-gray/50 px-6 py-16 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-lg font-medium">
                Em breve, novas oportunidades por aqui
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Ainda não há anúncios de educação médica publicados. Se você
                oferece cursos, mentorias ou pós-graduações, seja um dos
                primeiros a anunciar.
              </p>
              <Link href="/cadastro">
                <Button className="mt-6 gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold">
                  Anunciar oportunidade
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA for advertisers */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Quer anunciar uma oportunidade educacional?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Cadastre-se gratuitamente, descreva o que você oferece e receba
            contatos direto pelo WhatsApp. Sem taxas, sem comissão.
          </p>
          <Link href="/cadastro">
            <Button
              size="lg"
              className="mt-6 gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold"
            >
              Criar conta gratuita
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <LaunchBanner />
    </>
  )
}
