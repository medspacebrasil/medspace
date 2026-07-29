"use client"

import { useActionState, useEffect, useState } from "react"
import { createListing, type ActionState } from "../actions"
import { ListingForm } from "@/components/forms/ListingForm"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"

export default function NovoAnuncioPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createListing,
    { success: false }
  )

  // Criação redireciona no sucesso, então só o caminho de erro chega aqui.
  const [saveStatus, setSaveStatus] = useState<"error" | null>(null)
  useEffect(() => {
    if (!state.success && state.errors) setSaveStatus("error")
  }, [state])

  return (
    <div>
      <h1 className="text-2xl font-bold">Novo Anúncio</h1>
      <p className="text-muted-foreground">
        Preencha os dados do espaço que deseja anunciar
      </p>

      <SaveStatusModal
        open={saveStatus !== null}
        status="error"
        message={
          state.errors?._form?.[0] ??
          "Verifique os campos destacados no formulário."
        }
        onClose={() => setSaveStatus(null)}
      />

      <div className="mt-6">
        <ListingForm
          formAction={formAction}
          state={state}
          isPending={isPending}
        />
      </div>
    </div>
  )
}
