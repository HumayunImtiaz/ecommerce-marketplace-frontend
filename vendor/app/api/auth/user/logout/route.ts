import { NextRequest, NextResponse } from "next/server"
import { clearAllUserCookies } from "@/lib/cookies"

export async function POST(req: NextRequest) {
  try {
    await clearAllUserCookies()
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    )
  }
}
