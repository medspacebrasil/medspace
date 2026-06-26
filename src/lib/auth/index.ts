import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db"
import { loginSchema } from "@/lib/validators"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Hash bcrypt fixo (de uma senha aleatória descartada) usado só para igualar
// o tempo de `compare` quando o e-mail não existe. Não autentica nada.
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO3Z0wYJ8e6tD8WbQ1bqv0rN5p7Xh9Iu"

function ipFromRequest(request: Request | undefined): string {
  const xff = request?.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]!.trim()
  return request?.headers.get("x-real-ip")?.trim() || "unknown"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        // Brute-force / credential-stuffing protection. Denying (return null)
        // when rate limited gives no oracle to distinguish from a bad password.
        // Per-IP limit is skipped when the IP is unknown (e.g. outside Vercel)
        // so we never lump every login into one global bucket; the per-email
        // limit always applies regardless.
        const ip = ipFromRequest(request)
        if (ip !== "unknown") {
          const byIp = await rateLimit(RATE_LIMITS.login, ip)
          if (!byIp.success) return null
        }
        const byEmail = await rateLimit(
          RATE_LIMITS.loginEmail,
          parsed.data.email.toLowerCase()
        )
        if (!byEmail.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { clinic: true },
        })

        if (!user) {
          // Compara contra um hash dummy para igualar o tempo de resposta ao
          // do caminho "senha errada" e não vazar quais e-mails existem.
          await compare(parsed.data.password, DUMMY_HASH)
          return null
        }

        const isValid = await compare(parsed.data.password, user.passwordHash)
        if (!isValid) return null

        // Conta bloqueada pelo admin não autentica.
        if (user.blockedAt) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinic?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.clinicId = user.clinicId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = token.role as string
        session.user.clinicId = token.clinicId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
})
