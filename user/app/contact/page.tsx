"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, Sparkles, MessageCircle, HelpCircle, Users, ChevronDown } from "lucide-react"
import { useToast } from "@/contexts/ToastContext"
import { useSettings } from "@/contexts/SettingsContext"
import { contactApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import LiveChat from "@/components/LiveChat"

export default function ContactPage() {
  const { settings } = useSettings()
  const { addToast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "", orderNumber: "", category: "general" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const contactCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "order", label: "Order Support" },
    { value: "product", label: "Product Question" },
    { value: "shipping", label: "Logistics" },
    { value: "returns", label: "Returns" },
    { value: "partnership", label: "Business Partnership" },
  ]

  const contact = settings?.contact || {
    email: "concierge@LuxeCart.com",
    phone: "+1 (234) 567-8900",
    address: "777 Prestige Avenue, Upper East Side, Manhattan, NY",
    workingHours: "Mon - Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 4:00 PM",
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Identity required"
    if (!formData.email.trim()) newErrors.email = "Authorized email required"
    if (!formData.subject.trim()) newErrors.subject = "Subject required"
    if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters"
    setErrors(newErrors); return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const response = await contactApi.sendInquiry(formData)
      if (response.success) {
        addToast("Message sent successfully.", "success")
        setFormData({ name: "", email: "", subject: "", message: "", orderNumber: "", category: "general" })
      } else addToast(response.message || "Failed to send message.", "error")
    } catch { addToast("Communication failure.", "error") }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[#002147] -skew-y-3 -translate-y-24 z-0"></div>

      <div className="container mx-auto relative z-10 pt-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#eb9a05] mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Customer Support</span>
          </div>
          <h1 className="text-6xl font-playfair font-black text-white mb-6">Connect With Us</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto italic leading-relaxed">
            Your inquiries are important to us. Reach out to our support team for assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-[#eb9a05]/10 h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
               <h2 className="text-3xl font-playfair font-black text-[#002147] mb-12">Contact Info</h2>
               <div className="space-y-10">
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#002147]/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#002147] group-hover:text-white group-hover:rotate-12">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-1">Email Address</p>
                      <a href={`mailto:${contact.email}`} className="text-sm font-bold text-[#002147] hover:text-[#eb9a05] transition-colors">{contact.email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#002147]/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#002147] group-hover:text-white group-hover:rotate-12">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-1">Phone Number</p>
                      <a href={`tel:${contact.phone}`} className="text-sm font-bold text-[#002147] hover:text-[#eb9a05] transition-colors">{contact.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#002147]/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#002147] group-hover:text-white group-hover:rotate-12">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-1">Address</p>
                      <p className="text-sm font-bold text-[#002147] leading-relaxed italic">{contact.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#002147]/5 flex items-center justify-center text-[#eb9a05] transition-all group-hover:bg-[#002147] group-hover:text-white group-hover:rotate-12">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-1">Working Hours</p>
                      <p className="text-sm font-bold text-[#002147] leading-relaxed whitespace-pre-wrap">{contact.workingHours}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[3.5rem] p-12 md:p-16 shadow-2xl border border-[#eb9a05]/10">
              <h2 className="text-3xl font-playfair font-black text-[#002147] mb-12">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-60 ml-4">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full bg-[#f8f9fa] border-2 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm text-[#002147] placeholder:text-gray-400 ${errors.name ? 'border-red-400' : 'border-gray-50'}`} placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-60 ml-4">Electronic Address</label>
                    <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full bg-[#f8f9fa] border-2 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm text-[#002147] placeholder:text-gray-400 ${errors.email ? 'border-red-400' : 'border-gray-50'}`} placeholder="Enter your email" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-60 ml-4">Category</label>
                    <div className="relative">
                       <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full appearance-none bg-[#f8f9fa] border-2 border-gray-50 rounded-2xl px-8 py-4 pr-12 focus:outline-none focus:border-[#eb9a05] font-black text-[10px] tracking-widest uppercase text-[#002147]">
                        {contactCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#eb9a05] pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-60 ml-4">Order Number (Optional)</label>
                    <input type="text" name="orderNumber" value={formData.orderNumber} onChange={(e) => setFormData({...formData, orderNumber: e.target.value})} className="w-full bg-[#f8f9fa] border-2 border-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm text-[#002147] placeholder:text-gray-400" placeholder="ORD-XXXXXXXXX" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-60 ml-4">Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className={`w-full bg-[#f8f9fa] border-2 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm text-[#002147] placeholder:text-gray-400 ${errors.subject ? 'border-red-400' : 'border-gray-50'}`} placeholder="Brief summary of your inquiry" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-60 ml-4">Message</label>
                  <textarea name="message" rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className={`w-full bg-[#f8f9fa] border-2 rounded-[2rem] px-8 py-6 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm text-[#002147] placeholder:text-gray-400 resize-none ${errors.message ? 'border-red-400' : 'border-gray-50'}`} placeholder="Enter your message here..." />
                  <div className="flex justify-between px-4">
                    {errors.message && <span className="text-red-400 text-[8px] font-black tracking-widest uppercase">{errors.message}</span>}
                    <span className="text-[8px] font-black tracking-widest uppercase text-gray-300 ml-auto">{formData.message.length}/500</span>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-6 rounded-2xl flex items-center justify-center gap-4 group shadow-2xl">
                  <span className="text-sm font-black tracking-[0.2em] uppercase">{isSubmitting ? "Sending..." : "Send Message"}</span>
                  <Send className="w-5 h-5 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="mt-32">
          <h2 className="text-center text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05] mb-12">Other Ways to Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
             {[
               { icon: MessageCircle, title: "Live Chat", desc: "Chat with a support representative for immediate resolution.", action: () => user ? setIsChatOpen(true) : router.push("/auth/login?redirect=/contact"), label: "Start Chat" },
               { icon: HelpCircle, title: "FAQ", desc: "Check our frequently asked questions.", action: () => router.push("/faq"), label: "View FAQ" },
               { icon: Users, title: "Community", desc: "Connect with the LuxeCart community.", action: () => {}, label: "Join Forum" }
             ].map((item, i) => (
               <div key={i} className="bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-gray-50 hover:shadow-2xl transition-all duration-500 group">
                 <div className="w-20 h-20 bg-[#002147]/5 rounded-full flex items-center justify-center text-[#eb9a05] mx-auto mb-8 transition-transform group-hover:scale-110">
                   <item.icon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-playfair font-black text-[#002147] mb-4">{item.title}</h3>
                 <p className="text-xs text-gray-400 italic mb-8 leading-relaxed">{item.desc}</p>
                 <button onClick={item.action} className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05] hover:text-[#002147] transition-colors border-b-2 border-transparent hover:border-[#002147] pb-1">{item.label}</button>
               </div>
             ))}
          </div>
        </div>
      </div>

      {isChatOpen && user && <LiveChat onClose={() => setIsChatOpen(false)} />}
    </div>
  )
}
