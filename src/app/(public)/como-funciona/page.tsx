import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Megaphone,
  MessageCircle,
  Handshake,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Como funciona — MedSpace",
  description:
    "A MedSpace é uma plataforma digital de anúncios e contato entre usuários da área da saúde. Veja como funciona em 3 passos.",
}

export default function ComoFuncionaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            Como funciona a MedSpace
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            A MedSpace é uma{" "}
            <strong className="text-white">
              plataforma digital de anúncios e contato entre usuários
            </strong>{" "}
            voltada à área da saúde. Conectamos quem tem espaços, equipamentos,
            cursos ou oportunidades a divulgar com quem está procurando.
          </p>
        </div>
      </section>

      {/* 3 passos */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            3 passos simples
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Sem burocracia, sem intermediários, sem reservas pela plataforma.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-warm-gray shadow-sm">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Megaphone className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  1. Usuários publicam anúncios
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clínicas e profissionais cadastram suas salas, aparelhos,
                  cursos ou oportunidades e publicam o anúncio na plataforma.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-warm-gray shadow-sm">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <MessageCircle className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  2. Interessados entram em contato
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Médicos e profissionais de saúde encontram o anúncio e falam
                  diretamente com o anunciante pelo WhatsApp.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-warm-gray shadow-sm">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <Handshake className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  3. Negociação direta entre usuários
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Valores, condições, agendamento e pagamento são combinados
                  diretamente entre as partes, fora da plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Importante */}
      <section className="bg-warm-gray px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-xl font-bold text-amber-900">Importante</h2>
                <p className="mt-2 text-sm text-amber-900/90">
                  A MedSpace atua <strong>exclusivamente</strong> como ambiente
                  digital de divulgação e conexão entre usuários. Por isso:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-amber-900/90">
                  <li>
                    • <strong>não realiza reservas</strong> de salas, aparelhos
                    ou serviços;
                  </li>
                  <li>
                    • <strong>não processa pagamentos</strong> entre as partes;
                  </li>
                  <li>
                    • <strong>não intermedia negociações</strong> nem participa
                    de contratos;
                  </li>
                  <li>
                    • <strong>não garante negócios</strong>, ocupação,
                    funcionamento de equipamentos ou retorno financeiro;
                  </li>
                  <li>
                    • <strong>não administra agendas</strong> nem horários dos
                    anunciantes.
                  </li>
                </ul>
                <p className="mt-3 text-sm text-amber-900/90">
                  Toda negociação acontece direto entre quem anuncia e quem
                  procura. A MedSpace só viabiliza o encontro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Pronto pra começar?</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Cadastre-se gratuitamente em poucos minutos.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/anuncios">
              <Button size="lg" variant="outline">
                Ver anúncios
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Ao criar conta, você concorda com os{" "}
            <Link href="/termos-de-uso" className="underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/politica-de-privacidade" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
