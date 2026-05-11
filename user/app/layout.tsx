import type React from "react"
import type { Metadata } from "next"
import { Outfit, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/CartContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { ToastProvider } from "@/contexts/ToastContext"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ToastContainer from "@/components/ToastContainer"
import GoogleAuthProvider from "@/components/GoogleAuthProvider"
import { SettingsProvider } from "@/contexts/SettingsContext"

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit'
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: "LuxeCart | The Pinnacle of Premium Living",
  description: "Experience the ultimate in curated luxury. From artisanal fashion to elite electronics, LuxeCart defines modern prestige.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body className={outfit.className}>
        <GoogleAuthProvider>
          <SettingsProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                      <ToastContainer />
                    </div>
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </SettingsProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  )
}
