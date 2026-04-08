export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm"

export default async function AdminConfigPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="text-muted-foreground">
        Gerencie sua conta de administrador
      </p>
      <div className="mt-6 max-w-lg">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
