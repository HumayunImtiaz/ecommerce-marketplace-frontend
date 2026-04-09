// middleware.ts  ← project root mein rakho (next.config.mjs ke saath)
// ─────────────────────────────────────────────────────────────────────────────
// AdminRouteGuard hata diya — yeh kaam Next.js Middleware karta hai
// Cookies server pe check hoti hain — client pe kuch nahi jaata
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/login", "/verify", "/forget-password", "/new-password"]
const TOKEN_COOKIE = "a_token"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Cookie exist karti hai? (encrypted value)
  const token = req.cookies.get(TOKEN_COOKIE)?.value

  // Public route par logged in hai — dashboard par bhejo
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  // Protected route par token nahi — login par bhejo
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
 
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|placeholder).*)",
  ],
}