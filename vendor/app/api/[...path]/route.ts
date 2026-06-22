import { NextRequest, NextResponse } from "next/server"
import { getUserTokenCookie } from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  try {
    const path = params.path.join("/")
    const { searchParams } = new URL(req.url)
    const queryString = searchParams.toString()

    const token = await getUserTokenCookie()
    
    // Construct Backend URL
    let url = `${API_BASE_URL}/api/${path}`
    if (queryString) {
      url += `?${queryString}`
    }

    const options: RequestInit = {
      method: req.method,
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    }

    // Add Body for non-GET requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        options.body = JSON.stringify(await req.json())
        ;(options.headers as any)["Content-Type"] = "application/json"
      } else if (contentType?.includes("multipart/form-data")) {
        // For FormData, we don't set Content-Type manually, fetch will do it with boundary
        options.body = await req.formData()
      }
    }

    const response = await fetch(url, options)
    
    // Handle empty response or non-json
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const result = await response.json()
      return NextResponse.json(result, { status: response.status })
    } else {
      const text = await response.text()
      return new NextResponse(text, { status: response.status, headers: { "Content-Type": contentType || "text/plain" } })
    }

  } catch (error: any) {
    console.error("Proxy Error:", error)
    return NextResponse.json(
      { success: false, message: "Server connection failed" },
      { status: 500 }
    )
  }
}
