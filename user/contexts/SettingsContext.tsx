"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { siteApi } from "@/lib/api"

interface SiteSettings {
  storeName: string
  footerText: string
  logo: string
  hero: {
    title: string
    subtitle: string
    image: string
    buttonText: string
    buttonLink: string
  }
  contact: {
    email: string
    phone: string
    address: string
    workingHours: string
  }
  about: {
    title: string
    content: string
    image: string
    stats: { label: string; value: string; icon: string }[]
    values: { title: string; description: string; icon: string }[]
    team: { name: string; role: string; bio: string; image: string }[]
    milestones: { year: string; title: string; description: string }[]
    sustainability: { title: string; description: string; image: string; bullets: string[] }
    mission: { title: string; content: string[]; image: string }
  }
  adminEmail: string
  socialLinks: {
    facebook: string
    instagram: string
    twitter: string
  }
  footer: {
    quickLinks: { label: string; url: string }[]
    categoryLinks: { label: string; url: string }[]
  }
}

interface SettingsContextType {
  settings: SiteSettings | null
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await siteApi.getSettings()
        if (result.success && result.data) {
          setSettings(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
