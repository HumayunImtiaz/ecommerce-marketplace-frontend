import { NextRequest, NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/reviews/${params.productId}`,
      { cache: "no-store" }
    )
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews", data: [] },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const token = await getUserTokenCookie()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please login to submit a review" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const response = await fetch(
      `${API_BASE_URL}/api/auth/reviews/${params.productId}`,
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
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    )
  }
}