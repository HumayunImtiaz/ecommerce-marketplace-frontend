import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const response = await fetch(`${API_BASE_URL}/api/products/slug/${slug}`, {
      cache: "no-store",
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to connect to server" }, { status: 500 })
  }
}
