import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/Providers"
import { CookieBanner } from "@/components/CookieBanner"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default:
      "MedSpace — Plataforma digital de anúncios e divulgação para a área da saúde",
    template: "%s | MedSpace",
  },
  description:
    "Plataforma digital de anúncios e divulgação de oportunidades voltadas à área da saúde. Conectamos quem tem espaços, equipamentos, cursos e serviços a divulgar com quem está procurando.",
  keywords: [
    "aluguel consultório médico",
    "sala médica",
    "equipamentos médicos",
    "clínica",
    "médico",
    "consultório",
    "anúncios área da saúde",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
