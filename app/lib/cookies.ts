

import { cookies } from "next/headers"
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const SECRET_KEY = process.env.COOKIE_SECRET_KEY! 

const getKey = (): Buffer => {
  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    throw new Error("COOKIE_SECRET_KEY must be at least 32 characters in .env")
  }
  return Buffer.from(SECRET_KEY.slice(0, 32), "utf-8")
}


const encrypt = (plainText: string): string => {
  const iv = crypto.randomBytes(12) 
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf-8"),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

 
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":")
}


const decrypt = (cipherText: string): string | null => {
  try {
    const [ivHex, authTagHex, encryptedHex] = cipherText.split(":")

    if (!ivHex || !authTagHex || !encryptedHex) return null

    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString("utf-8")
  } catch {
    return null
  }
}


const COOKIE_OPTIONS = {
  httpOnly: true,          
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24,   
}


const KEYS = {
  TOKEN:      "a_token",
  ADMIN_ID:   "a_id",
  ADMIN_NAME: "a_name",
  ADMIN_EMAIL:"a_email",
  ADMIN_BIO:  "a_bio",
  ADMIN_AVATAR:"a_avatar",
  LAST_LOGIN: "a_last_login",
} as const



export const setTokenCookie = async (token: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.TOKEN, encrypt(token), COOKIE_OPTIONS)
}

export const setAdminIdCookie = async (id: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.ADMIN_ID, encrypt(id), COOKIE_OPTIONS)
}

export const setAdminNameCookie = async (name: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.ADMIN_NAME, encrypt(name), COOKIE_OPTIONS)
}

export const setAdminEmailCookie = async (email: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.ADMIN_EMAIL, encrypt(email), COOKIE_OPTIONS)
}

export const setAdminBioCookie = async (bio: string | null) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.ADMIN_BIO, encrypt(bio ?? ""), COOKIE_OPTIONS)
}

export const setAdminAvatarCookie = async (avatar: string | null) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.ADMIN_AVATAR, encrypt(avatar ?? ""), COOKIE_OPTIONS)
}

export const setLastLoginCookie = async (lastLogin: string | null) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.LAST_LOGIN, encrypt(lastLogin ?? ""), COOKIE_OPTIONS)
}



export const getTokenCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.TOKEN)?.value
  return val ? decrypt(val) : null
}

export const getAdminIdCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.ADMIN_ID)?.value
  return val ? decrypt(val) : null
}

export const getAdminNameCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.ADMIN_NAME)?.value
  return val ? decrypt(val) : null
}

export const getAdminEmailCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.ADMIN_EMAIL)?.value
  return val ? decrypt(val) : null
}

export const getAdminBioCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.ADMIN_BIO)?.value
  if (!val) return null
  const decrypted = decrypt(val)
  return decrypted === "" ? null : decrypted
}

export const getAdminAvatarCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.ADMIN_AVATAR)?.value
  if (!val) return null
  const decrypted = decrypt(val)
  return decrypted === "" ? null : decrypted
}

export const getLastLoginCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.LAST_LOGIN)?.value
  if (!val) return null
  const decrypted = decrypt(val)
  return decrypted === "" ? null : decrypted
}


export const getAdminFromCookies = async () => {
  const cookieStore = await cookies()

  const raw = {
    token:     cookieStore.get(KEYS.TOKEN)?.value,
    id:        cookieStore.get(KEYS.ADMIN_ID)?.value,
    name:      cookieStore.get(KEYS.ADMIN_NAME)?.value,
    email:     cookieStore.get(KEYS.ADMIN_EMAIL)?.value,
    bio:       cookieStore.get(KEYS.ADMIN_BIO)?.value,
    avatar:    cookieStore.get(KEYS.ADMIN_AVATAR)?.value,
    lastLogin: cookieStore.get(KEYS.LAST_LOGIN)?.value,
  }

  return {
    token:     raw.token     ? decrypt(raw.token)     : null,
    id:        raw.id        ? decrypt(raw.id)         : null,
    name:      raw.name      ? decrypt(raw.name)       : null,
    email:     raw.email     ? decrypt(raw.email)      : null,
    bio:       raw.bio       ? (decrypt(raw.bio) || null) : null,
    avatar:    raw.avatar    ? (decrypt(raw.avatar) || null) : null,
    lastLogin: raw.lastLogin ? (decrypt(raw.lastLogin) || null) : null,
  }
}


export const clearAllAdminCookies = async () => {
  const cookieStore = await cookies()
  Object.values(KEYS).forEach((key) => {
    cookieStore.delete(key)
  })
}