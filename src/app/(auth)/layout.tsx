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
          src="/logo-light.png"
          alt="MedSpace"
          width={160}
          height={56}
          className="h-12 w-auto"
          priority
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
