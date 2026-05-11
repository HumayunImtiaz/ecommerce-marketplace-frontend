"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Sparkles, ShieldCheck, Globe, Clock } from "lucide-react"
import { useState } from "react"
import { useSettings } from "@/contexts/SettingsContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { getImageUrl } from "@/lib/utils"
import { siteApi, authApi } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function Footer() {
  const { settings } = useSettings()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setSubmitting(true)
    try {
      const res = await siteApi.subscribeNewsletter(email)
      if (res.success) {
        addToast("Successfully subscribed to our newsletter!", "success")
        setEmail("")
        
        // If user is logged in, sync their promotional preferences
        if (user) {
          await authApi.updateEmailPreferences({ promotionalEmails: true })
        }
      } else {
        addToast(res.message || "Subscription failed.", "error")
      }
    } catch (err) {
      addToast("Something went wrong. Please try again.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="relative overflow-hidden bg-[#002147] text-white">
      {/* Decorative Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#eb9a05] to-transparent opacity-50"></div>
      
      {/* Background Ambience */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#eb9a05]/5 rounded-full translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
      
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          {/* Brand Identity */}
          <div className="space-y-10">
            <Link href="/" className="inline-block group transition-all duration-500">
              {settings?.logo ? (
                <img src={getImageUrl(settings.logo)} alt={settings.storeName} className="h-10 w-auto object-contain brightness-0 invert group-hover:scale-105" />
              ) : (
                <div className="flex flex-col">
                  <h3 className="text-4xl font-playfair font-black tracking-tight text-[#eb9a05] group-hover:text-white transition-colors">
                    {settings?.storeName || "LuxeCart"}
                  </h3>
                  <span className="text-[8px] font-black tracking-[0.6em] uppercase opacity-40 -mt-1">Premium Quality Store</span>
                </div>
              )}
            </Link>
            
            <p className="text-sm leading-relaxed opacity-60 italic max-w-xs">
              Providing high-quality products with exceptional service and a commitment to excellence for all our customers.
            </p>

            <div className="flex space-x-6">
              {settings?.socialLinks?.facebook && (
                <Link href={settings.socialLinks.facebook} target="_blank" className="footer-social-link">
                  <Facebook className="w-5 h-5" />
                </Link>
              )}
              {settings?.socialLinks?.twitter && (
                <Link href={settings.socialLinks.twitter} target="_blank" className="footer-social-link">
                  <Twitter className="w-5 h-5" />
                </Link>
              )}
              {settings?.socialLinks?.instagram && (
                <Link href={settings.socialLinks.instagram} target="_blank" className="footer-social-link">
                  <Instagram className="w-5 h-5" />
                </Link>
              )}
              {!settings?.socialLinks && [Facebook, Twitter, Instagram].map((Icon, idx) => (
                <Link key={idx} href="#" className="footer-social-link">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigational Links */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05]">Quick Links</h4>
            <ul className="space-y-5">
              {[
                { label: "Products", href: "/products" },
                { label: "Categories", href: "/categories" },
                { label: "Our Story", href: "/about" },
                { label: "Support", href: "/contact" },
                { label: "FAQ", href: "/faq" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm font-bold opacity-60 hover:opacity-100 hover:text-[#eb9a05] transition-all flex items-center group">
                    <span className="w-0 group-hover:w-4 h-px bg-[#eb9a05] mr-0 group-hover:mr-3 transition-all duration-500"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05]">Contact Us</h4>
            <div className="space-y-8">
              <div className="flex items-start gap-5 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#eb9a05] group-hover:text-[#002147]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Address</p>
                  <p className="text-sm font-medium opacity-80 italic">{settings?.contact?.address || "777 Prestige Ave, NY"}</p>
                </div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#eb9a05] group-hover:text-[#002147]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-medium opacity-80">{settings?.contact?.phone || "+1 234 567 890"}</p>
                </div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#eb9a05] group-hover:text-[#002147]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Working Hours</p>
                  <p className="text-sm font-medium opacity-80 italic">{settings?.contact?.workingHours || "Mon - Sat: 9AM - 6PM"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05]">Newsletter</h4>
            <p className="text-sm opacity-60 italic leading-relaxed">Join our mailing list for exclusive updates on new products and offers.</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#eb9a05] focus:bg-white/10 transition-all text-sm font-bold placeholder:opacity-30"
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full btn-secondary py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-2xl flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                )}
                {submitting ? "Subscribing..." : "Subscribe Now"}
              </button>
            </form>
          </div>
        </div>

        {/* Global Assurance */}
        <div className="mt-24 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
           <div className="flex items-center gap-4 group cursor-default">
              <ShieldCheck className="w-6 h-6 text-[#eb9a05] transition-transform group-hover:scale-110" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black tracking-widest uppercase">Secure Payments</span>
                 <span className="text-[8px] opacity-40 uppercase">SSL Encrypted</span>
              </div>
           </div>
           <div className="flex items-center gap-4 group cursor-default justify-center">
              <Globe className="w-6 h-6 text-[#eb9a05] transition-transform group-hover:scale-110" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black tracking-widest uppercase">Worldwide Shipping</span>
                 <span className="text-[8px] opacity-40 uppercase">Fast Delivery</span>
              </div>
           </div>
           <div className="flex justify-end gap-3">
              {['visa', 'mastercard', 'amex', 'paypal'].map((card) => (
                <div key={card} className="w-12 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                   <span className="text-[8px] font-black uppercase tracking-tighter">{card}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Copyright & Legal */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black tracking-widest uppercase opacity-30">
            {settings?.footerText || `© ${new Date().getFullYear()} ${settings?.storeName || "LuxeCart"}. All Rights Reserved.`}
          </p>
          <div className="flex gap-10 text-[8px] font-black uppercase tracking-[0.3em] opacity-30">
            <Link href="#" className="hover:text-[#eb9a05] transition-colors hover:opacity-100">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#eb9a05] transition-colors hover:opacity-100">Terms of Service</Link>
            <Link href="#" className="hover:text-[#eb9a05] transition-colors hover:opacity-100">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
