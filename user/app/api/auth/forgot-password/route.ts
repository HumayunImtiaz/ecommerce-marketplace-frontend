
import { NextRequest, NextResponse } from "next/server"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/user/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}