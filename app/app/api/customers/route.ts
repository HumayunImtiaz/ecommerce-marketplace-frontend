// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(req: NextRequest) {
  try {
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/admin/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/users`, {
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
    console.error("POST /api/customers error:", error)
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}