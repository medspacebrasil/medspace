export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBRL } from "@/lib/billing/pricing"
import { resumoRecebimentos } from "@/lib/billing/reports"
import { Building2, FileText, Clock, Users, Wallet, Hourglass } from "lucide-react"
import { notFound } from "next/navigation"

export default async function AdminDashboard() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const [clinicCount, listingCount, pendingCount, publishedCount, cobrancas] =
    await Promise.all([
      prisma.clinic.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.listing.count({ where: { status: "PUBLISHED" } }),
      resumoRecebimentos(),
    ])

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-muted-foreground">Visão geral da plataforma</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cadastros</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clinicCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Anúncios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{listingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes Moderação
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {publishedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 text-lg font-bold">Cobranças</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/cobrancas?filtro=pagos" className="block">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recebido no mês</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatBRL(cobrancas.mesCents)}</p>
              <p className="text-xs text-muted-foreground">
                {formatBRL(cobrancas.totalCents)} no total
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/cobrancas?filtro=aguardando" className="block">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aguardando pagamento</CardTitle>
              <Hourglass className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{cobrancas.aguardandoQtd}</p>
              <p className="text-xs text-muted-foreground">
                {formatBRL(cobrancas.aguardandoCents)} a receber
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
