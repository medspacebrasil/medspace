import path from "node:path"
import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"

loadEnv({ path: path.join(__dirname, ".env") })

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  migrate: {
    async url() {
      return process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? ""
    },
  },
})
