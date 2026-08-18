import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { recordListingEvent } from "@/lib/metrics"
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit"

/**
 * Registro de interesse em um anúncio (visualização ou contato).
 *
 * Responde 204 em todos os caminhos de sucesso, inclusive quando o evento é
 * descartado por duplicidade: quem chama é um beacon do navegador que não trata
 * resposta, e diferenciar os casos só serviria para alguém sondar se um
 * visitante já passou por ali hoje.
 *
 * Este número vira base de cobrança do anunciante, então ele precisa resistir a
 * inflação. Duas defesas antes de qualquer gravação: a requisição tem que vir de
 * uma página do próprio site, e user-agent de robô é descartado.
 */

const TYPES = new Set(["VIEW", "CONTACT"])

/**
 * Robôs que executam JavaScript contariam visualização como gente. Só entram
 * aqui tokens que nunca aparecem em navegador real de usuário.
 */
const BOT_UA =
  /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|lighthouse|curl\/|wget|python-requests|axios\/|node-fetch|go-http-client|java\/|okhttp|semrush|ahrefs|mj12|dotbot|petalbot|bingpreview|facebookexternalhit|whatsapp|telegrambot|pingdom|gtmetrix|uptimerobot/i

/**
 * Aceita apenas requisições originadas de uma página do próprio site. Sem isso
 * qualquer um inflaria o contador de um anúncio com um laço de curl.
 * Navegadores enviam Origin em POST via fetch e via sendBeacon; o Referer entra
 * como segunda chance antes de recusar.
 */
function sameOrigin(origin: string | null, referer: string | null, host: string | null): boolean {
  if (!host) return false
  const matches = (value: string | null) => {
    if (!value) return false
    try {
      return new URL(value).host === host
    } catch {
      return false
    }
  }
  if (origin) return matches(origin)
  if (referer) return matches(referer)
  return false
}

export async function POST(request: Request) {
  const h = await headers()
  const userAgent = h.get("user-agent") ?? ""

  if (!sameOrigin(h.get("origin"), h.get("referer"), h.get("host"))) {
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 })
  }
  if (!userAgent || BOT_UA.test(userAgent)) {
    // 204 de propósito: o robô não precisa saber que foi filtrado, e devolver
    // erro só encheria log de ruído.
    return new NextResponse(null, { status: 204 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const { listingId, type } = (body ?? {}) as {
    listingId?: unknown
    type?: unknown
  }

  if (typeof listingId !== "string" || !listingId || typeof type !== "string") {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  }
  if (!TYPES.has(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  const ip = await getClientIp()
  const limit = await rateLimit(RATE_LIMITS.metrics, ip)
  if (!limit.success) {
    return NextResponse.json(
      { error: "Muitas requisições" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    )
  }

  // Só conta anúncio publicado. Sem isso daria para inflar o número de um
  // rascunho ou de um anúncio já removido, que ninguém consegue ver no site.
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "PUBLISHED" },
    select: { id: true },
  })
  if (!listing) {
    return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 })
  }

  try {
    await recordListingEvent({
      listingId,
      type: type as "VIEW" | "CONTACT",
      ip,
      userAgent,
    })
  } catch (error) {
    // Métrica nunca deve derrubar a experiência de quem está navegando.
    console.error("[metrics] falha ao registrar evento:", error)
  }

  return new NextResponse(null, { status: 204 })
}
