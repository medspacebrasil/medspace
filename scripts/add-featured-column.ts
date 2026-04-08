import pg from "pg"

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set")
}

const client = new pg.Client({ connectionString })

async function main() {
  await client.connect()
  console.log("Adding featured column to listings...")

  await client.query(`
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
  `)

  console.log("Done!")
  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
