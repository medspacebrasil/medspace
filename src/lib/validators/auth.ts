import { z } from "zod/v4"

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
})

export const registerSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  clinicName: z.string().min(2, "Nome da clínica deve ter no mínimo 2 caracteres"),
  whatsapp: z
    .string()
    .regex(/^\d{10,11}$/, "WhatsApp deve ter 10 ou 11 dígitos (DDD + número)"),
  city: z.string().min(2, "Cidade é obrigatória"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
