import { NextRequest, NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(req: NextRequest) {
  try {
    const token = await getUserTokenCookie()
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/vendors/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 500 }
    )
  }
}
