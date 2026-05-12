"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  User,
  Menu,
  X,
  Store,
  ChevronRight,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { vendorApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const navLinks = [
  { name: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  { name: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { name: "Profile", href: "/vendor/profile", icon: User },
]

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [vendorProfile, setVendorProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, success } = await vendorApi.getProfile()
      if (success) setVendorProfile(data)
    }
    fetchProfile()
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r bg-white lg:block z-40">
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center border-b px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002147] text-white shadow-lg">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-xl font-playfair font-black tracking-tight text-[#002147]">LuxaCart</span>
            </Link>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 overflow-hidden rounded-lg bg-white border flex items-center justify-center">
                {vendorProfile?.logo ? (
                  <img src={vendorProfile.logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-[#002147]">{vendorProfile?.businessName || "My Store"}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Vendor Partner</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#002147] text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#002147]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {link.name}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Menu ── */}
      <div className="lg:hidden">
        <header className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-6">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-5 w-5 text-[#002147]" />
            <span className="text-lg font-playfair font-bold text-[#002147]">LuxaCart</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-white pt-16">
            <nav className="space-y-2 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 rounded-xl p-4 text-lg font-medium hover:bg-slate-50"
                >
                  <link.icon className="h-6 w-6 text-slate-400" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 pt-16 lg:ml-72 lg:pt-0">
        <div className="container mx-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
