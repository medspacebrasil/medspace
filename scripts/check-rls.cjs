// Conferencia: lista as tabelas do schema public que estao sem Row Level Security.
// Uso: node -r dotenv/config scripts/check-rls.cjs
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL nao definida")
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) })

async function main() {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  )
  const off = rows.filter((r) => !r.rowsecurity).map((r) => r.tablename)

  console.log(`tabelas em public: ${rows.length}`)
  console.log(`com RLS: ${rows.length - off.length}`)
  console.log(`SEM RLS: ${off.length ? off.join(", ") : "(nenhuma)"}`)

  // O app conecta como dono das tabelas, que ignora RLS. Se estes contadores
  // vierem zerados ou derem erro, o RLS quebrou o acesso da aplicacao.
  const [users, clinics, listings] = await Promise.all([
    prisma.user.count(),
    prisma.clinic.count(),
    prisma.listing.count(),
  ])
  console.log(`\nleitura pelo app: ${users} usuarios, ${clinics} clinicas, ${listings} anuncios`)
}

main()
  .catch((e) => {
    console.error(e.message ?? e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
