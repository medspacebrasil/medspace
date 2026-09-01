import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { LegalFooter } from "@/components/layout/LegalFooter"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Count of listings awaiting moderation, shown as a badge in the sidebar.
  const pendingCount = await prisma.listing.count({ where: { status: "PENDING" } })

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar pendingCount={pendingCount} />
      {/* min-w-0: sem isso uma tabela larga alarga a coluna em vez de rolar
          dentro dela, e esmaga a sidebar entre 1024 e 1280px. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <LegalFooter />
      </div>
    </div>
  )
}
