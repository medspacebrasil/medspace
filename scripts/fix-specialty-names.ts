import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

/**
 * Conserta nomes de especialidades corrompidos em produção (ex.: a
 * especialidade "Clínica Médica" aparecendo com o caminho cru
 * "/anuncios?specialty=clinica-medica" como nome).
 *
 * Reaplica os nomes canônicos por slug e reporta qualquer especialidade cujo
 * nome ainda pareça uma URL. Idempotente. O seed não corrige isso porque seu
 * upsert usa `update: {}`.
 *
 * Uso:  npx tsx scripts/fix-specialty-names.ts
 */

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set")
}
const adapter = new PrismaPg(connectionString)
const prisma = new PrismaClient({ adapter })

// Mesma lista canônica do seed.
const SPECIALTIES = [
  "Cardiologia", "Dermatologia", "Endocrinologia", "Gastroenterologia",
  "Ginecologia", "Neurologia", "Oftalmologia", "Ortopedia",
  "Otorrinolaringologia", "Pediatria", "Psiquiatria", "Urologia",
  "Nutrologia", "Pneumologia", "Reumatologia",
  "Radiologia e Diagnóstico por Imagem", "Genética Médica",
  "Ginecologia e Obstetrícia", "Clínica Médica", "Mastologia",
  "Nefrologia", "Hematologia", "Infectologia", "Geriatria",
  "Alergia e Imunologia", "Oncologia", "Cirurgia Geral",
  "Cirurgia Plástica", "Cirurgia Vascular", "Medicina do Trabalho",
  "Medicina Esportiva", "Medicina de Família e Comunidade", "Anestesiologia",
]

// Idêntico ao slugify do seed (prisma/seed.ts): só normaliza acentos e troca
// espaços por hífen.
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
}

async function main() {
  // 1) Reporta especialidades com nome suspeito (URL/caminho).
  const all = await prisma.specialty.findMany()
  const suspeitas = all.filter(
    (s) => s.name.includes("/") || s.name.includes("?") || s.name.includes("=")
  )
  if (suspeitas.length > 0) {
    console.log("Especialidades com nome suspeito encontradas:")
    for (const s of suspeitas) {
      console.log(`  - slug="${s.slug}" name="${s.name}"`)
    }
  } else {
    console.log("Nenhum nome suspeito (URL) encontrado.")
  }

  // 2) Reaplica os nomes canônicos por slug.
  let corrigidas = 0
  for (const name of SPECIALTIES) {
    const slug = slugify(name)
    const existing = await prisma.specialty.findUnique({ where: { slug } })
    if (existing && existing.name !== name) {
      await prisma.specialty.update({ where: { slug }, data: { name } })
      console.log(`  corrigido: "${existing.name}" -> "${name}" (slug=${slug})`)
      corrigidas++
    }
  }

  console.log(`\nConcluído. ${corrigidas} nome(s) corrigido(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
