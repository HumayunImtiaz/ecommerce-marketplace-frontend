"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { useToast } from "@/contexts/ToastContext"
import { useSettings } from "@/contexts/SettingsContext"
import { contactApi, productApi } from "@/lib/api"
import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import LiveChat from "@/components/LiveChat"

export default function ContactPage() {
  const { settings } = useSettings()
  const { addToast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    orderNumber: "",
    category: "general",
  })

  const contactCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "order", label: "Order Support" },
    { value: "product", label: "Product Question" },
    { value: "shipping", label: "Shipping & Delivery" },
    { value: "returns", label: "Returns & Refunds" },
    { value: "technical", label: "Technical Support" },
    { value: "partnership", label: "Business Partnership" },
  ]

  const contact = settings?.contact || {
    email: "support@LuxeCart.com",
    phone: "+1 (234) 567-8900",
    address: "123 Commerce Street, Business District, New York, NY 10001",
    workingHours: "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed",
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})


  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await contactApi.sendInquiry(formData)

      if (response.success) {
        addToast(response.message || "Message sent successfully!", "success")
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          orderNumber: "",
          category: "general",
        })
      } else {
        addToast(response.message || "Failed to send message. Please try again.", "error")
      }
    } catch (error) {
      addToast("An error occurred. Please try again later.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have a question or need help? We're here to assist you. Send us a message and we'll respond as soon as
          possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-gray-600 text-sm mb-2">Send us an email anytime</p>
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800 break-all">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p className="text-gray-600 text-sm mb-2">Available during working hours</p>
                  <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visit Us</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {contact.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-wrap">
                    {contact.workingHours}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">Quick Answers</h3>
              <p className="text-sm text-gray-600 mb-3">
                Check our FAQ section for instant answers to common questions.
              </p>
              <a href="/faq" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View FAQ →
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-field ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${errors.email ? "border-red-500" : ""}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {contactCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="ORD-XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`input-field ${errors.subject ? "border-red-500" : ""}`}
                  placeholder="Brief description of your inquiry"
                />
                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`input-field resize-none ${errors.message ? "border-red-500" : ""}`}
                  placeholder="Please provide as much detail as possible..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                <p className="mt-1 text-sm text-gray-500">{formData.message.length}/500 characters</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Additional Support Options */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Other Ways to Get Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">Get instant help from our support team during business hours.</p>
            <button 
              className="btn-primary"
              onClick={() => {
                if (user) {
                  setIsChatOpen(true)
                } else {
                  addToast("Please login first to use live chat", "error")
                  router.push("/auth/login?redirect=/contact")
                }
              }}
            >
              Start Chat
            </button>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Help Center</h3>
            <p className="text-gray-600 text-sm mb-4">Browse our comprehensive help articles and tutorials.</p>
            <button className="btn-secondary">Visit Help Center</button>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Community Forum</h3>
            <p className="text-gray-600 text-sm mb-4">Connect with other customers and share experiences.</p>
            <button className="btn-secondary">Join Forum</button>
          </div>
        </div>
      </div>

      {/* Floating Live Chat */}
      {isChatOpen && user && (
        <LiveChat onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  )
}
