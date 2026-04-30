

import { NextRequest, NextResponse } from "next/server"
import { getTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(req: NextRequest) {
  try {
    // ── Server pe cookie se token lo ──
    const token = await getTokenCookie()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please login again" },
        { status: 401 }
      )
    }

    // ── Backend pe forward karo (Stream raw body to avoid Vercel FormData serialization issues) ──
    const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": req.headers.get("content-type") || "",
      },
      body: req.body,
      // @ts-ignore
      duplex: "half",
    })

    const result = await response.json()

    if (!response.ok || !result?.success) {
      return NextResponse.json(
        {
          success: false,
          message: result?.message || "Upload failed",
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to connect to server" },
      { status: 500 }
    )
  }
}