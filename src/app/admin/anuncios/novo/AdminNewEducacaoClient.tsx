"use client"

import { useActionState, useEffect, useState } from "react"
import { adminCreateEducation, type AdminCreateListingState } from "@/app/admin/actions"
import { EducationForm } from "@/components/forms/EducationForm"
import { SaveStatusModal } from "@/components/ui/SaveStatusModal"

interface Props {
  clinicId: string
  defaultCity: string
  defaultState: string
  defaultWhatsapp: string
}

export function AdminNewEducacaoClient({
  clinicId,
  defaultCity,
  defaultState,
  defaultWhatsapp,
}: Props) {
  const [state, formAction, isPending] = useActionState<
    AdminCreateListingState,
    FormData
  >(adminCreateEducation, { success: false })

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
      <EducationForm
        formAction={wrappedAction}
        state={state}
        isPending={isPending}
        defaultValues={{
          title: "",
          educationType: "",
          area: "",
          description: "",
          audience: "",
          educationModality: "",
          workload: "",
          duration: "",
          city: defaultCity,
          state: defaultState,
          investment: "",
          whatsapp: defaultWhatsapp,
          externalLink: "",
        }}
      />
    </>
  )
}
