import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./MobileNav"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            Med<span className="text-secondary">Space</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/anuncios"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Encontrar Salas
          </Link>
          {session ? (
            <Link href="/painel">
              <Button size="sm">Meu Painel</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm">Cadastrar Clínica</Button>
              </Link>
            </div>
          )}
        </nav>

        <MobileNav isLoggedIn={!!session} />
      </div>
    </header>
  )
}
