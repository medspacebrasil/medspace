"use client"

import { useActionState } from "react"
import { adminCreateEducation, type AdminCreateListingState } from "@/app/admin/actions"
import { EducationForm } from "@/components/forms/EducationForm"

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

  const wrappedAction = (formData: FormData) => {
    formData.set("clinicId", clinicId)
    return formAction(formData)
  }

  return (
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
  )
}
