import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-primary">
              Med<span className="text-secondary">Space</span>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Conectando médicos e clínicas. Encontre o espaço ideal para sua
              prática médica.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Links</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="/anuncios" className="hover:text-foreground">
                  Encontrar Salas
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-foreground">
                  Anunciar Espaço
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Contato</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              contato@medspace.com.br
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MedSpace. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  )
}
