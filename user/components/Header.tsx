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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
          scrolled ? "bg-white/95 backdrop-blur-xl py-3 shadow-2xl" : "bg-[#002147]/80 backdrop-blur-sm py-6"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group relative z-10">
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
                  className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all relative group py-2 ${
                    scrolled ? "text-[#002147]" : "text-white"
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
              <div className="hidden xl:block">
                <SearchBar />
              </div>

              <div className="flex items-center gap-3 lg:gap-6">
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
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl py-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 border border-gray-50 overflow-hidden">
                    <div className="px-8 pb-4 mb-4 border-b border-gray-50">
                      <p className="text-[8px] font-black tracking-widest uppercase text-gray-300 mb-1">Signed in as</p>
                      <p className="text-sm font-playfair font-black text-[#002147] truncate">{user ? user.name : "Guest"}</p>
                    </div>
                    
                    {user ? (
                      <div className="space-y-1">
                        <Link href="/account" className="flex items-center gap-4 px-8 py-3 text-xs font-bold text-gray-500 hover:text-[#002147] hover:bg-[#f8f9fa] transition-all">
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                        <Link href="/account?tab=orders" className="flex items-center gap-4 px-8 py-3 text-xs font-bold text-gray-500 hover:text-[#002147] hover:bg-[#f8f9fa] transition-all">
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </Link>
                        <div className="pt-4 mt-2 border-t border-gray-50 px-8">
                          <button onClick={logout} className="w-full py-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-8 space-y-3">
                        <Link href="/auth/login" className="block w-full py-4 rounded-xl bg-[#002147] text-[#eb9a05] text-[10px] font-black uppercase tracking-widest text-center shadow-lg hover:shadow-2xl transition-all">
                          Login
                        </Link>
                        <Link href="/auth/register" className="block w-full py-4 rounded-xl border-2 border-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest text-center hover:border-[#eb9a05] hover:text-[#002147] transition-all">
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Trigger */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`lg:hidden p-3 rounded-2xl transition-colors ${scrolled ? "bg-[#002147]/5 text-[#002147]" : "bg-white/10 text-white"}`}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer - OUTSIDE header for proper z-index */}
      <div className={`fixed inset-0 bg-[#002147] z-[999] transition-all duration-700 lg:hidden ${
        isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-16">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
               <h2 className="text-3xl font-playfair font-black text-white">LuxeCart</h2>
            </Link>
            <button onClick={() => setIsMenuOpen(false)} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex flex-col gap-8">
            {navLinks.map((link, i) => (
              <Link 
                key={i} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-playfair font-black text-white hover:text-[#eb9a05] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

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
