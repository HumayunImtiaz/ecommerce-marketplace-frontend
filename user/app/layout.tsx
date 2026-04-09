import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
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

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LuxeCart - Your Premium E-commerce Destination",
  description: "Discover amazing products at unbeatable prices. Shop electronics, fashion, home & garden, and more.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      

      

<GoogleAuthProvider>
 <SettingsProvider>
  <ToastProvider>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col">
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
