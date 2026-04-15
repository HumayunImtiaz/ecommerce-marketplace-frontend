import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/`, {
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories", data: [] },
      { status: 500 }
    )
  }
}