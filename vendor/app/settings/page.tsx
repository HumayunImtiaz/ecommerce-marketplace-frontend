"use client"

import { useState } from "react"
import { 
  Store, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Save,
  Globe,
  Mail,
  Camera
} from "lucide-react"

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("business")

  const tabs = [
    { id: "business", label: "Business Info", icon: Store },
    { id: "payout", label: "Payout Details", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-playfair font-black text-[#002147]">Store Settings</h1>
        <p className="text-gray-500 mt-1">Configure your business profile and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Tabs Sidebar ── */}
        <aside className="lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                ? "bg-[#002147] text-white shadow-lg" 
                : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* ── Content Area ── */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
            {activeTab === "business" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-[#eb9a05] text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#002147]">Store Logo</h3>
                    <p className="text-xs text-gray-400 mt-1">Recommended: 500x500px, PNG or JPG</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Business Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none" defaultValue="Elegance Boutique" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Business Email</label>
                    <input type="email" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none" defaultValue="contact@elegance.com" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">About the Brand</label>
                    <textarea rows={4} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none resize-none" defaultValue="Exquisite luxury items for the modern connoisseur." />
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                  <button className="bg-[#002147] text-white px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-[#003366] transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "payout" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">Secure Payouts</h4>
                    <p className="text-blue-700/70 text-xs mt-1">Your bank details are encrypted and only used for processing earnings transfers.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Account Holder Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bank Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none" placeholder="Global Reserve Bank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Account Number</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none" placeholder="XXXX XXXX XXXX XXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Routing Number / Swift Code</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#eb9a05] focus:bg-white rounded-2xl transition-all outline-none" placeholder="GRBXXXX" />
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                  <button className="bg-[#002147] text-white px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-[#003366] transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Update Bank Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper icons that were missing
function Edit2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}
