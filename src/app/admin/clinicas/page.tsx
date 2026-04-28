export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { blockClinic } from "../actions"
import { DeleteClinicButton } from "@/components/anuncios/DeleteClinicButton"
import { Ban, PlusCircle } from "lucide-react"

export default async function AdminClinicasPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const clinics = await prisma.clinic.findMany({
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { listings: true } },
      listings: {
        select: { status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Clínicas Cadastradas</h1>
      <p className="text-muted-foreground">{clinics.length} clínica(s)</p>

      <div className="mt-6 space-y-3">
        {clinics.map((clinic) => {
          const published = clinic.listings.filter((l) => l.status === "PUBLISHED").length
          const pending = clinic.listings.filter((l) => l.status === "PENDING").length
          const allArchived = clinic.listings.length > 0 && clinic.listings.every((l) => l.status === "ARCHIVED")

          return (
            <Card key={clinic.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{clinic.name}</h3>
                    {allArchived && (
                      <Badge variant="destructive">Bloqueada</Badge>
                    )}
                    {published > 0 && (
                      <Badge variant="success">{published} publicado(s)</Badge>
                    )}
                    {pending > 0 && (
                      <Badge variant="warning">{pending} pendente(s)</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {clinic.user.name} ({clinic.user.email}) &middot; {clinic.city},{" "}
                    {clinic.neighborhood} &middot; WhatsApp: {clinic.whatsapp} &middot;{" "}
                    {clinic._count.listings} anúncio(s)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/anuncios/novo?clinicId=${clinic.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Novo anúncio
                    </Button>
                  </Link>
                  {!allArchived && clinic._count.listings > 0 && (
                    <form action={blockClinic}>
                      <input type="hidden" name="clinicId" value={clinic.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        title="Arquivar todos os anúncios desta clínica"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Bloquear
                      </Button>
                    </form>
                  )}
                  <DeleteClinicButton
                    clinicId={clinic.id}
                    clinicName={clinic.name}
                    listingsCount={clinic._count.listings}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
        {clinics.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma clínica cadastrada.
          </p>
        )}
      </div>
    </div>
  )
}
