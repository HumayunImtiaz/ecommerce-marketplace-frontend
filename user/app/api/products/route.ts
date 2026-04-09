import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const queryString = searchParams.toString();
    
    let url = `${API_BASE_URL}/api/auth/products`
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, {
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch products", data: [] },
      { status: 500 }
    )
  }
}