import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "MedSpace - Conectando Médicos e Clínicas",
    template: "%s | MedSpace",
  },
  description:
    "Encontre salas e equipamentos médicos para alugar. Conectamos médicos a clínicas com espaços disponíveis.",
  keywords: [
    "aluguel consultório médico",
    "sala médica",
    "equipamentos médicos",
    "clínica",
    "médico",
    "consultório",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
