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
 */

const TYPES = new Set(["VIEW", "CONTACT"])

export async function POST(request: Request) {
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

  const userAgent = (await headers()).get("user-agent") ?? "unknown"

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
