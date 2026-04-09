// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is missing" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${API_BASE_URL}/api/auth/user/verify-email/${token}`,
      {
        method: "GET",
        cache: "no-store",
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 500 }
    )
  }
}