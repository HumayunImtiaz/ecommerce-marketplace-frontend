"use server"



import {
  getTokenCookie,
  setAdminNameCookie,
  setAdminEmailCookie,
  setAdminBioCookie,
  setLastLoginCookie,
} from "@/lib/cookies"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export type ActionResult =
  | { success: true }
  | { success: false; message: string; field?: string }


export async function updateAdminProfileAction(values: {
  name: string
  email: string
  bio: string
}): Promise<ActionResult> {
  try {
    const token = await getTokenCookie()

    if (!token) {
      return { success: false, message: "Unauthorized" }
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/admin/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: values.name,
        email: values.email,
        bio: values.bio || null,
      }),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to update profile",
        field: result?.errors?.[0]?.field,
      }
    }

   
    await setAdminNameCookie(result.data.fullName)
    await setAdminEmailCookie(result.data.email)
    await setAdminBioCookie(result.data.bio ?? null)
    if (result.data.lastLogin) {
      await setLastLoginCookie(result.data.lastLogin)
    }

    return { success: true }
  } catch {
    return { success: false, message: "Failed to connect to server" }
  }
}


export async function changeAdminPasswordAction(values: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ActionResult> {
  try {
    const token = await getTokenCookie()

    if (!token) {
      return { success: false, message: "Unauthorized" }
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/admin/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to change password",
        field: result?.errors?.[0]?.field,
      }
    }

    return { success: true }
  } catch {
    return { success: false, message: "Failed to connect to server" }
  }
}