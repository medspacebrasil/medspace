import { z } from "zod/v4"

export const createListingSchema = z.object({
  title: z
    .string()
    .min(5, "Título deve ter no mínimo 5 caracteres")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(300, "Descrição curta deve ter no máximo 300 caracteres"),
  fullDescription: z.string().optional(),
  city: z.string().min(2, "Cidade é obrigatória"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  whatsapp: z
    .string()
    .regex(/^\d{10,11}$/, "WhatsApp deve ter 10 ou 11 dígitos"),
  roomTypeId: z.string().optional(),
  specialtyIds: z.array(z.string()).min(1, "Selecione ao menos 1 especialidade"),
  equipmentIds: z.array(z.string()).default([]),
})

export const updateListingSchema = createListingSchema.partial()

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
