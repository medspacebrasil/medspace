import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProfileForm } from "./ProfileForm"

export default async function PerfilPage() {
  const session = await auth()

  const clinic = await prisma.clinic.findUnique({
    where: { id: session!.user.clinicId! },
    include: { user: { select: { email: true, name: true } } },
  })

  if (!clinic) return null

  return (
    <div>
      <h1 className="text-2xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground">
        Atualize os dados da sua clínica
      </p>
      <div className="mt-6">
        <ProfileForm clinic={clinic} />
      </div>
    </div>
  )
}
