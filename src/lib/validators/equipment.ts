import { z } from "zod/v4"

export const createEquipmentSchema = z.object({
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
  whatsapp: z
    .string()
    .regex(/^\d{10,11}$/, "WhatsApp deve ter 10 ou 11 dígitos"),
  equipmentCategoryId: z.string().min(1, "Selecione a categoria do aparelho"),
  brand: z.string().max(80, "Marca muito longa").optional(),
  model: z.string().max(80, "Modelo muito longo").optional(),
  condition: z.enum(["NOVO", "SEMINOVO", "USADO"]).optional(),
})

export const updateEquipmentSchema = createEquipmentSchema.partial()

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>
