import { prisma } from "@/lib/db"

/**
 * Normalize taxonomy ids coming from a form (specialties/equipment) before
 * writing the join rows: drop empties, dedupe, and keep only ids that still
 * exist in the taxonomy.
 *
 * Without this, a form that submits a stale id (a page cached before the
 * taxonomy was re-seeded) or a duplicate id crashes the whole save with a
 * Prisma P2003 (foreign key) / P2002 (unique) error, surfaced to the user as
 * the generic "Erro ao atualizar anúncio". Filtering makes the save
 * self-healing: it persists the valid subset instead of failing.
 */
export async function validSpecialtyIds(ids: readonly (string | File)[]): Promise<string[]> {
  const unique = dedupe(ids)
  if (unique.length === 0) return []
  const rows = await prisma.specialty.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  })
  const ok = new Set(rows.map((r) => r.id))
  return unique.filter((id) => ok.has(id))
}

export async function validEquipmentIds(ids: readonly (string | File)[]): Promise<string[]> {
  const unique = dedupe(ids)
  if (unique.length === 0) return []
  const rows = await prisma.equipment.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  })
  const ok = new Set(rows.map((r) => r.id))
  return unique.filter((id) => ok.has(id))
}

function dedupe(ids: readonly (string | File)[]): string[] {
  return [...new Set(ids.filter((v): v is string => typeof v === "string" && v.length > 0))]
}
