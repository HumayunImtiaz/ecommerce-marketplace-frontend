"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { User } from "@/lib/types"
import { authApi } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  socialLogin: (loggedInUser: any, token: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── App start pe /api/auth/me se user load karo ──
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, success } = await authApi.getMe()

        if (success && data?.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const { data, success, message } = await authApi.login({ email, password })

      if (!success || !data?.user) {
        throw new Error(message || "Login failed")
      }

      const u = data.user
      setUser({
        id:     u._id ?? u.id,
        name:   u.fullName ?? u.name,
        email:  u.email,
        avatar: u.avatar ?? null,
      })

      return true
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Social Login ─────────────────────────────────────────────────────────
  const socialLogin = async (loggedInUser: any, token: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      if (!loggedInUser || !token) return false

      // Social login route already cookies set kar chuka hai
      // Bas user state update karo
      setUser({
        id:     loggedInUser._id ?? loggedInUser.id,
        name:   loggedInUser.fullName ?? loggedInUser.name,
        email:  loggedInUser.email,
        avatar: loggedInUser.avatar ?? null,
      })

      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Register ────────────────────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true)

      const { success, message } = await authApi.register({
        fullName: name,
        email,
        password,
        confirmPassword: password,
      })

      if (!success) {
        throw new Error(message || "Registration failed")
      }

      return true
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = (): void => {
    authApi.logout().catch(() => {})
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, login, socialLogin, register, logout, isLoading }),
    [user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}