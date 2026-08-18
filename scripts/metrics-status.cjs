// Situacao da coleta de metricas por anuncio. Somente leitura.
// Uso: node -r dotenv/config scripts/metrics-status.cjs
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })

async function main() {
  const [eventos, dias, publicados] = await Promise.all([
    prisma.listingEvent.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.listingDailyStat.findMany({
      orderBy: { day: "desc" },
      take: 5,
      select: { day: true, views: true, contacts: true, listingId: true },
    }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
  ])

  console.log(`anuncios publicados: ${publicados}`)
  console.log("eventos por tipo:", eventos.length ? eventos.map((e) => `${e.type}=${e._count._all}`).join(", ") : "(nenhum ainda)")
  console.log(`linhas de agregado diario: ${dias.length}`)
  for (const d of dias) {
    console.log(`  ${d.day.toISOString().slice(0, 10)}  views=${d.views} contatos=${d.contacts}  ${d.listingId}`)
  }
}

main()
  .catch((e) => { console.error(e.message ?? e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
