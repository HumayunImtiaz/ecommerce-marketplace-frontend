import { NextResponse } from "next/server"
import { getUserFromCookies } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET() {
  try {
    const { token } = await getUserFromCookies()
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

    const response = await fetch(`${API_BASE_URL}/api/auth/user/email-preferences`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to connect" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token } = await getUserFromCookies()
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

    const body = await req.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/user/email-preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to connect" }, { status: 500 })
  }
}
