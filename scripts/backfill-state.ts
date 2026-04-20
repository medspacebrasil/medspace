import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set")
}
const adapter = new PrismaPg(connectionString)
const prisma = new PrismaClient({ adapter })

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

// All 27 Brazilian state capitals + common major cities
// Keys are normalized (lowercase, no accents)
const CITY_TO_UF: Record<string, string> = {
  // Capitais
  "rio branco": "AC",
  "maceio": "AL",
  "macapa": "AP",
  "manaus": "AM",
  "salvador": "BA",
  "fortaleza": "CE",
  "brasilia": "DF",
  "vitoria": "ES",
  "goiania": "GO",
  "sao luis": "MA",
  "cuiaba": "MT",
  "campo grande": "MS",
  "belo horizonte": "MG",
  "belem": "PA",
  "joao pessoa": "PB",
  "curitiba": "PR",
  "recife": "PE",
  "teresina": "PI",
  "rio de janeiro": "RJ",
  "natal": "RN",
  "porto alegre": "RS",
  "porto velho": "RO",
  "boa vista": "RR",
  "florianopolis": "SC",
  "sao paulo": "SP",
  "aracaju": "SE",
  "palmas": "TO",
  // Cidades grandes frequentes
  "campinas": "SP",
  "guarulhos": "SP",
  "sao bernardo do campo": "SP",
  "santo andre": "SP",
  "osasco": "SP",
  "santos": "SP",
  "sorocaba": "SP",
  "ribeirao preto": "SP",
  "sao jose dos campos": "SP",
  "niteroi": "RJ",
  "duque de caxias": "RJ",
  "nova iguacu": "RJ",
  "sao goncalo": "RJ",
  "contagem": "MG",
  "uberlandia": "MG",
  "juiz de fora": "MG",
  "londrina": "PR",
  "maringa": "PR",
  "caxias do sul": "RS",
  "joinville": "SC",
  "feira de santana": "BA",
}

async function lookupStateForCity(city: string): Promise<string | null> {
  return CITY_TO_UF[normalize(city)] ?? null
}

async function main() {
  console.log("Backfilling state for listings with empty state...")

  const listings = await prisma.listing.findMany({
    where: { state: "" },
    select: { id: true, city: true, title: true },
  })

  console.log(`Found ${listings.length} listings to backfill`)

  const cityCache = new Map<string, string | null>()
  let updated = 0
  const ambiguous: string[] = []

  for (const l of listings) {
    let uf = cityCache.get(l.city)
    if (uf === undefined) {
      uf = await lookupStateForCity(l.city)
      cityCache.set(l.city, uf)
    }

    if (uf) {
      await prisma.listing.update({
        where: { id: l.id },
        data: { state: uf },
      })
      console.log(`  ✓ ${l.title} (${l.city}) → ${uf}`)
      updated++
    } else {
      console.warn(`  ⚠ Could not resolve state for "${l.city}" (listing: ${l.title})`)
      ambiguous.push(`${l.id} | ${l.city} | ${l.title}`)
    }
  }

  // Also backfill clinics
  console.log("\nBackfilling state for clinics with empty state...")
  const clinics = await prisma.clinic.findMany({
    where: { state: "" },
    select: { id: true, city: true, name: true },
  })

  console.log(`Found ${clinics.length} clinics to backfill`)

  for (const c of clinics) {
    let uf = cityCache.get(c.city)
    if (uf === undefined) {
      uf = await lookupStateForCity(c.city)
      cityCache.set(c.city, uf)
    }

    if (uf) {
      await prisma.clinic.update({
        where: { id: c.id },
        data: { state: uf },
      })
      console.log(`  ✓ ${c.name} (${c.city}) → ${uf}`)
    } else {
      console.warn(`  ⚠ Could not resolve state for clinic "${c.name}" city="${c.city}"`)
    }
  }

  console.log(`\nDone. Updated ${updated} listing states.`)
  if (ambiguous.length > 0) {
    console.warn(
      `\n${ambiguous.length} listings could not be resolved automatically. Edit them manually:`
    )
    ambiguous.forEach((a) => console.warn(`  - ${a}`))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
