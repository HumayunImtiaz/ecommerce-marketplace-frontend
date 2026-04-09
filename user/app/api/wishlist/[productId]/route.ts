import { NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const token = await getUserTokenCookie()
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { productId } = params
    const response = await fetch(`${API_BASE_URL}/api/auth/wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
