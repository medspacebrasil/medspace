import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Lightweight middleware that reads the Auth.js JWT session cookie
 * without importing the full auth config (which pulls in Prisma + bcrypt
 * and exceeds the 1MB Edge Function limit on Vercel Hobby).
 *
 * We decode the JWT payload (base64url) to check login status and role.
 * The actual signature verification happens in auth() on server-side routes.
 */

function getSessionFromCookie(req: NextRequest) {
  // Auth.js uses different cookie names based on environment
  const secureCookie = req.cookies.get("__Secure-authjs.session-token")
  const devCookie = req.cookies.get("authjs.session-token")
  const token = secureCookie?.value || devCookie?.value

  if (!token) return null

  try {
    // JWT format: header.payload.signature — we only need the payload
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    )

    return {
      user: {
        role: payload.role as string | undefined,
      },
    }
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = getSessionFromCookie(req)
  const isLoggedIn = !!session
  const role = session?.user?.role

  // Protected: /painel/* requires login
  if (pathname.startsWith("/painel")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Protected: /admin/* requires ADMIN
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/painel", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/login",
    "/cadastro",
  ],
}
