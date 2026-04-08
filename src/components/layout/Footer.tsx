import Link from "next/link"
import { Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-gold">Med</span>
              <span className="text-white">Space</span>
            </span>
            <p className="mt-4 text-sm text-white/60">
              Conectando médicos e clínicas. Encontre o espaço ideal para sua
              prática médica.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com/medspacebrasil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
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
