"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  isLoggedIn: boolean
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  // Close menu when window resized to desktop width
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
        style={{ color: "#ffffff" }}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            id="mobile-nav"
            className="fixed left-0 right-0 top-16 z-50 border-b bg-white p-4 shadow-lg lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              <Link
                href="/para-medicos"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
              >
                Para Médicos
              </Link>
              <Link
                href="/para-clinicas"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
              >
                Para Clínicas
              </Link>
              <Link
                href="/anuncios"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
              >
                Salas
              </Link>
              <Link
                href="/aparelhos"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
              >
                Aparelhos
              </Link>
              <div className="mt-2 border-t pt-3">
                {isLoggedIn ? (
                  <Link href="/painel" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold/90">
                      Meu Painel
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/cadastro" onClick={() => setOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gold/40 text-gold-dark"
                      >
                        Cadastrar Aparelho
                      </Button>
                    </Link>
                    <Link href="/cadastro" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold/90">
                        Cadastrar Clínica
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
