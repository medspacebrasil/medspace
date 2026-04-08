import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-gray p-4">
      <Link href="/" className="mb-8">
        <Image
          src="/logo.png"
          alt="MedSpace"
          width={220}
          height={80}
          className="h-16 w-auto"
          priority
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
