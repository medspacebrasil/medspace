import { z } from "zod/v4"
import { isValidCPF, isValidCNPJ, onlyDigits } from "./document"

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
})

export const TERMS_VERSION = "2026-05-09"

// Medico anuncia como pessoa fisica (CPF); os demais perfis sao PJ (CNPJ).
export const ADVERTISER_TYPES = [
  "MEDICO",
  "CLINICA",
  "EMPRESA",
  "COWORKING",
  "INSTITUICAO",
] as const

export type AdvertiserType = (typeof ADVERTISER_TYPES)[number]

export function documentTypeFor(advertiserType: AdvertiserType): "CPF" | "CNPJ" {
  return advertiserType === "MEDICO" ? "CPF" : "CNPJ"
}

export const registerSchema = z
  .object({
    email: z.email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(128, "Senha muito longa"),
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
    advertiserType: z.enum(ADVERTISER_TYPES, {
      message: "Selecione o tipo de anunciante",
    }),
    clinicName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(150, "Nome muito longo"),
    document: z.string().min(1, "Documento é obrigatório"),
    whatsapp: z
      .string()
      .regex(/^\d{10,11}$/, "WhatsApp deve ter 10 ou 11 dígitos (DDD + número)"),
    city: z.string().min(2, "Cidade é obrigatória").max(100, "Nome da cidade muito longo"),
    state: z.string().max(2).default(""),
    neighborhood: z.string().min(2, "Bairro é obrigatório").max(100, "Nome do bairro muito longo"),
    acceptTerms: z
      .literal("on", {
        message: "Você precisa concordar com os Termos de Uso e Política de Privacidade",
      }),
    marketingOptIn: z.coerce.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const expected = documentTypeFor(data.advertiserType)
    const valid = expected === "CPF" ? isValidCPF(data.document) : isValidCNPJ(data.document)
    if (!valid) {
      ctx.addIssue({
        code: "custom",
        path: ["document"],
        message: expected === "CPF" ? "CPF inválido" : "CNPJ inválido",
      })
    }
  })
  // Normaliza o documento para apenas digitos antes de persistir.
  .transform((data) => ({ ...data, document: onlyDigits(data.document) }))

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
