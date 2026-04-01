import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import slugifyLib from "slugify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: "pt",
  })
}

export function formatWhatsAppUrl(
  phone: string,
  message?: string
): string {
  const cleanPhone = phone.replace(/\D/g, "")
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
  const defaultMessage =
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE ??
    "Olá, vi seu anúncio no MedSpace e tenho interesse!"
  const encodedMessage = encodeURIComponent(message ?? defaultMessage)
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "")
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  }
  return phone
}
