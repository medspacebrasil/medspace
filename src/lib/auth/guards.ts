import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * Sessão de clínica válida para operações de escrita (criar/editar/publicar).
 *
 * Diferente de `auth()`, isto re-valida o usuário no banco a cada chamada para
 * que um bloqueio feito pelo admin (`blockedAt`) tenha efeito IMEDIATO, mesmo
 * que o JWT da sessão atual ainda seja válido. Use apenas nos caminhos de
 * escrita sensíveis — não em renderização de página (custo de 1 query).
 *
 * Retorna `null` quando: não há sessão de clínica, o usuário sumiu, ou está
 * bloqueado. Os callers já tratam `null` como "Não autorizado".
 */
export async function getActiveClinicSession() {
  const session = await auth()
  if (!session?.user?.id || !session.user.clinicId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockedAt: true },
  })
  if (!user || user.blockedAt) return null

  return session
}
