"use client"

import { useActionState, useEffect, useState } from "react"
import { adminCreateListing, type AdminCreateListingState } from "@/app/admin/actions"
import { ListingForm } from "@/components/forms/ListingForm"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"

interface FilterOption {
  id: string
  name: string
  slug: string
}

interface Props {
  clinicId: string
  defaultCity: string
  defaultState: string
  defaultNeighborhood: string
  defaultWhatsapp: string
  specialties: FilterOption[]
  roomTypes: FilterOption[]
  equipment: FilterOption[]
}

export function AdminNewListingClient({
  clinicId,
  defaultCity,
  defaultState,
  defaultNeighborhood,
  defaultWhatsapp,
  specialties,
  roomTypes,
  equipment,
}: Props) {
  const [state, formAction, isPending] = useActionState<
    AdminCreateListingState,
    FormData
  >(adminCreateListing, { success: false })

  // No sucesso a action redireciona; só recebemos retorno em caso de erro.
  const [modalOpen, setModalOpen] = useState(false)
  useEffect(() => {
    if (!state.success && state.errors) setModalOpen(true)
  }, [state])

  // Wrap formAction so we always inject the clinicId
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
      <ListingForm
        formAction={wrappedAction}
        state={state}
        isPending={isPending}
        defaultValues={{
          title: "",
          description: "",
          fullDescription: "",
          city: defaultCity,
          state: defaultState,
          neighborhood: defaultNeighborhood,
          whatsapp: defaultWhatsapp,
          roomTypeId: "",
          specialtyIds: [],
          equipmentIds: [],
        }}
        specialties={specialties}
        roomTypes={roomTypes}
        equipment={equipment}
      />
    </>
  )
}
