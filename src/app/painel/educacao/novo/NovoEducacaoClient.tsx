"use client"

import { useActionState } from "react"
import { createEducation, type ActionState } from "../actions"
import { EducationForm } from "@/components/forms/EducationForm"

export function NovoEducacaoClient() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEducation,
    { success: false }
  )

  return <EducationForm formAction={formAction} state={state} isPending={isPending} />
}
