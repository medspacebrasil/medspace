"use client"

import { useActionState } from "react"
import { createEquipment, type ActionState } from "../actions"
import { EquipmentForm } from "@/components/forms/EquipmentForm"

interface Props {
  categories: { id: string; name: string; slug: string }[]
}

export function NovoAparelhoClient({ categories }: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createEquipment,
    { success: false }
  )

  return (
    <EquipmentForm
      formAction={formAction}
      state={state}
      isPending={isPending}
      categories={categories}
    />
  )
}
