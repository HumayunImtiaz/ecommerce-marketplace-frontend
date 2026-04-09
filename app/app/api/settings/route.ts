import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/settings`, {
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { getTokenCookie } = await import("@/lib/cookies")
    const token = await getTokenCookie()

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const response = await fetch(`${API_BASE_URL}/api/auth/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    )
  }
}
