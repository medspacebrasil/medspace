"use client"

import { useActionState, useEffect, useState } from "react"
import { createEquipment, type ActionState } from "../actions"
import { EquipmentForm } from "@/components/forms/EquipmentForm"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"

interface Props {
  categories: { id: string; name: string; slug: string }[]
}

export function NovoAparelhoClient({ categories }: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEquipment,
    { success: false }
  )

  // Criação redireciona no sucesso, então só o caminho de erro chega aqui.
  const [saveStatus, setSaveStatus] = useState<"error" | null>(null)
  useEffect(() => {
    if (!state.success && state.errors) setSaveStatus("error")
  }, [state])

  return (
    <>
      <SaveStatusModal
        open={saveStatus !== null}
        status="error"
        message={
          state.errors?._form?.[0] ??
          "Verifique os campos destacados no formulário."
        }
        onClose={() => setSaveStatus(null)}
      />
      <EquipmentForm
        formAction={formAction}
        state={state}
        isPending={isPending}
        categories={categories}
      />
    </>
  )
}
