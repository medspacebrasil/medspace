export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { blockClinic } from "../actions"
import { Ban } from "lucide-react"

export default async function AdminClinicasPage() {
  const clinics = await prisma.clinic.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Clínicas Cadastradas</h1>
      <p className="text-muted-foreground">{clinics.length} clínica(s)</p>

      <div className="mt-6 space-y-3">
        {clinics.map((clinic) => (
          <Card key={clinic.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{clinic.name}</h3>
                  <Badge variant="outline">
                    {clinic._count.listings} anúncio(s)
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {clinic.user.email} &middot; {clinic.city},{" "}
                  {clinic.neighborhood} &middot; WhatsApp: {clinic.whatsapp}
                </p>
              </div>
              <form action={blockClinic}>
                <input type="hidden" name="clinicId" value={clinic.id} />
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Bloquear
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {clinics.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma clínica cadastrada.
          </p>
        )}
      </div>
    </div>
  )
}
