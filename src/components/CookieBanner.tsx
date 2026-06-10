"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cookie, X } from "lucide-react"

const STORAGE_KEY = "medspace:cookie-consent:v1"
// Bump when the cookie/privacy policy changes so users are asked to re-consent.
const CONSENT_VERSION = "2026-05-09"

type Consent = {
  essential: true // always true, can't opt out
  analytics: boolean
  marketing: boolean
  decidedAt: string
  version: string
}

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Consent
    // Treat consent given against an older policy version as not given.
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function writeConsent(consent: Consent) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  // Notify any listeners (e.g. analytics loaders) that consent changed
  window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: consent }))
}

export function CookieBanner() {
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  // LGPD: non-essential categories must be opt-in (start unchecked).
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    if (!readConsent()) setOpen(true)

    // Let the footer (or anywhere) reopen the preferences to withdraw consent.
    function reopen() {
      const current = readConsent()
      setAnalytics(current?.analytics ?? false)
      setMarketing(current?.marketing ?? false)
      setShowSettings(true)
      setOpen(true)
    }
    window.addEventListener("open-cookie-preferences", reopen)
    return () => window.removeEventListener("open-cookie-preferences", reopen)
  }, [])

  function acceptAll() {
    writeConsent({
      essential: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    })
    setOpen(false)
  }

  function rejectAll() {
    writeConsent({
      essential: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    })
    setOpen(false)
  }

  function saveCustom() {
    writeConsent({
      essential: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    })
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-navy text-white shadow-2xl md:inset-x-4 md:bottom-4 md:rounded-2xl md:border">
      <div className="container mx-auto p-4 md:p-6">
        {!showSettings ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="flex shrink-0 items-center justify-center md:items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
                <Cookie className="h-5 w-5 text-gold" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold">Sua privacidade</h3>
              <p className="mt-1 text-sm text-white/70">
                Utilizamos cookies para melhorar sua experiência, analisar
                tráfego e personalizar conteúdos e anúncios. Saiba mais na
                nossa{" "}
                <Link
                  href="/politica-de-privacidade"
                  className="text-gold underline hover:text-gold-light"
                  target="_blank"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:shrink-0 md:flex-col lg:flex-row">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                Configurações
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Recusar
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                Aceitar todos
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Configurações de cookies</h3>
                <p className="mt-1 text-sm text-white/70">
                  Escolha quais categorias de cookies você quer permitir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Voltar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Cookies essenciais{" "}
                      <span className="text-xs text-white/50">(sempre ativos)</span>
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      Necessários para o funcionamento da plataforma, como
                      autenticação e segurança.
                    </p>
                  </div>
                </label>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cookies analíticos</p>
                    <p className="mt-1 text-xs text-white/60">
                      Usados para análise de desempenho e comportamento de
                      navegação (ex.: Google Analytics).
                    </p>
                  </div>
                </label>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cookies de marketing</p>
                    <p className="mt-1 text-xs text-white/60">
                      Usados para campanhas, remarketing e personalização de
                      anúncios (ex.: Meta Pixel).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={rejectAll}
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                Recusar tudo
              </Button>
              <Button
                size="sm"
                onClick={saveCustom}
                className="bg-gold text-navy hover:bg-gold/90 font-semibold"
              >
                Salvar preferências
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
