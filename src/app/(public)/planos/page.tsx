import type { Metadata } from "next"
import Image from "next/image"
import { Info } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PlansSelector } from "./PlansSelector"

export const metadata: Metadata = {
  title: "Planos de anúncio",
  description:
    "Escolha o plano ideal para o seu anúncio na MedSpace. Espaços, equipamentos ou educação médica — durante o período de lançamento, todos os anúncios são gratuitos.",
}

export default function PlanosPage() {
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
            Período de lançamento — acesso gratuito
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Escolha seu <span className="text-gold">plano</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Médicos que buscam espaço, equipamentos ou cursos entram sempre
            gratuitamente. A cobrança incide apenas sobre quem anuncia.
          </p>
        </div>
      </section>

      {/* Plans selector + cards */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Para clínicas, empresas e profissionais
          </p>
          <h2 className="mt-1 text-2xl font-bold md:text-3xl">
            Como funciona a contratação
          </h2>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Os planos se adaptam ao tipo de anúncio. Escolha a categoria abaixo
            para ver os benefícios.
          </p>

          <div className="mt-6">
            <PlansSelector />
          </div>

          {/* Notice */}
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-warm-gray p-4 text-sm text-muted-foreground md:p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
            <p>
              Durante o período de lançamento todos os anúncios são{" "}
              <strong className="text-foreground">gratuitos</strong>. Em breve
              os planos pagos estarão disponíveis — anunciantes já cadastrados
              terão condições especiais. Ao cancelar, seu anúncio permanece
              ativo até o fim do período contratado.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Perguntas Frequentes
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Dúvidas comuns sobre os planos
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger>
                  Os planos pagos já estão disponíveis?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Ainda não. Durante o período de lançamento, todos os anúncios
                  na MedSpace são gratuitos. Em breve os planos pagos serão
                  ativados e você será avisado com antecedência.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger>
                  Preciso cadastrar cartão agora?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Não. Nenhum dado de pagamento é solicitado durante o período
                  gratuito. Você só fornece dados de cobrança quando os planos
                  pagos forem ativados e você decidir contratar.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger>
                  O que acontece com meu anúncio quando os planos forem
                  ativados?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Você será avisado por e-mail com antecedência e poderá
                  escolher o plano que faz mais sentido. Anúncios existentes
                  continuarão ativos durante o período de transição.
                  Anunciantes já cadastrados terão condições especiais.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger>
                  Posso cancelar a assinatura quando quiser?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim. Não há fidelidade. Ao cancelar, seu anúncio permanece
                  ativo até o fim do período já pago (mês ou ano) e depois é
                  desativado.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger>
                  As três categorias têm os mesmos planos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A estrutura é a mesma (Gratuito, Essencial e Profissional),
                  mas os benefícios e detalhes variam conforme a categoria —
                  espaços, equipamentos ou educação médica. Use o seletor de
                  categoria no topo para ver os benefícios de cada uma.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
