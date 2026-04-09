import { NextRequest, NextResponse } from "next/server"
import { getTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/admin/users/${params.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error)
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}
