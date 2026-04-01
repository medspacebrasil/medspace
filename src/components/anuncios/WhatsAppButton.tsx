"use client"

import { formatWhatsAppUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
  phone: string
  message?: string
  className?: string
}

export function WhatsAppButton({
  phone,
  message,
  className,
}: WhatsAppButtonProps) {
  const url = formatWhatsAppUrl(phone, message)

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
        <MessageCircle className="h-5 w-5" />
        Entrar em Contato via WhatsApp
      </Button>
    </a>
  )
}
