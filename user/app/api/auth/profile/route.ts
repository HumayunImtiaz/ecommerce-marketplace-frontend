import { NextResponse } from "next/server"
import { getUserFromCookies, setUserAvatarCookie, setUserPhoneCookie, setUserDateOfBirthCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function PATCH(req: Request) {
  try {
    const { token } = await getUserFromCookies()
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

    // Read the form data (which includes potential file streams)
    const formData = await req.formData()
    
    // Pass it exactly as-is to the backend
    const response = await fetch(`${API_BASE_URL}/api/auth/user/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    })

    const result = await response.json()

    // If successful, update the local Next.js user cookies for avatar and profile fields.
    if (response.ok && result?.success) {
      if (result.data?.avatar) {
        await setUserAvatarCookie(result.data.avatar)
      }
      if (result.data?.phone !== undefined) {
        await setUserPhoneCookie(result.data.phone)
      }
      if (result.data?.dateOfBirth !== undefined) {
        await setUserDateOfBirthCookie(result.data.dateOfBirth)
      }
    }

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("User Profile Update Error", error)
    return NextResponse.json({ success: false, message: "Failed to connect" }, { status: 500 })
  }
}
