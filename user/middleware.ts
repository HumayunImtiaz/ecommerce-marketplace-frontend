import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
]

const PROTECTED_ROUTE_PREFIXES = [
  "/account",
  "/profile",
  "/checkout",
  "/orders",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  
  if (
    pathname === "/auth/verify-email" ||
    pathname === "/auth/verifyemail" ||
    pathname.startsWith("/auth/verify-email/") ||
    pathname.startsWith("/auth/verifyemail/")
  ) {
    return NextResponse.next()
  }

  // ── Login/Register — logged in hai toh home pe bhejo ──
  if (AUTH_ROUTES.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // ── Protected routes — token nahi toh login pe bhejo ──
  const isProtected = PROTECTED_ROUTE_PREFIXES.some((r) =>
    pathname.startsWith(r)
  )
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Auth routes
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    // Verify — dono variants
    "/auth/verify-email",
    "/auth/verifyemail",
    // Protected
    "/account/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/orders/:path*",
  ],
}