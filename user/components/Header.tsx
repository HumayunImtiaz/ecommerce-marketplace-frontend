"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Heart, User, Menu, X, Sparkles, ChevronDown, Facebook, Twitter, Instagram } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useSettings } from "@/contexts/SettingsContext"
import SearchBar from "./SearchBar"
import CartSidebar from "./CartSidebar"
import { getImageUrl } from "@/lib/utils"

export default function Header() {
  const { settings } = useSettings()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { getCartCount } = useCart()
  const { user, logout } = useAuth()
  const { items: wishlistItems } = useWishlist()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrolled ? "bg-white py-3 shadow-2xl" : "bg-[#002147] py-6"
          }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-3 rounded-2xl transition-colors relative z-[100] ${scrolled ? "bg-[#002147]/5 text-[#002147]" : "bg-white/10 text-white"}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo - Hidden on mobile */}
            <Link href="/" className="group relative z-10 hidden lg:block">
              {settings?.logo ? (
                <img src={getImageUrl(settings.logo)} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
              ) : (
                <div className="flex flex-col">
                  <h1 className={`text-3xl font-playfair font-black tracking-tight transition-colors duration-500 ${scrolled ? "text-[#002147]" : "text-white"}`}>
                    {settings?.storeName || "LuxeCart"}
                  </h1>
                  <span className="text-[6px] font-black tracking-[0.8em] uppercase opacity-40 -mt-1 text-[#eb9a05]">Elite Curation</span>
                </div>
              )}
            </Link>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all relative group py-2 ${scrolled ? "text-[#002147]" : "text-white"
                    }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#eb9a05] transition-all duration-500 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Search Bar - Hidden on small, Expandable on desktop */}
              <div className="hidden md:block">
                <SearchBar />
              </div>

              <div className="flex items-center gap-3 lg:gap-6">
                {/* Mobile Search Icon (optional if not in drawer, but let's put it in drawer first) */}
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="lg:hidden relative group transition-transform hover:scale-110"
                >
                  <Search className={`w-5 h-5 transition-colors ${scrolled ? "text-[#002147]" : "text-white"}`} />
                </button>
                {/* Wishlist */}
                <Link href="/wishlist" className="relative group transition-transform hover:scale-110">
                  <Heart className={`w-5 h-5 transition-colors ${scrolled ? "text-[#002147]" : "text-white"}`} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#eb9a05] text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg animate-pulse">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative group transition-transform hover:scale-110"
                >
                  <ShoppingCart className={`w-5 h-5 transition-colors ${scrolled ? "text-[#002147]" : "text-white"}`} />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#eb9a05] text-[#002147] text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                      {getCartCount()}
                    </span>
                  )}
                </button>

                {/* User Profile */}
                <div className="relative group">
                  <button className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-[#eb9a05]/20 p-0.5 transition-all group-hover:border-[#eb9a05] group-hover:rotate-6">
                      {user?.avatar ? (
                        <img src={getImageUrl(user.avatar)} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full bg-[#002147] flex items-center justify-center rounded-xl">
                          <User className="w-5 h-5 text-[#eb9a05]" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 py-8 px-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-[110]">
                    {/* User Header */}
                    <div className="flex items-center gap-5 pb-6 mb-6 border-b border-gray-50">
                      <div className="w-14 h-14 rounded-2xl bg-[#002147] flex items-center justify-center text-[#eb9a05] font-bold text-xl shadow-inner">
                        {user?.name?.charAt(0) || "G"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black tracking-widest uppercase text-gray-300 mb-0.5">Welcome</p>
                        <p className="text-base font-playfair font-black text-[#002147] truncate">{user ? user.name : "Guest User"}</p>
                      </div>
                    </div>
                    
                    {user ? (
                      <div className="space-y-2">
                        <Link href="/account" className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#f8f9fa] transition-all group/item">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-[#002147]/5 text-[#002147] group-hover/item:bg-[#002147] group-hover/item:text-[#eb9a05] transition-all">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-600 group-hover/item:text-[#002147]">Account Settings</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover/item:text-[#002147] transition-all" />
                        </Link>

                        <Link href="/account?tab=orders" className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#f8f9fa] transition-all group/item">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-[#002147]/5 text-[#002147] group-hover/item:bg-[#002147] group-hover/item:text-[#eb9a05] transition-all">
                              <ShoppingCart className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 group-hover/item:text-[#002147]">Order History</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover/item:text-[#002147] transition-all" />
                        </Link>

                        <div className="pt-6 mt-4">
                          <button 
                            onClick={logout} 
                            className="w-full py-4 rounded-2xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Link 
                          href="/auth/login" 
                          className="block w-full py-5 rounded-2xl bg-[#002147] text-[#eb9a05] text-xs font-black uppercase tracking-[0.2em] text-center shadow-lg hover:shadow-2xl transition-all"
                        >
                          Sign In
                        </Link>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">New here?</p>
                          <Link 
                            href="/auth/register" 
                            className="text-[10px] font-black uppercase tracking-widest text-[#002147] hover:text-[#eb9a05] transition-colors"
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer - OUTSIDE header for proper z-index */}
      <div className={`fixed inset-0 bg-gradient-to-br from-[#002147] via-[#001a38] to-[#000d1a] z-[999] transition-all duration-700 lg:hidden ${isMenuOpen ? "translate-x-0 opacity-100 visible pointer-events-auto" : "-translate-x-full opacity-0 invisible pointer-events-none"
        }`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#eb9a05]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#eb9a05]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative p-8 flex flex-col h-full z-10">
          <div className="flex justify-between items-center mb-16">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <div className="flex flex-col">
                <h2 className="text-3xl font-playfair font-black text-[#eb9a05]">
                  {settings?.storeName || "LuxeCart"}
                </h2>
                <span className="text-[6px] font-black tracking-[0.8em] uppercase opacity-60 -mt-1 text-white">Elite Curation</span>
              </div>
            </Link>
            <button onClick={() => setIsMenuOpen(false)} className="p-4 rounded-2xl bg-white/5 text-white hover:bg-[#eb9a05] hover:text-[#002147] transition-all duration-500 shadow-xl border border-white/10">
              <X size={24} />
            </button>
          </div>

          <div className="mb-10 lg:hidden">
            <SearchBar />
          </div>

          <nav className="flex flex-col gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-playfair font-black text-white hover:text-[#eb9a05] hover:translate-x-4 transition-all duration-500 flex items-center gap-4 group"
              >
                <span className="w-0 h-0.5 bg-[#eb9a05] transition-all duration-500 group-hover:w-12"></span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-12 pt-10 border-t border-white/10">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#eb9a05] flex items-center justify-center text-[#002147] font-black text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[8px] font-black tracking-widest uppercase text-white/40 mb-0.5">Welcome Back</p>
                    <p className="text-xl font-playfair font-black text-white">{user.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href="/account" 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-[#eb9a05] hover:text-[#002147] transition-all"
                  >
                    Account
                  </Link>
                  <Link 
                    href="/account?tab=orders" 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-[#eb9a05] hover:text-[#002147] transition-all"
                  >
                    Orders
                  </Link>
                </div>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full py-4 rounded-2xl border-2 border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link 
                  href="/auth/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-5 rounded-2xl bg-[#eb9a05] text-[#002147] text-[10px] font-black uppercase tracking-widest text-center shadow-lg"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-5 rounded-2xl border-2 border-white/10 text-white text-[10px] font-black uppercase tracking-widest text-center"
                >
                  Join LuxaCart
                </Link>
              </div>
            )}
          </div>

          <div className="mt-auto pt-10 border-t border-white/10">
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05] mb-4">Connect</p>
            <div className="flex gap-6">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-colors"><Icon size={20} /></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push content below fixed header */}
      <div className="h-24"></div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
