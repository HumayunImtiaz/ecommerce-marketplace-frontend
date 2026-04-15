
import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(`${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}