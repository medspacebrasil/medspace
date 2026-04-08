export const dynamic = "force-dynamic"

import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProfileForm } from "./ProfileForm"
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.clinicId) {
    redirect("/login")
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId },
    include: { user: { select: { email: true, name: true } } },
  })

  if (!clinic) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground">
        Atualize os dados da sua clínica
      </p>
      <div className="mt-6 space-y-6">
        <ProfileForm clinic={clinic} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
