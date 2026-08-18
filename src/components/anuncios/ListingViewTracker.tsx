"use client"

import { useEffect, useRef } from "react"
import { reportListingView } from "@/lib/metrics/client"

/**
 * Registra uma visualização do anúncio.
 *
 * Não renderiza nada. O ref evita a contagem dobrada causada pelo StrictMode em
 * desenvolvimento, que monta o componente duas vezes.
 */
export function ListingViewTracker({ listingId }: { listingId: string }) {
  const reported = useRef(false)

  useEffect(() => {
    if (reported.current) return
    reported.current = true
    reportListingView(listingId)
  }, [listingId])

  return null
}
