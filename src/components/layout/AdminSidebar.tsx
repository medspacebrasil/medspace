"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clinicas", label: "Clínicas", icon: Building2 },
  { href: "/admin/anuncios", label: "Anúncios", icon: FileText },
  { href: "/admin/config", label: "Configurações", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const navContent = (
    <>
      <nav className="space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="space-y-1 p-4 lg:absolute lg:bottom-4 lg:left-4 lg:right-4 lg:p-0">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Voltar para o site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link href="/admin" className="text-lg font-bold text-primary">
          Med<span className="text-secondary">Space</span>
          <span className="ml-2 text-xs text-muted-foreground">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 right-0 top-14 z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b bg-background shadow-lg lg:hidden">
            {navContent}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="relative hidden w-64 border-r bg-muted/30 lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-xl font-bold text-primary">
            Med<span className="text-secondary">Space</span>
            <span className="ml-2 text-xs text-muted-foreground">Admin</span>
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  )
}
