import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Eye,
  MessageCircle,
  ShieldCheck,
  BarChart3,
  ImagePlus,
  Users,
  Zap,
} from "lucide-react"

export const metadata = {
  title: "Para Clínicas | MedSpace",
  description:
    "Anuncie seus espaços e equipamentos no MedSpace. Alcance médicos que buscam salas prontas para atender. Cadastro gratuito.",
}

export default function ParaClinicasPage() {
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
            100% gratuito para clínicas
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Sua clínica tem salas ou equipamentos{" "}
            <span className="text-gold">parados?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Anuncie no MedSpace e conecte-se com médicos que precisam de espaços
            prontos para atender. Receba contatos direto no seu WhatsApp — sem
            comissão, sem burocracia.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold text-base px-8"
              >
                Cadastrar minha clínica
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button
                size="lg"
                variant="ghost"
                className="font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                Como funciona?
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Problema / Solução */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Você tem estrutura sobrando?
              <br />
              Médicos precisam dela.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Muitas clínicas possuem salas e equipamentos que ficam ociosos em
              parte do tempo. Enquanto isso, milhares de médicos buscam espaços
              para atender sem precisar montar consultório próprio. O MedSpace
              faz essa ponte.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="border-gold/20 bg-gold/5 text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <DollarSign className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  Gere receita extra
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Monetize salas e equipamentos ociosos sem nenhum custo de
                  adesão. Toda receita é sua.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gold/20 bg-gold/5 text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Eye className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  Visibilidade imediata
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Seu anúncio fica visível para médicos que estão ativamente
                  buscando espaços na sua região.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gold/20 bg-gold/5 text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <MessageCircle className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  Contato direto por WhatsApp
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Os médicos interessados falam direto com você. Sem
                  intermediários, sem comissão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section
        id="como-funciona"
        className="bg-warm-gray px-4 py-16 md:py-20"
      >
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Comece em 3 passos simples
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Em menos de 5 minutos seu espaço já está visível para médicos.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold">
                1
              </div>
              <h3 className="mt-5 text-lg font-semibold">Crie sua conta</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastre-se gratuitamente com e-mail e WhatsApp da clínica. Leva
                menos de 1 minuto.
              </p>
            </div>
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold">
                2
              </div>
              <h3 className="mt-5 text-lg font-semibold">Publique anúncios</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Adicione fotos, descreva seus espaços, selecione equipamentos
                disponíveis e publique.
              </p>
            </div>
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold">
                3
              </div>
              <h3 className="mt-5 text-lg font-semibold">Receba contatos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Médicos interessados entram em contato pelo WhatsApp. Você
                negocia direto, sem taxas.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recursos do painel */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Tudo que você precisa para gerenciar seus anúncios
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Painel completo e fácil de usar, feito para clínicas.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <ImagePlus className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-4 font-semibold">Galeria de fotos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Adicione até 10 fotos por anúncio para mostrar seus espaços.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <BarChart3 className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-4 font-semibold">Painel de controle</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gerencie todos os seus anúncios em um único lugar.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <Users className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-4 font-semibold">Múltiplas especialidades</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Alcance médicos de diversas áreas com um único anúncio.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <Zap className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-4 font-semibold">Publicação rápida</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Após verificação, seu anúncio entra no ar em poucas horas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens / Social proof */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Por que clínicas escolhem o MedSpace
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-6">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-white">
                  Sem taxas ou comissões
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Cadastre-se de graça, publique de graça. Não cobramos nenhum
                  percentual sobre suas negociações.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-6">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-white">
                  Leads qualificados
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Médicos que entram em contato já estão buscando exatamente o
                  que você oferece.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-6">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-white">
                  Anúncios verificados
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Nossa equipe verifica cada anúncio, passando credibilidade e
                  segurança para quem busca.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-6">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-white">
                  Você tem total controle
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Ative, pause ou edite seus anúncios quando quiser. A
                  negociação acontece no seu ritmo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ para clínicas */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Perguntas Frequentes
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Dúvidas comuns de clínicas sobre o MedSpace
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger>
                  Quanto custa anunciar no MedSpace?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nada. O cadastro e a publicação de anúncios são 100%
                  gratuitos. Não cobramos comissão nem taxa de adesão.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger>
                  Quantos anúncios posso publicar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Você pode criar quantos anúncios quiser. Cada sala ou
                  equipamento pode ter seu próprio anúncio com fotos e
                  descrições específicas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger>
                  Como os médicos entram em contato?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O médico clica no botão de WhatsApp do seu anúncio e é
                  direcionado para uma conversa com o número que você cadastrou.
                  Simples e direto.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger>
                  Meu anúncio é publicado imediatamente?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Seu anúncio passa por uma rápida verificação da nossa equipe
                  para garantir qualidade. Após aprovado, ele fica visível
                  para todos os médicos na plataforma.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger>
                  Posso pausar ou remover um anúncio?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim. No seu painel de controle, você pode arquivar ou editar
                  qualquer anúncio a qualquer momento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border-border/50">
                <AccordionTrigger>
                  Que tipo de espaço posso anunciar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Consultórios, salas de procedimento, salas cirúrgicas,
                  laboratórios, salas de exame — qualquer espaço ou equipamento
                  médico que possa ser sublocado para outros profissionais.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-sm md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">
              Comece a receber contatos hoje mesmo
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Cadastre sua clínica gratuitamente e transforme espaços ociosos em
              receita.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Cadastro em menos de 1 minuto</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Sem taxas ou comissões</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Contatos direto no WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" />
                <span className="text-sm">Anúncios ilimitados</span>
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
              Gratuito &middot; Sem cartão de crédito &middot; Comece agora
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
