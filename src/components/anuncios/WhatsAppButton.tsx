"use client"

import { formatWhatsAppUrl } from "@/lib/utils"
import { trackWhatsAppLead, type LeadSource } from "@/lib/analytics"
import { reportListingContact } from "@/lib/metrics/client"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
  phone: string
  message?: string
  className?: string
  /**
   * Anúncio que originou o contato. Opcional para não quebrar usos antigos,
   * mas sem ele o lead entra no relatório sem dono.
   */
  source?: LeadSource
}

export function WhatsAppButton({
  phone,
  message,
  className,
  source,
}: WhatsAppButtonProps) {
  const url = formatWhatsAppUrl(phone, message)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        trackWhatsAppLead(source)
        if (source) reportListingContact(source.listingId)
      }}
    >
      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
        <MessageCircle className="h-5 w-5" />
        Entrar em Contato via WhatsApp
      </Button>
    </a>
  )
}
