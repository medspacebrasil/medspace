import { LoginForm } from "./LoginForm"

interface PageProps {
  searchParams: Promise<{ reset?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { reset } = await searchParams
  return <LoginForm justReset={reset === "1"} />
}
