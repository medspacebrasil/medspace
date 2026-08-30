import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"
import { expirePublications, activatePublication } from "@/lib/billing/orders"
import { getPayment } from "@/lib/asaas/client"
import { sendEmail } from "@/lib/email"
import { brasiliaDay } from "@/lib/metrics"

/**
 * Varredura diária da cobrança por publicação.
 *
 * Faz três coisas numa execução só, porque todas dependem do mesmo relógio:
 * tira do ar o que venceu, reprocessa evento de webhook que falhou, e avisa
 * quem está perto de vencer.
 *
 * Por que varredura e não verificação preguiçosa na leitura: as páginas
 * públicas passam por cache, então uma escrita durante a renderização seria
 * imprevisível, e ainda assim não cobriria o anúncio que ninguém acessa.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 60

function autorizado(header: string | null): boolean {
  const esperado = process.env.CRON_SECRET
  if (!esperado) return false
  const recebido = (header ?? "").replace(/^Bearer\s+/i, "")
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Dias inteiros até o vencimento, contados pelo calendário de Brasília. */
function diasAte(expiresAt: Date): number {
  const hoje = brasiliaDay().date.getTime()
  const fim = brasiliaDay(expiresAt).date.getTime()
  return Math.round((fim - hoje) / 86_400_000)
}

async function avisarVencimentos() {
  // D-7 e D-3. Dois toques bastam: mais que isso vira ruído e o anunciante
  // passa a ignorar o aviso justamente quando ele importa.
  const alvos = [7, 3]
  const pedidos = await prisma.publicationOrder.findMany({
    where: {
      status: "PAID",
      expiresAt: { gte: new Date() },
      listing: { status: "PUBLISHED" },
    },
    select: {
      id: true,
      listingTitle: true,
      expiresAt: true,
      expiryWarnedAt: true,
      clinic: { select: { user: { select: { email: true, name: true } } } },
    },
  })

  let enviados = 0
  for (const p of pedidos) {
    if (!p.expiresAt || !p.clinic?.user?.email) continue
    const dias = diasAte(p.expiresAt)
    if (!alvos.includes(dias)) continue
    // Já avisado hoje: evita reenvio se o cron rodar duas vezes.
    if (p.expiryWarnedAt && diasAte(p.expiryWarnedAt) === 0) continue

    const quando = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeZone: "America/Sao_Paulo",
    }).format(p.expiresAt)

    const texto =
      `Olá! O anúncio "${p.listingTitle}" sai do ar em ${dias} dias, no dia ${quando}.\n\n` +
      `Para mantê-lo publicado, acesse o painel e renove:\n` +
      `https://medspacebrasil.com.br/painel\n\n` +
      `MedSpace`

    try {
      await sendEmail({
        to: p.clinic.user.email,
        subject: `Seu anúncio sai do ar em ${dias} dias`,
        text: texto,
        html: texto.replace(/\n/g, "<br>"),
      })
      await prisma.publicationOrder.update({
        where: { id: p.id },
        data: { expiryWarnedAt: new Date() },
      })
      enviados++
    } catch (error) {
      // Falha de e-mail não pode derrubar a varredura: expirar anúncio é mais
      // importante que avisar.
      console.error("[cron] falha ao avisar vencimento", p.id, error)
    }
  }
  return enviados
}

/**
 * Reprocessa eventos que falharam e confere pedidos parados.
 *
 * O Asaas guarda evento por 14 dias e interrompe a fila depois de 15 falhas
 * seguidas, então depender só da reentrega do gateway deixaria pagamento sem
 * efeito. Aqui a fonte de verdade é sempre a API, nunca o payload guardado.
 */
async function reconciliar() {
  const pendentes = await prisma.asaasWebhookEvent.findMany({
    where: { processedAt: null, paymentId: { not: null } },
    orderBy: { receivedAt: "asc" },
    take: 30,
    select: { id: true, eventId: true, paymentId: true },
  })

  let recuperados = 0
  for (const ev of pendentes) {
    if (!ev.paymentId) continue
    try {
      const charge = await prisma.asaasCharge.findUnique({
        where: { asaasPaymentId: ev.paymentId },
        select: { id: true, orderId: true },
      })
      if (!charge) {
        // Evento de cobrança que não é nossa. Marca como processado para não
        // ficar reprocessando lixo para sempre.
        await prisma.asaasWebhookEvent.update({
          where: { id: ev.id },
          data: { processedAt: new Date(), error: null },
        })
        continue
      }

      const atual = await getPayment(ev.paymentId)
      await prisma.asaasCharge.update({
        where: { id: charge.id },
        data: { status: atual.status },
      })

      if (["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(atual.status)) {
        await activatePublication(charge.orderId, {
          settled: atual.status !== "CONFIRMED",
        })
        recuperados++
      }

      await prisma.asaasWebhookEvent.update({
        where: { id: ev.id },
        data: { processedAt: new Date(), error: null },
      })
    } catch (error) {
      console.error("[cron] falha ao reconciliar evento", ev.eventId, error)
    }
  }
  return recuperados
}

export async function GET(request: Request) {
  if (!autorizado(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const inicio = Date.now()
  const { expirados } = await expirePublications()
  if (expirados > 0) {
    // Sem isso o anúncio expirado continuaria aparecendo na listagem cacheada.
    revalidateTag("listings", "max")
  }

  const recuperados = await reconciliar()
  const avisados = await avisarVencimentos()

  const resumo = { expirados, recuperados, avisados, ms: Date.now() - inicio }
  console.log("[cron] varredura concluída", resumo)
  return NextResponse.json(resumo)
}
