"use client"

import { useActionState, useEffect, useState } from "react"
import { adminCreateEquipment, type AdminCreateListingState } from "@/app/admin/actions"
import { EquipmentForm } from "@/components/forms/EquipmentForm"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"

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

  // No sucesso a action redireciona; só recebemos retorno em caso de erro.
  const [modalOpen, setModalOpen] = useState(false)
  useEffect(() => {
    if (!state.success && state.errors) setModalOpen(true)
  }, [state])

  const wrappedAction = (formData: FormData) => {
    formData.set("clinicId", clinicId)
    return formAction(formData)
  }

  return (
    <>
      <SaveStatusModal
        open={modalOpen}
        status="error"
        message={state.errors?._form?.[0] ?? "Verifique os campos destacados no formulário."}
        onClose={() => setModalOpen(false)}
      />
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
    </>
  )
}
