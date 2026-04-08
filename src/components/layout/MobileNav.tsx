"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  isLoggedIn: boolean
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div id="mobile-nav" className="absolute left-0 right-0 top-[4.5rem] z-50 border-b bg-white p-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            <Link
              href="/anuncios"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              Encontrar Salas
            </Link>
            <Link
              href="/#como-funciona"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              Como Funciona
            </Link>
            {isLoggedIn ? (
              <Link href="/painel" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold/90">
                  Meu Painel
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full bg-gold text-navy hover:bg-gold/90">
                    Cadastrar Clínica
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
