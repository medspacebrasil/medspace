"use client"

import { useActionState } from "react"
import { adminCreateEquipment, type AdminCreateListingState } from "@/app/admin/actions"
import { EquipmentForm } from "@/components/forms/EquipmentForm"

interface Props {
  clinicId: string
  defaultCity: string
  defaultNeighborhood: string
  defaultWhatsapp: string
  categories: { id: string; name: string; slug: string }[]
}

export function AdminNewAparelhoClient({
  clinicId,
  defaultCity,
  defaultNeighborhood,
  defaultWhatsapp,
  categories,
}: Props) {
  const [state, formAction, isPending] = useActionState<
    AdminCreateListingState,
    FormData
  >(adminCreateEquipment, { success: false })

  const wrappedAction = (formData: FormData) => {
    formData.set("clinicId", clinicId)
    return formAction(formData)
  }

  return (
    <EquipmentForm
      formAction={wrappedAction}
      state={state}
      isPending={isPending}
      defaultValues={{
        title: "",
        description: "",
        fullDescription: "",
        city: defaultCity,
        neighborhood: defaultNeighborhood,
        whatsapp: defaultWhatsapp,
        equipmentCategoryId: "",
        brand: "",
        model: "",
        condition: "",
      }}
      categories={categories}
    />
  )
}
