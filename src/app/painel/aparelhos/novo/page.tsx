export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { NovoAparelhoClient } from "./NovoAparelhoClient"

export default async function NovoAparelhoPage() {
  const categories = await prisma.equipmentCategory.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Novo Aparelho</h1>
      <p className="text-muted-foreground">
        Preencha os dados do aparelho que deseja anunciar para locação
      </p>
      <div className="mt-6">
        <NovoAparelhoClient categories={categories} />
      </div>
    </div>
  )
}
