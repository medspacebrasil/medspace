"use client"

import { formatWhatsAppUrl } from "@/lib/utils"
import { trackWhatsAppLead, type LeadSource } from "@/lib/analytics"
import { reportListingContact } from "@/lib/metrics/client"
import { MessageCircle } from "lucide-react"

interface StickyWhatsAppBarProps {
  phone: string
  message?: string
  /** Nome exibido acima do botão, para o usuário saber com quem vai falar. */
  clinicName: string
  source?: LeadSource
}

/**
 * Barra de contato fixa no rodapé, apenas em telas pequenas.
 *
 * No desktop o bloco de contato fica na sidebar com `sticky`, sempre visível.
 * No mobile o grid empilha e esse bloco vai parar no fim da página, atrás de
 * toda a descrição — o visitante precisa rolar tudo para achar o botão. Como o
 * tráfego é majoritariamente mobile, essa barra devolve o CTA para a área
 * visível sem duplicar o bloco de contato no desktop.
 */
export function StickyWhatsAppBar({
  phone,
  message,
  clinicName,
  source,
}: StickyWhatsAppBarProps) {
  const url = formatWhatsAppUrl(phone, message)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">Falar com</p>
          <p className="truncate text-sm font-medium">{clinicName}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackWhatsAppLead(source)
            if (source) reportListingContact(source.listingId)
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
