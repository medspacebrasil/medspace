"use client"

import { useActionState, useEffect, useState } from "react"
import { createEducation, type ActionState } from "../actions"
import { EducationForm } from "@/components/forms/EducationForm"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"

export function NovoEducacaoClient() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEducation,
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
      <EducationForm formAction={formAction} state={state} isPending={isPending} />
    </>
  )
}
