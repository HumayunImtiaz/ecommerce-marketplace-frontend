"use server"



import {
  setTokenCookie,
  setAdminIdCookie,
  setAdminNameCookie,
  setAdminEmailCookie,
  setAdminBioCookie,
  setLastLoginCookie,
  clearAllAdminCookies,
  getAdminFromCookies,
  setAdminAvatarCookie,
} from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


export type LoginActionResult =
  | { success: true }
  | { success: false; message: string; field?: string }

export async function adminLoginAction(
  email: string,
  password: string
): Promise<LoginActionResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Invalid email or password",
        field: result?.errors?.[0]?.field,
      }
    }

    const { admin, token } = result.data

    await setTokenCookie(token)
    await setAdminIdCookie(String(admin.id))
    await setAdminNameCookie(admin.fullName)
    await setAdminEmailCookie(admin.email)
    await setAdminBioCookie(admin.bio ?? null)
    await setAdminAvatarCookie(admin.avatar ?? null)
    await setLastLoginCookie(admin.lastLogin ?? null)

    return { success: true }
  } catch {
    return {
      success: false,
      message: "Unable to connect to server. Please try again.",
    }
  }
}


export async function adminLogoutAction(): Promise<void> {
  await clearAllAdminCookies()
}

export async function getAdminAction() {
  return await getAdminFromCookies()
}