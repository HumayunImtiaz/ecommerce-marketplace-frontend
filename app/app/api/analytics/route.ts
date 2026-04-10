import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get("dateRange") || "30d"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    const { getTokenCookie } = await import("@/lib/cookies")
    const token = await getTokenCookie()

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    let url = `${API_BASE_URL}/api/auth/admin/analytics?dateRange=${dateRange}`
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Analytics Proxy Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics stats" },
      { status: 500 }
    )
  }
}
