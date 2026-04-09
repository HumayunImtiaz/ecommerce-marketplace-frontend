"use client"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useSettings } from "@/contexts/SettingsContext"

export default function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
              ) : (
                <h3 className="text-xl font-bold">{settings?.storeName || "LuxeCart"}</h3>
              )}
            </div>
            
            {settings?.contact && (
              <div className="space-y-3 mb-6 text-sm text-gray-400">
                {settings.contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{settings.contact.address}</span>
                  </div>
                )}
                {settings.contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${settings.contact.phone}`} className="hover:text-white transition-colors">
                      {settings.contact.phone}
                    </a>
                  </div>
                )}
                {settings.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${settings.contact.email}`} className="hover:text-white transition-colors">
                      {settings.contact.email}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <Link href={settings?.socialLinks?.facebook || "#"} className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href={settings?.socialLinks?.twitter || "#"} className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href={settings?.socialLinks?.instagram || "#"} className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {settings?.footer?.quickLinks && settings.footer.quickLinks.length > 0 ? (
                settings.footer.quickLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-gray-400 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-gray-400 hover:text-white">
                      FAQ
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {settings?.footer?.categoryLinks && settings.footer.categoryLinks.length > 0 ? (
                settings.footer.categoryLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-gray-400 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/products?category=Electronics" className="text-gray-400 hover:text-white">
                      Electronics
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Fashion" className="text-gray-400 hover:text-white">
                      Fashion
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Home" className="text-gray-400 hover:text-white">
                      Home & Garden
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to get updates on new products and offers.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="w-full btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ${settings?.storeName || "LuxeCart"}. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  )
}
