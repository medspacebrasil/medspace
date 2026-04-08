import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./MobileNav"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-18 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-light.png"
            alt="MedSpace"
            width={140}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/anuncios"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Encontrar Salas
          </Link>
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Como Funciona
          </Link>
          {session ? (
            <Link href="/painel">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Meu Painel
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium">
                  Cadastrar Clínica
                </Button>
              </Link>
            </div>
          )}
        </nav>

        <MobileNav isLoggedIn={!!session} />
      </div>
    </header>
  )
}
