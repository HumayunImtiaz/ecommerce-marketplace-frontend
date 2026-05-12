import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("admin_token")?.value
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const response = await fetch(`${API_BASE_URL}/api/vendors/admin/${params.id}/suspend`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
