import { cookies } from "next/headers"
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const SECRET_KEY = process.env.COOKIE_SECRET_KEY!

const getKey = (): Buffer => {
  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    throw new Error("COOKIE_SECRET_KEY must be at least 32 characters in .env.local")
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
  maxAge: 60 * 60 * 24, // 1 din
}

// ─── Cookie Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  TOKEN:       "token",   // middleware isko check karta hai
  ID:          "u_id",
  NAME:        "u_name",
  EMAIL:       "u_email",
  AVATAR:      "u_avatar",
  PHONE:       "u_phone",
  DATE_OF_BIRTH: "u_date_of_birth",
} as const

// ─── Setters ─────────────────────────────────────────────────────────────────
export const setUserTokenCookie = async (token: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.TOKEN, encrypt(token), COOKIE_OPTIONS)
}

export const setUserIdCookie = async (id: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.ID, encrypt(id), COOKIE_OPTIONS)
}

export const setUserNameCookie = async (name: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.NAME, encrypt(name), COOKIE_OPTIONS)
}

export const setUserEmailCookie = async (email: string) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.EMAIL, encrypt(email), COOKIE_OPTIONS)
}

export const setUserAvatarCookie = async (avatar: string | null) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.AVATAR, encrypt(avatar ?? ""), COOKIE_OPTIONS)
}

export const setUserPhoneCookie = async (phone: string | null) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.PHONE, encrypt(phone ?? ""), COOKIE_OPTIONS)
}

export const setUserDateOfBirthCookie = async (dateOfBirth: string | null) => {
  const cookieStore = await cookies()
  cookieStore.set(KEYS.DATE_OF_BIRTH, encrypt(dateOfBirth ?? ""), COOKIE_OPTIONS)
}

// ─── Getters ─────────────────────────────────────────────────────────────────
export const getUserTokenCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.TOKEN)?.value
  return val ? decrypt(val) : null
}

export const getUserIdCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.ID)?.value
  return val ? decrypt(val) : null
}

export const getUserNameCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.NAME)?.value
  return val ? decrypt(val) : null
}

export const getUserEmailCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.EMAIL)?.value
  return val ? decrypt(val) : null
}

export const getUserAvatarCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.AVATAR)?.value
  if (!val) return null
  const decrypted = decrypt(val)
  return decrypted === "" ? null : decrypted
}

export const getUserPhoneCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.PHONE)?.value
  if (!val) return null
  const decrypted = decrypt(val)
  return decrypted === "" ? null : decrypted
}

export const getUserDateOfBirthCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const val = cookieStore.get(KEYS.DATE_OF_BIRTH)?.value
  if (!val) return null
  const decrypted = decrypt(val)
  return decrypted === "" ? null : decrypted
}

// ─── Get All At Once ──────────────────────────────────────────────────────────
export const getUserFromCookies = async () => {
  const cookieStore = await cookies()

  const raw = {
    token:       cookieStore.get(KEYS.TOKEN)?.value,
    id:          cookieStore.get(KEYS.ID)?.value,
    name:        cookieStore.get(KEYS.NAME)?.value,
    email:       cookieStore.get(KEYS.EMAIL)?.value,
    avatar:      cookieStore.get(KEYS.AVATAR)?.value,
    phone:       cookieStore.get(KEYS.PHONE)?.value,
    dateOfBirth: cookieStore.get(KEYS.DATE_OF_BIRTH)?.value,
  }

  return {
    token:       raw.token       ? decrypt(raw.token)       : null,
    id:          raw.id          ? decrypt(raw.id)          : null,
    name:        raw.name        ? decrypt(raw.name)        : null,
    email:       raw.email       ? decrypt(raw.email)       : null,
    avatar:      raw.avatar      ? (decrypt(raw.avatar) || null) : null,
    phone:       raw.phone       ? (decrypt(raw.phone) || null) : null,
    dateOfBirth: raw.dateOfBirth ? (decrypt(raw.dateOfBirth) || null) : null,
  }
}

// ─── Clear All ────────────────────────────────────────────────────────────────
export const clearAllUserCookies = async () => {
  const cookieStore = await cookies()
  Object.values(KEYS).forEach((key) => {
    cookieStore.delete(key)
  })
}