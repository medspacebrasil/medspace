import { Sidebar } from "@/components/layout/Sidebar"
import { LegalFooter } from "@/components/layout/LegalFooter"

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <LegalFooter />
      </div>
    </div>
  )
}
