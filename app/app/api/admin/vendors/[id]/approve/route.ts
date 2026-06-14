import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
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

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const token = await getAdminToken()
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const vendorId = params.id

    const response = await fetch(`${API_BASE_URL}/api/vendors/admin/${vendorId}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to approve vendor" }, { status: 500 })
  }
}
