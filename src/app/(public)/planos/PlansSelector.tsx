"use client"

import { useState, type ReactNode } from "react"
import { Building2, GraduationCap, Wrench, Check, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type CategoryKey = "espacos" | "equipamentos" | "educacao"

type CategoryConfig = {
  key: CategoryKey
  label: string
  icon: ReactNode
  intro: string
  details: string[]
  verifLabel: string
  /** When true, the last detail in `details` is exclusive to Profissional. */
  proOnlyLastDetail?: boolean
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "espacos",
    label: "Espaços e salas",
    icon: <Building2 className="h-4 w-4" />,
    intro:
      "Para clínicas, consultórios e coworkings médicos que querem disponibilizar salas e consultórios por período.",
    details: [
      "Recursos disponíveis (autoclave, salas...)",
      "Especialidades desejadas",
    ],
    verifLabel: "Selo verificado (CNPJ/CNES)",
  },
  {
    key: "equipamentos",
    label: "Locação de equipamentos",
    icon: <Wrench className="h-4 w-4" />,
    intro:
      "Para empresas e profissionais que alugam equipamentos por período ou buscam parceria de uso na clínica do médico.",
    details: [
      "Modelo e marca do equipamento",
      "Condições de uso (aluguel / parceria)",
      "Informações de entrega e custo",
      "Cobrança por disparo",
      "Conformidade ANVISA",
    ],
    verifLabel: "Selo verificado (CNPJ/ANVISA)",
    proOnlyLastDetail: true,
  },
  {
    key: "educacao",
    label: "Educação médica",
    icon: <GraduationCap className="h-4 w-4" />,
    intro:
      "Para instituições, professores e mentores que oferecem cursos, pós-graduação, mentorias e eventos médicos.",
    details: [
      "Data, carga horária e modalidade",
      "Instituição ou instrutor responsável",
      "Preço ou faixa de investimento",
    ],
    verifLabel: "Selo verificado (CNPJ/MEC)",
  },
]

type FeatureItem = { state: "on" | "off" | "clock"; text: string }

type PlanSection = { title: string; items: FeatureItem[] }

type PlanCard = {
  key: "free" | "essential" | "pro"
  name: string
  badge: string
  badgeVariant: "free" | "soon"
  price: string
  priceIsFree: boolean
  period?: string
  hasAnnual: boolean
  description: string
  cta: string
  ctaPrimary: boolean
  disabled: boolean
  featured: boolean
}

const PLANS: PlanCard[] = [
  {
    key: "free",
    name: "Gratuito",
    badge: "Período de lançamento",
    badgeVariant: "free",
    price: "R$ 0",
    priceIsFree: true,
    hasAnnual: false,
    description: "Experimente a plataforma e veja o interesse do mercado.",
    cta: "Anunciar grátis",
    ctaPrimary: false,
    disabled: false,
    featured: false,
  },
  {
    key: "essential",
    name: "Essencial",
    badge: "Em breve",
    badgeVariant: "soon",
    price: "R$ a definir",
    priceIsFree: false,
    period: "/ mês · cancele quando quiser",
    hasAnnual: false,
    description: "Para quem quer mais visibilidade e detalhamento do anúncio.",
    cta: "Em breve",
    ctaPrimary: true,
    disabled: true,
    featured: true,
  },
  {
    key: "pro",
    name: "Profissional",
    badge: "Em breve",
    badgeVariant: "soon",
    price: "R$ a definir",
    priceIsFree: false,
    period: "/ mês",
    hasAnnual: true,
    description:
      "Para máxima visibilidade, credibilidade e dados de desempenho.",
    cta: "Em breve",
    ctaPrimary: false,
    disabled: true,
    featured: false,
  },
]

function buildSections(category: CategoryConfig, plan: PlanCard["key"]): PlanSection[] {
  const detailsFor = (): FeatureItem[] =>
    category.details.map((text, i) => {
      if (plan === "free") return { state: "off", text }
      if (plan === "essential") {
        const lastAndProOnly =
          category.proOnlyLastDetail && i === category.details.length - 1
        return { state: lastAndProOnly ? "off" : "on", text }
      }
      return { state: "on", text }
    })

  if (plan === "free") {
    return [
      {
        title: "Anúncio",
        items: [
          { state: "on", text: "1 anúncio ativo" },
          { state: "on", text: "1 foto" },
          { state: "on", text: "Cidade de localização" },
          { state: "on", text: "Número do WhatsApp (sem link direto)" },
          { state: "on", text: "Sem prazo para expirar durante o lançamento" },
        ],
      },
      { title: "Detalhes do anúncio", items: detailsFor() },
      {
        title: "Visibilidade",
        items: [
          { state: "off", text: "Endereço / localização exata" },
          { state: "off", text: "Destaque na busca" },
          { state: "off", text: category.verifLabel },
          { state: "off", text: "Visualizações do anúncio" },
          { state: "off", text: "Divulgação no Instagram" },
        ],
      },
    ]
  }

  if (plan === "essential") {
    return [
      {
        title: "Anúncio",
        items: [
          { state: "on", text: "Até 2 anúncios ativos" },
          { state: "on", text: "Até 5 fotos por anúncio" },
          { state: "on", text: "Botão direto para WhatsApp" },
          { state: "on", text: "Ativo enquanto a assinatura estiver ativa" },
        ],
      },
      { title: "Detalhes do anúncio", items: detailsFor() },
      {
        title: "Visibilidade",
        items: [
          { state: "on", text: "Endereço / localização exata" },
          { state: "off", text: "Destaque na busca" },
          { state: "off", text: category.verifLabel },
          { state: "off", text: "Visualizações do anúncio" },
          { state: "on", text: "Instagram: 1x nos stories / mês" },
        ],
      },
    ]
  }

  return [
    {
      title: "Anúncio",
      items: [
        { state: "on", text: "Anúncios ilimitados" },
        { state: "on", text: "Galeria completa de fotos" },
        { state: "on", text: "Botão direto para WhatsApp" },
        { state: "on", text: "Ativo enquanto a assinatura estiver ativa" },
      ],
    },
    { title: "Detalhes do anúncio", items: detailsFor() },
    {
      title: "Visibilidade",
      items: [
        { state: "on", text: "Endereço / localização exata" },
        { state: "on", text: "Destaque na busca" },
        { state: "on", text: category.verifLabel },
        { state: "on", text: "Visualizações do anúncio" },
        { state: "on", text: "Instagram: 1 post + 2x stories / mês" },
      ],
    },
  ]
}

function FeatureRow({ item }: { item: FeatureItem }) {
  const Icon = item.state === "clock" ? Clock : item.state === "on" ? Check : X
  const iconColor =
    item.state === "off"
      ? "text-destructive/70"
      : "text-emerald-600"
  const textClass = item.state === "off" ? "text-muted-foreground/70 line-through decoration-muted-foreground/40" : "text-muted-foreground"
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
      <span className={textClass}>{item.text}</span>
    </div>
  )
}

export function PlansSelector() {
  const [activeKey, setActiveKey] = useState<CategoryKey>("espacos")
  const activeCategory = CATEGORIES.find((c) => c.key === activeKey)!

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div>
        <p className="text-sm text-muted-foreground">O que você quer anunciar?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const isActive = c.key === activeKey
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveKey(c.key)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-transparent bg-navy text-white"
                    : "border-border bg-white text-muted-foreground hover:border-gold/60 hover:text-foreground"
                }`}
                aria-pressed={isActive}
              >
                {c.icon}
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category intro */}
      <div className="rounded-lg bg-warm-gray px-4 py-3 text-sm text-muted-foreground">
        {activeCategory.intro}
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const sections = buildSections(activeCategory, plan.key)
          return (
            <div
              key={plan.key}
              className={`flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm transition-shadow ${
                plan.featured
                  ? "border-2 border-gold"
                  : "border border-border"
              }`}
            >
              <div>
                <span
                  className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                    plan.badgeVariant === "free"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gold/15 text-gold-dark"
                  }`}
                >
                  {plan.badge}
                </span>
                <p className="mt-3 text-base font-semibold">{plan.name}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-bold ${
                      plan.priceIsFree ? "text-emerald-600" : "text-foreground"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.hasAnnual && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">ou</span>
                    <span className="font-semibold text-foreground">
                      R$ a definir / ano
                    </span>
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      economize ~2 meses
                    </span>
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <hr className="border-border/60" />

              <div className="flex flex-1 flex-col gap-4">
                {sections.map((section) => (
                  <div key={section.title}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {section.title}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {section.items.map((item, idx) => (
                        <FeatureRow key={idx} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                {plan.disabled ? (
                  <Button
                    variant={plan.ctaPrimary ? "default" : "outline"}
                    size="sm"
                    disabled
                    className={`w-full ${
                      plan.ctaPrimary
                        ? "bg-navy text-white hover:bg-navy"
                        : ""
                    }`}
                    title="Disponível em breve. Hoje todos os anúncios são gratuitos."
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <a href="/cadastro" className="block">
                    <Button
                      size="sm"
                      className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold"
                    >
                      {plan.cta}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
