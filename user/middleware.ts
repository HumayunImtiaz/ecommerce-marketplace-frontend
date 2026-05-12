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

const VENDOR_ROUTE_PREFIXES = [
  "/vendor/dashboard",
  "/vendor/products",
  "/vendor/orders",
  "/vendor/earnings",
  "/vendor/settings",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const role = request.cookies.get("role")?.value

  // ── Allow email verification routes ──
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

  // ── Vendor routes — only VENDOR role allowed ──
  const isVendorRoute = VENDOR_ROUTE_PREFIXES.some((r) =>
    pathname.startsWith(r)
  )
  if (isVendorRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
    if (role !== "vendor") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
    return NextResponse.next()
  }

  // ── Vendor registration page — needs login but any role can access ──
  if (pathname === "/vendor/register") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
    return NextResponse.next()
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
    // Vendor
    "/vendor/:path*",
    // Unauthorized
    "/unauthorized",
  ],
}