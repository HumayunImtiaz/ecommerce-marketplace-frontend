import { NextResponse } from "next/server"
import { getTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 })
    }

    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Update Product Error:", error.message)
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Delete Product Error:", error.message)
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}
