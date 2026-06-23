import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RedefinirSenhaForm } from "./RedefinirSenhaForm"

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function RedefinirSenhaPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar nova senha</CardTitle>
        <CardDescription>
          Escolha uma nova senha para sua conta MedSpace.
        </CardDescription>
      </CardHeader>

      {token ? (
        <RedefinirSenhaForm token={token} />
      ) : (
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Link inválido. Solicite uma nova redefinição de senha.
          </div>
          <Link href="/recuperar-senha" className="block">
            <Button variant="outline" className="w-full">
              Solicitar redefinição
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  )
}
