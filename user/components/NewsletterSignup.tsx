"use client"

import type React from "react"

import { useState } from "react"
import { Mail, CheckCircle } from "lucide-react"
import { useToast } from "@/contexts/ToastContext"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      addToast("Please enter your email address", "error")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast("Please enter a valid email address", "error")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await res.json()

      if (result.success) {
        setIsSubscribed(true)
        addToast(result.message || "Successfully subscribed to newsletter!", "success")
        setEmail("")
      } else {
        addToast(result.message || "Failed to subscribe", "error")
      }
    } catch {
      addToast("Failed to connect. Please try again later.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-green-800">Thank You!</h2>
          <p className="text-green-700 max-w-md mx-auto">
            You've successfully subscribed to our newsletter. Get ready for exclusive deals and updates!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <Mail className="w-16 h-16 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special offers.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </form>
      </div>
    </section>
  )
}
