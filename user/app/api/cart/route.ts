import { NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Common fetcher that forwards the auth token
 */
async function backendFetch(endpoint: string, method: string = "GET", body?: any) {
  const token = await getUserTokenCookie()

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
  const result = await response.json()
  return { result, status: response.status }
}

export async function GET() {
  const { result, status } = await backendFetch("/api/cart")
  return NextResponse.json(result, { status })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { result, status } = await backendFetch("/api/cart/add", "POST", body)
  return NextResponse.json(result, { status })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { result, status } = await backendFetch("/api/cart/update", "PATCH", body)
  return NextResponse.json(result, { status })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get("itemId")
  const clear = searchParams.get("clear")

  if (clear === "true") {
    const { result, status } = await backendFetch("/api/cart/clear", "DELETE")
    return NextResponse.json(result, { status })
  }

  if (!itemId) {
    return NextResponse.json(
      { success: false, message: "Item ID is required" },
      { status: 400 }
    )
  }

  const { result, status } = await backendFetch(`/api/cart/remove/${itemId}`, "DELETE")
  return NextResponse.json(result, { status })
}
