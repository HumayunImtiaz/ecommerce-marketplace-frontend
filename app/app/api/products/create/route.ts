// app/api/products/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(req: NextRequest) {
  try {
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: please login again" }, { status: 401 })
    }

    const body = await req.json()

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}