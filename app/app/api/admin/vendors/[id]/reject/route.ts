import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
const TOKEN_COOKIE = "a_token"
const ALGORITHM = "aes-256-gcm"
const SECRET_KEY = process.env.COOKIE_SECRET_KEY!

const decrypt = (cipherText: string): string | null => {
  try {
    const [ivHex, authTagHex, encryptedHex] = cipherText.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")
    const key = Buffer.from(SECRET_KEY.slice(0, 32), "utf-8")
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString("utf-8")
  } catch { return null }
}

async function getAdminToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE)?.value
  return token ? decrypt(token) : null
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const token = await getAdminToken()
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    // We can extract params.id like params.id or via the second argument.
    // In nextjs route handlers, params is a Promise in Next.js 15, but let's do it safely
    // Actually the other files just use it synchronously or `const { id } = await params` based on Next 15 rules.
    const response = await fetch(`${API_BASE_URL}/api/vendors/admin/${id}/reject`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
