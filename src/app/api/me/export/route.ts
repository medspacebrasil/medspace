import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * LGPD — right to access & data portability (art. 18, II and V).
 * Returns all personal data tied to the authenticated account as a JSON
 * download. The password hash is never included.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      acceptedTermsAt: true,
      acceptedTermsVersion: true,
      marketingOptIn: true,
      createdAt: true,
      updatedAt: true,
      clinic: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          city: true,
          state: true,
          neighborhood: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          listings: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              status: true,
              description: true,
              fullDescription: true,
              city: true,
              state: true,
              neighborhood: true,
              whatsapp: true,
              customSpecialties: true,
              customEquipment: true,
              createdAt: true,
              updatedAt: true,
              images: { select: { url: true, order: true, isCover: true } },
              specialties: { select: { specialty: { select: { name: true } } } },
              equipment: { select: { equipment: { select: { name: true } } } },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    notice:
      "Exportação de dados pessoais (LGPD). Não contém sua senha. Em caso de dúvidas: privacidade@medspacebrasil.com.br",
    data: user,
  }

  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="medspace-meus-dados-${date}.json"`,
      "Cache-Control": "no-store",
    },
  })
}
