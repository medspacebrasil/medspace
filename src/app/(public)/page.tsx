export const dynamic = "force-dynamic"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"
import {
  Stethoscope,
  Building2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Zap,
  GraduationCap,
} from "lucide-react"

export default function HomePage() {
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
            Conectando <span className="text-gold">médicos</span>,{" "}
            <span className="text-gold">clínicas</span> e{" "}
            <span className="text-gold">empresas</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Encontre ou anuncie salas, equipamentos e oportunidades de educação
            médica — direto pelo WhatsApp, sem burocracia.
          </p>
        </div>
      </section>

      {/* Three Blocks: Médico | Clínica/Coworking | Empresa/Instituição */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Qual é o seu perfil?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Escolha como quer usar a MedSpace.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Link
              href="/para-medicos"
              className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl md:p-10"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <Stethoscope className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mt-6 text-xl font-bold md:text-2xl">Sou Médico</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                Encontre salas, equipamentos ou oportunidades de educação. Ou
                anuncie seus próprios serviços.
              </p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                Ver oportunidades
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/para-clinicas"
              className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl md:p-10"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <Building2 className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mt-6 text-xl font-bold md:text-2xl">
                Sou Clínica ou Coworking
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                Anuncie salas e equipamentos ociosos e receba contatos de
                médicos interessados.
              </p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                Cadastrar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/cadastro"
              className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl md:p-10"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <GraduationCap className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mt-6 text-xl font-bold md:text-2xl">
                Sou Empresa ou Instituição
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                Anuncie equipamentos médicos disponíveis ou oferte cursos e
                capacitações para profissionais de saúde.
              </p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                Cadastrar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — 2 colunas */}
      <section id="como-funciona" className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Como funciona</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Simples para médicos, clínicas, empresas e instituições.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Stethoscope className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold">Médico</h3>
              </div>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Busque</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Encontre salas, equipamentos ou oportunidades de educação
                      por cidade, especialidade ou área de interesse.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Escolha</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Compare opções, veja fotos e detalhes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Contate</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fale direto com o anunciante pelo WhatsApp.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Building2 className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold">Clínica</h3>
              </div>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Cadastre</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Crie seu anúncio de forma simples e rápida.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Publique</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mostre sua sala ou equipamento para médicos.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Receba contatos</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Converse diretamente com interessados pelo WhatsApp.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Por que usar — 3 colunas */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Por que usar o MedSpace?
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold">
                <Stethoscope className="h-4 w-4" />
                Para Médicos
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Encontre mais oportunidades
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Acesse espaços e equipamentos disponíveis em diversas
                    regiões.
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Agilidade no contato
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Fale direto com o anunciante, sem burocracia.
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Flexibilidade de atendimento
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Atenda onde e quando quiser.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold">
                <Building2 className="h-4 w-4" />
                Para Clínicas
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Gere receita com espaços ociosos
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Monetize salas e equipamentos parados.
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Aumente sua ocupação
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Receba médicos interessados na sua estrutura.
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Contato direto e simples
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Negocie rapidamente pelo WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold">
                <GraduationCap className="h-4 w-4" />
                Educação Médica
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">
                    Avance na carreira
                  </h4>
                  <p className="mt-1 text-sm text-white/60">
                    Mentorias, cursos e pós-graduações em um só lugar.
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">Anuncie e ensine</h4>
                  <p className="mt-1 text-sm text-white/60">
                    Divulgue suas formações para profissionais de saúde.
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="font-semibold text-white">Contato direto</h4>
                  <p className="mt-1 text-sm text-white/60">
                    Fale com o anunciante pelo WhatsApp, sem intermediários.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Cards finais */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="mt-0 grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-warm-gray shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <MessageCircle className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  Sem intermediários
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Conexão direta entre médicos, clínicas, empresas e
                  instituições.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-warm-gray shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Sparkles className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  Mais oportunidades
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mais opções para médicos e mais visibilidade para quem
                  anuncia.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-warm-gray shadow-sm text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Zap className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Simples e rápido</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Encontre ou anuncie em poucos minutos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger>A plataforma é gratuita?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Para médicos que buscam salas, equipamentos ou educação
                  médica, o acesso é sempre gratuito. Para quem anuncia
                  (clínicas, coworkings, empresas e instituições), os anúncios
                  estão gratuitos durante o período de lançamento. Em breve
                  lançaremos planos com condições especiais para quem já estiver
                  cadastrado.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger>
                  Como funciona o contato?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O contato é feito diretamente pelo WhatsApp. Sem
                  intermediários, médico e clínica conversam e combinam entre
                  si.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger>Sou médico, por onde começo?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Acesse a página{" "}
                  <Link href="/para-medicos" className="text-gold underline">
                    Para Médicos
                  </Link>{" "}
                  ou vá direto para{" "}
                  <Link href="/anuncios" className="text-gold underline">
                    Encontrar Salas
                  </Link>{" "}
                  para ver os espaços disponíveis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger>
                  Sou clínica, empresa ou instituição, por onde começo?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Acesse{" "}
                  <Link href="/para-clinicas" className="text-gold underline">
                    Para Clínicas
                  </Link>{" "}
                  para conhecer as vantagens e criar sua conta gratuita. Se você
                  oferece cursos, mentorias ou pós-graduações, veja também a{" "}
                  <Link href="/educacao-medica" className="text-gold underline">
                    Educação Médica
                  </Link>
                  .
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
