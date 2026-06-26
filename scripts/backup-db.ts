/**
 * Backup lógico completo do banco para JSON (uma cópia por tabela num único
 * arquivo com timestamp em backups/). Read-only — não altera nada no banco.
 *
 * Uso: npx tsx scripts/backup-db.ts
 */
import "dotenv/config"
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL/DIRECT_URL não configurado")
  const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) })

  // Cada tabela é dumpada isoladamente: se uma não existir no banco (drift de
  // db push), registramos o erro mas não abortamos o backup das demais.
  async function safe<T>(name: string, fn: () => Promise<T>): Promise<T | { __error: string }> {
    try {
      return await fn()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn(`  [aviso] ${name}: ${msg.split("\n")[0]}`)
      return { __error: msg }
    }
  }

  const dump = {
    exportedAt: new Date().toISOString(),
    users: await safe("users", () => prisma.user.findMany()),
    passwordResetTokens: await safe("passwordResetTokens", () => prisma.passwordResetToken.findMany()),
    clinics: await safe("clinics", () => prisma.clinic.findMany()),
    listings: await safe("listings", () => prisma.listing.findMany()),
    equipmentCategories: await safe("equipmentCategories", () => prisma.equipmentCategory.findMany()),
    listingImages: await safe("listingImages", () => prisma.listingImage.findMany()),
    specialties: await safe("specialties", () => prisma.specialty.findMany()),
    equipment: await safe("equipment", () => prisma.equipment.findMany()),
    roomTypes: await safe("roomTypes", () => prisma.roomType.findMany()),
    listingSpecialties: await safe("listingSpecialties", () => prisma.listingSpecialty.findMany()),
    listingEquipment: await safe("listingEquipment", () => prisma.listingEquipment.findMany()),
  }

  const dir = join(process.cwd(), "backups")
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const file = join(dir, `backup-${stamp}.json`)
  writeFileSync(file, JSON.stringify(dump, null, 2), "utf-8")

  console.log("Backup salvo em:", file)
  console.log("Contagens por tabela:")
  for (const [k, v] of Object.entries(dump)) {
    if (Array.isArray(v)) console.log(`  ${k}: ${v.length}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("Falha no backup:", e)
  process.exit(1)
})
