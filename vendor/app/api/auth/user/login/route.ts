import { NextRequest, NextResponse } from "next/server"
import {
  setUserTokenCookie,
  setUserIdCookie,
  setUserNameCookie,
  setUserEmailCookie,
  setUserAvatarCookie,
  setUserPhoneCookie,
  setUserDateOfBirthCookie,
  setUserRoleCookie,
} from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Pass portal: vendor to backend
    const response = await fetch(`${API_BASE_URL}/api/auth/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, portal: "vendor" }),
      cache: "no-store",
    })

    const result = await response.json()

    if (result?.success && result?.data?.token) {
      const { token, user } = result.data

      // Set Encrypted cookies
      await setUserTokenCookie(token)
      await setUserRoleCookie(user.role ?? "VENDOR")
      await setUserIdCookie(user._id ?? user.id ?? "")
      await setUserNameCookie(user.fullName ?? user.name ?? "")
      await setUserEmailCookie(user.email ?? "")
      await setUserAvatarCookie(user.avatar ?? null)
      await setUserPhoneCookie(user.phone ?? null)
      await setUserDateOfBirthCookie(user.dateOfBirth ?? null)

      return NextResponse.json(result, { status: response.status })
    }

    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Login API Route Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 500 }
    )
  }
}
