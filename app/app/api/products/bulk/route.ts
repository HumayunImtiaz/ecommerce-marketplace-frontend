import { NextResponse } from "next/server"
import { getTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function PATCH(request: Request) {
  try {
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 })
    }

    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/products/bulk-status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Bulk Status Error:", error.message)
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const token = await getTokenCookie()
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 })
    }

    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/api/auth/products/bulk-delete`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Bulk Delete Error:", error.message)
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}
