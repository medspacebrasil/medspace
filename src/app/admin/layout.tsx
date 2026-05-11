import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { LegalFooter } from "@/components/layout/LegalFooter"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <LegalFooter />
      </div>
    </div>
  )
}
