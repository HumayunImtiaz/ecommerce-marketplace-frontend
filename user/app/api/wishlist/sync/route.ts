import { NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(req: Request) {
  try {
    const token = await getUserTokenCookie()
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/wishlist/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
