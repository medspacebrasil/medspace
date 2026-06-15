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
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <LegalFooter />
      </div>
    </div>
  )
}
