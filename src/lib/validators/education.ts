import { z } from "zod/v4"

export const EDUCATION_TYPES = [
  "MENTORIA",
  "CURSO",
  "POS_GRADUACAO",
  "EVENTO",
  "OUTRO",
] as const

export const EDUCATION_MODALITIES = ["PRESENCIAL", "ONLINE", "HIBRIDO"] as const

export type EducationType = (typeof EDUCATION_TYPES)[number]
export type EducationModality = (typeof EDUCATION_MODALITIES)[number]

export const EDUCATION_TYPE_LABELS: Record<EducationType, string> = {
  MENTORIA: "Mentoria",
  CURSO: "Curso",
  POS_GRADUACAO: "Pós-Graduação",
  EVENTO: "Evento ou congresso",
  OUTRO: "Outro",
}

export const EDUCATION_MODALITY_LABELS: Record<EducationModality, string> = {
  PRESENCIAL: "Presencial",
  ONLINE: "Online",
  HIBRIDO: "Híbrido",
}

export const createEducationSchema = z
  .object({
    title: z
      .string()
      .min(5, "Título deve ter no mínimo 5 caracteres")
      .max(100, "Título deve ter no máximo 100 caracteres"),
    educationType: z.enum(EDUCATION_TYPES, {
      message: "Selecione o tipo de oportunidade",
    }),
    // Área / especialidade em texto livre (ex.: "Cardiologia, Gestão médica").
    area: z.string().max(300, "Área muito longa").optional(),
    description: z
      .string()
      .min(10, "Descrição deve ter no mínimo 10 caracteres")
      .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
    audience: z.string().max(300, "Texto muito longo").optional(),
    educationModality: z.enum(EDUCATION_MODALITIES, {
      message: "Selecione o formato",
    }),
    workload: z.string().max(60, "Carga horária muito longa").optional(),
    duration: z.string().max(120, "Duração muito longa").optional(),
    city: z.string().max(100, "Nome da cidade muito longo").optional().default(""),
    state: z.string().max(2).optional().default(""),
    investment: z.string().max(120, "Texto muito longo").optional(),
    whatsapp: z
      .string()
      .regex(/^\d{10,11}$/, "WhatsApp deve ter 10 ou 11 dígitos"),
    externalLink: z
      .url("Link inválido (inclua https://)")
      .max(300, "Link muito longo")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Localização é obrigatória quando o formato envolve presença física.
    const needsCity =
      data.educationModality === "PRESENCIAL" || data.educationModality === "HIBRIDO"
    if (needsCity && (!data.city || data.city.trim().length < 2)) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "Cidade é obrigatória para formato presencial ou híbrido",
      })
    }
  })

export const updateEducationSchema = z
  .object({
    title: z.string().min(5).max(100).optional(),
    educationType: z.enum(EDUCATION_TYPES).optional(),
    area: z.string().max(300).optional(),
    description: z.string().min(10).max(2000).optional(),
    audience: z.string().max(300).optional(),
    educationModality: z.enum(EDUCATION_MODALITIES).optional(),
    workload: z.string().max(60).optional(),
    duration: z.string().max(120).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(2).optional(),
    investment: z.string().max(120).optional(),
    whatsapp: z.string().regex(/^\d{10,11}$/).optional(),
    externalLink: z.url().max(300).optional(),
  })
  .superRefine((data, ctx) => {
    const needsCity =
      data.educationModality === "PRESENCIAL" || data.educationModality === "HIBRIDO"
    if (needsCity && data.city !== undefined && data.city.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "Cidade é obrigatória para formato presencial ou híbrido",
      })
    }
  })

export type CreateEducationInput = z.infer<typeof createEducationSchema>
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>
