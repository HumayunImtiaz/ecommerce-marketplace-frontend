import { NextRequest, NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const token = await getUserTokenCookie()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please login to continue" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { orderId } = params

    const response = await fetch(
      `${API_BASE_URL}/api/orders/${orderId}/confirm-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to confirm payment" },
      { status: 500 }
    )
  }
}
