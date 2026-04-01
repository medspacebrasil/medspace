"use client"

import { useActionState } from "react"
import { createListing, type ActionState } from "../actions"
import { ListingForm } from "@/components/forms/ListingForm"

export default function NovoAnuncioPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createListing,
    { success: false }
  )

  return (
    <div>
      <h1 className="text-2xl font-bold">Novo Anúncio</h1>
      <p className="text-muted-foreground">
        Preencha os dados do espaço que deseja anunciar
      </p>
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
