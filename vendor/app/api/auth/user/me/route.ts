import { NextRequest, NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function GET(req: NextRequest) {
  try {
    const token = await getUserTokenCookie()

    if (!token) {
      return NextResponse.json({ success: false, message: "No token found" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/user/me`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("GetMe API Route Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 500 }
    )
  }
}
