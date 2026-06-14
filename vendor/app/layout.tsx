import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import VendorLayoutContent from "@/components/VendorLayoutContent"
import { ToastProvider } from "@/contexts/ToastContext"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <Toaster position="top-right" expand={true} richColors />
          <AuthProvider>
            <VendorLayoutContent>{children}</VendorLayoutContent>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
