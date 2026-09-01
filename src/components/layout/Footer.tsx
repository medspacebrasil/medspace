import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, MessageCircle } from "lucide-react"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton"

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
              Plataforma digital de anúncios e divulgação de oportunidades
              voltadas à área da saúde.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gold">Institucional</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Sobre a MedSpace
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="transition-colors hover:text-white"
                >
                  Como funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/para-medicos"
                  className="transition-colors hover:text-white"
                >
                  Para Médicos
                </Link>
              </li>
              <li>
                <Link
                  href="/para-clinicas"
                  className="transition-colors hover:text-white"
                >
                  Para Clínicas
                </Link>
              </li>
              <li>
                <Link
                  href="/anuncios"
                  className="transition-colors hover:text-white"
                >
                  Encontrar salas
                </Link>
              </li>
              <li>
                <Link
                  href="/aparelhos"
                  className="transition-colors hover:text-white"
                >
                  Aparelhos médicos
                </Link>
              </li>
              <li>
                <Link
                  href="/educacao-medica"
                  className="transition-colors hover:text-white"
                >
                  Educação médica
                </Link>
              </li>
              <li>
                <Link
                  href="/planos"
                  className="transition-colors hover:text-white"
                >
                  Ver planos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gold">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <Link
                  href="/termos-de-uso"
                  className="transition-colors hover:text-white"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="transition-colors hover:text-white"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-anuncios"
                  className="transition-colors hover:text-white"
                >
                  Política de Anúncios
                </Link>
              </li>
              <li>
                <CookiePreferencesButton className="cursor-pointer text-left transition-colors hover:text-white" />
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gold">Contato</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:contato@medspacebrasil.com.br"
                  className="transition-colors hover:text-white"
                >
                  contato@medspacebrasil.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0" />
                <a
                  href="https://wa.me/5561991863638"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  (61) 99186-3638
                </a>
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon className="h-4 w-4 shrink-0" />
                <a
                  href="https://instagram.com/med.spacebrasil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  @med.spacebrasil
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                Brasília/DF
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/50">
            MedSpace: plataforma digital de anúncios e divulgação de
            oportunidades voltadas à área da saúde.
          </p>
          <p className="mt-2 text-center text-xs text-white/40">
            &copy; {new Date().getFullYear()} MEDSPACE PUBLICIDADE LTDA, CNPJ
            66.632.755/0001-17. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
