import { z } from "zod/v4"
import { whatsappSchema } from "./phone"

// Base sem refinements: updateListingSchema precisa de .partial(), que não
// existe em ZodEffects (resultado do superRefine).
const baseListingSchema = z.object({
  title: z
    .string()
    .min(5, "Título deve ter no mínimo 5 caracteres")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(300, "Descrição curta deve ter no máximo 300 caracteres"),
  fullDescription: z.string().max(5000, "Descrição completa muito longa").optional(),
  city: z.string().min(2, "Cidade é obrigatória").max(100, "Nome da cidade muito longo"),
  state: z.string().max(2).default(""),
  neighborhood: z.string().min(2, "Bairro é obrigatório").max(100, "Nome do bairro muito longo"),
  whatsapp: whatsappSchema,
  roomTypeId: z.string().optional(),
  // "Atende todas as especialidades": quando true, dispensa a seleção
  // individual (ver superRefine do create).
  allSpecialties: z.boolean().optional().default(false),
  specialtyIds: z.array(z.string()).default([]),
  equipmentIds: z.array(z.string()).default([]),
  customSpecialties: z
    .string()
    .max(500, "Especialidades adicionais muito longas")
    .optional(),
  customEquipment: z
    .string()
    .max(500, "Recursos adicionais muito longos")
    .optional(),
  requiresRqe: z.coerce.boolean().optional().default(false),
})

export const createListingSchema = baseListingSchema.superRefine((data, ctx) => {
  if (!data.allSpecialties && data.specialtyIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["specialtyIds"],
      message:
        "Selecione ao menos 1 especialidade ou marque “Atende todas as especialidades”",
    })
  }
})

export const updateListingSchema = baseListingSchema.partial()

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
