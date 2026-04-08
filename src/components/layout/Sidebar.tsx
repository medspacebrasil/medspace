"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PlusCircle, UserCircle, LogOut } from "lucide-react"

const links = [
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/painel/anuncios/novo", label: "Novo Anúncio", icon: PlusCircle },
  { href: "/painel/perfil", label: "Meu Perfil", icon: UserCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="relative hidden w-64 border-r bg-muted/30 lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold text-primary">
          Med<span className="text-secondary">Space</span>
        </Link>
      </div>
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
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
