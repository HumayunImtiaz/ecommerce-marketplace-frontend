import { NextResponse } from "next/server"
import { getUserFromCookies } from "@/lib/cookies"

export async function GET() {
  try {
    const { token, id, name, email, avatar, phone, dateOfBirth } = await getUserFromCookies()

    if (!token || !id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated", data: null },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User fetched successfully",
      data: {
        user: { id, name, email, avatar, phone, dateOfBirth },
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to get user", data: null },
      { status: 500 }
    )
  }
}