import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  // Protected: /painel/* requires CLINIC or ADMIN
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
})

export const config = {
  matcher: [
    "/painel/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/login",
    "/cadastro",
  ],
}
