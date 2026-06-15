export const dynamic = "force-dynamic"

import { NovoEducacaoClient } from "./NovoEducacaoClient"

export default function NovoEducacaoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Nova Oportunidade Educacional</h1>
      <p className="text-muted-foreground">
        Anuncie uma mentoria, curso, pós-graduação ou evento. Após enviar, o
        anúncio passa por uma análise rápida antes de ficar visível.
      </p>
      <div className="mt-6">
        <NovoEducacaoClient />
      </div>
    </div>
  )
}
