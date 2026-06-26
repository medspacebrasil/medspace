import { z } from "zod/v4"

/**
 * Strip everything that isn't a digit. Lets users type phone numbers in any
 * format — (61) 98388-3162, 61 98388 3162, 61983883162 — and we store the
 * canonical digits-only form.
 */
function toDigits(v: unknown): unknown {
  return typeof v === "string" ? v.replace(/\D/g, "") : v
}

/** WhatsApp / phone: DDD + número = 10 or 11 digits, accepted in any format. */
export const whatsappSchema = z.preprocess(
  toDigits,
  z.string().regex(/^\d{10,11}$/, "WhatsApp deve ter 10 ou 11 dígitos (DDD + número)")
)

/** Optional landline/phone: same normalization, allows empty. */
export const optionalPhoneSchema = z.preprocess(
  toDigits,
  z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
    .optional()
    .or(z.literal(""))
)
