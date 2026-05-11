import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { getTokenCookie } = await import("@/lib/cookies")
    let token: string | null = null

    try {
      token = await getTokenCookie()
    } catch (cookieError) {
      console.error("Cookie decryption error:", cookieError)
    }

    if (!token) {
      console.error("Settings PATCH: No token found in cookies. Admin may need to re-login.")
      return NextResponse.json(
        { success: false, message: "Session expired. Please log in again." },
        { status: 401 }
      )
    }

    const body = await req.json()

    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Backend settings PATCH failed:", response.status, result)
    }

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Settings PATCH error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    )
  }
}
