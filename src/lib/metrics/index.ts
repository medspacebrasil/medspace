import { createHash } from "node:crypto"
import { Prisma, type ListingEventType } from "@prisma/client"
import { prisma } from "@/lib/db"

/**
 * Contagem de interesse por anúncio (visualizações e contatos).
 *
 * Por que no nosso banco e não só no Google Analytics: o GA4 depende do aceite
 * do banner de cookies, então subconta. O número que a MedSpace mostra para a
 * clínica na hora de cobrar precisa ser completo e verificável, e é este.
 *
 * LGPD: não guardamos IP nem user-agent. O que fica é um hash com sal de
 * (IP + user-agent + dia). Como o dia entra no hash, ele muda a cada 24h e não
 * permite acompanhar a mesma pessoa ao longo do tempo — serve só para não
 * contar duas vezes o mesmo visitante no mesmo dia.
 */

const HASH_SALT =
  process.env.METRICS_HASH_SALT ?? process.env.AUTH_SECRET ?? "medspace-metrics"

// O sal precisa ser estavel: se mudar, todo visitante vira "novo" e o mesmo
// acesso passa a contar de novo. Por isso nao deve ficar amarrado ao
// AUTH_SECRET, que e rotacionado por outro motivo (sessoes).
if (!process.env.METRICS_HASH_SALT && process.env.NODE_ENV === "production") {
  console.warn(
    "[metricas] METRICS_HASH_SALT nao definido: a deduplicacao esta usando o AUTH_SECRET. " +
      "Rotacionar o AUTH_SECRET zeraria a deduplicacao e inflaria a contagem."
  )
}

const BRASILIA = "America/Sao_Paulo"
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BRASILIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/**
 * Dia corrente no fuso de Brasília. O relatório é lido por pessoas que pensam
 * em "hoje" no horário de Brasília, então o corte do dia segue esse fuso, não o
 * UTC do servidor.
 */
export function brasiliaDay(date: Date = new Date()): { key: string; date: Date } {
  const key = dayFormatter.format(date)
  return { key, date: new Date(`${key}T00:00:00.000Z`) }
}

export function visitorHash(ip: string, userAgent: string, dayKey: string): string {
  return createHash("sha256")
    .update(`${HASH_SALT}|${ip}|${userAgent}|${dayKey}`)
    .digest("hex")
    .slice(0, 32)
}

export interface RecordEventInput {
  listingId: string
  type: ListingEventType
  ip: string
  userAgent: string
  /** Injetável nos testes para fixar o dia. */
  now?: Date
}

/**
 * Registra um evento e incrementa o agregado do dia.
 *
 * Retorna `false` quando o mesmo visitante já gerou esse evento para esse
 * anúncio hoje. Contato também é deduplicado por dia: quem clica duas vezes no
 * WhatsApp é um lead, não dois, e inflar esse número corromperia justamente a
 * conversa comercial que ele existe para sustentar.
 */
export async function recordListingEvent({
  listingId,
  type,
  ip,
  userAgent,
  now,
}: RecordEventInput): Promise<boolean> {
  const day = brasiliaDay(now)
  const hash = visitorHash(ip, userAgent, day.key)
  const dedupeKey = `${listingId}:${type}:${hash}:${day.key}`
  const isView = type === "VIEW"

  try {
    await prisma.$transaction([
      prisma.listingEvent.create({
        data: { listingId, type, visitorHash: hash, dedupeKey },
      }),
      prisma.listingDailyStat.upsert({
        where: { listingId_day: { listingId, day: day.date } },
        create: {
          listingId,
          day: day.date,
          views: isView ? 1 : 0,
          contacts: isView ? 0 : 1,
        },
        update: isView
          ? { views: { increment: 1 } }
          : { contacts: { increment: 1 } },
      }),
    ])
    return true
  } catch (error) {
    // P2002 = violação de unicidade do dedupeKey: visitante repetido no mesmo
    // dia. É o caminho esperado, não um erro.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      String(error.meta?.target ?? "").includes("dedupe_key")
    ) {
      return false
    }
    throw error
  }
}

export interface ListingMetrics {
  views: number
  contacts: number
}

/** Totais de um anúncio nos últimos `days` dias, incluindo hoje. */
export async function listingMetricsSince(
  listingIds: string[],
  days: number
): Promise<Map<string, ListingMetrics>> {
  const result = new Map<string, ListingMetrics>()
  if (listingIds.length === 0) return result

  const from = brasiliaDay().date
  from.setUTCDate(from.getUTCDate() - (days - 1))

  const rows = await prisma.listingDailyStat.groupBy({
    by: ["listingId"],
    where: { listingId: { in: listingIds }, day: { gte: from } },
    _sum: { views: true, contacts: true },
  })

  for (const row of rows) {
    result.set(row.listingId, {
      views: row._sum.views ?? 0,
      contacts: row._sum.contacts ?? 0,
    })
  }
  return result
}

export interface ListingInterestRow {
  listingId: string
  title: string
  clinicName: string
  clinicId: string
  city: string
  type: string
  views: number
  contacts: number
}

/**
 * Ranking de anúncios por interesse recebido no período.
 *
 * Ordena por contatos e usa visualizações como desempate: contato é o que
 * sustenta a conversa de cobrança, visualização sozinha só mostra alcance.
 * Inclui anúncios com zero para que a lista sirva também para identificar quem
 * está publicado e não recebe procura.
 */
export async function listingInterestRanking(
  days: number
): Promise<ListingInterestRow[]> {
  const from = brasiliaDay().date
  from.setUTCDate(from.getUTCDate() - (days - 1))

  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      city: true,
      type: true,
      clinicId: true,
      clinic: { select: { name: true } },
    },
  })

  const totals = await prisma.listingDailyStat.groupBy({
    by: ["listingId"],
    where: { day: { gte: from } },
    _sum: { views: true, contacts: true },
  })
  const byListing = new Map(totals.map((t) => [t.listingId, t._sum]))

  return listings
    .map((l) => {
      const sum = byListing.get(l.id)
      return {
        listingId: l.id,
        title: l.title,
        clinicName: l.clinic.name,
        clinicId: l.clinicId,
        city: l.city,
        type: l.type as string,
        views: sum?.views ?? 0,
        contacts: sum?.contacts ?? 0,
      }
    })
    .sort((a, b) => b.contacts - a.contacts || b.views - a.views)
}
