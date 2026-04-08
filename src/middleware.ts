import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Lightweight middleware that checks for the Auth.js session cookie.
 *
 * Auth.js v5 uses encrypted JWTs (JWE) which cannot be decoded without
 * the full auth library (too large for Edge). So we only check cookie
 * presence here. Actual role/session verification happens server-side
 * in auth() calls within page components.
 */

function isLoggedIn(req: NextRequest): boolean {
  const secureCookie = req.cookies.get("__Secure-authjs.session-token")
  const devCookie = req.cookies.get("authjs.session-token")
  return !!(secureCookie?.value || devCookie?.value)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const loggedIn = isLoggedIn(req)

  // Protected: /painel/* and /admin/* require login
  if (pathname.startsWith("/painel") || pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!loggedIn) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
    if (loggedIn) {
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
