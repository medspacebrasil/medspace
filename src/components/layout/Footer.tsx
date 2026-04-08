import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Image
              src="/logo.png"
              alt="MedSpace"
              width={160}
              height={56}
              className="h-12 w-auto brightness-150"
            />
            <p className="mt-4 text-sm text-white/60">
              Conectando médicos e clínicas. Encontre o espaço ideal para sua
              prática médica.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gold">Plataforma</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/anuncios" className="transition-colors hover:text-white">
                  Encontrar Salas
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="transition-colors hover:text-white">
                  Anunciar Espaço
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gold">Empresa</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/#como-funciona" className="transition-colors hover:text-white">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="transition-colors hover:text-white">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gold">Contato</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contato@medspace.com.br
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} MedSpace. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
