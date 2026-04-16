import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./MobileNav"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/10 bg-navy">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="MedSpace"
            width={180}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/para-medicos"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Para Médicos
          </Link>
          <Link
            href="/para-clinicas"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Para Clínicas
          </Link>
          <Link
            href="/anuncios"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Salas
          </Link>
          <Link
            href="/aparelhos"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Aparelhos
          </Link>
          {session ? (
            <Link href="/painel">
              <Button size="sm" className="bg-gold text-navy hover:bg-gold/90 font-medium">
                Meu Painel
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium text-white/80 hover:text-white hover:bg-white/10">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm" className="bg-gold text-navy hover:bg-gold/90 font-medium">
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
