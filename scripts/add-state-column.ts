import pg from "pg"

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set")
}

const client = new pg.Client({ connectionString })

async function main() {
  await client.connect()
  console.log("Adding state column to listings and clinics...")

  await client.query(`
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT '';
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT '';
  `)

  console.log("Done!")
  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
