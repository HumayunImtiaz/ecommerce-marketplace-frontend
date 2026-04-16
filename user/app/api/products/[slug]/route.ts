import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug
    const url = `${API_BASE_URL}/api/products//slug/${slug}`

    const response = await fetch(url, {
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Single product proxy error:", error.message)
    return NextResponse.json(
      { success: false, message: "Failed to fetch product detail", data: null },
      { status: 500 }
    )
  }
}
