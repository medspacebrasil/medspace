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
      <button onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b bg-background p-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            <Link
              href="/anuncios"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Encontrar Salas
            </Link>
            {isLoggedIn ? (
              <Link href="/painel" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">
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
                  <Button size="sm" className="w-full">
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
