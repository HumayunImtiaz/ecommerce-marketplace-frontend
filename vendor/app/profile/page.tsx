"use client"

import { useState, useEffect } from "react"
import { 
  Store, 
  Mail, 
  MapPin, 
  Globe, 
  Camera, 
  Save, 
  Loader2, 
  ShieldCheck,
  Building,
  Phone,
  CreditCard,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { vendorApi } from "@/lib/api"
import { toast } from "sonner"

export default function VendorProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    businessName: "",
    description: "",
    logo: "",
    email: "",
    phone: "",
    address: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountTitle: ""
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, success } = await vendorApi.getProfile()
      if (success) {
        setProfile({
          businessName: data.businessName || "",
          description: data.description || "",
          logo: data.logo || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          address: data.address || "",
          bankDetails: data.bankDetails || {
            bankName: "",
            accountNumber: "",
            accountTitle: ""
          }
        })
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { success, message } = await vendorApi.updateProfile(profile)
      if (success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(message || "Failed to update profile")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Business Profile</h1>
          <p className="text-slate-500 mt-1">Manage your brand identity and contact information.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="bg-[#002147] text-white hover:bg-[#003366] rounded-xl font-black uppercase tracking-widest text-xs px-10 py-6 shadow-lg shadow-blue-900/10"
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* ── Brand Identity ── */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Brand Identity</CardTitle>
                <CardDescription>How your store appears to customers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="h-32 w-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-10 w-10 text-slate-300" />
                  )}
                </div>
                <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-white shadow-xl border-slate-100 hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-[#eb9a05]" />
                </Button>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-xl font-bold text-[#002147]">Store Logo</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Professional logos help build trust. We recommend a square PNG or JPG at least 500x500px.
                </p>
                <Button variant="outline" className="rounded-xl font-bold border-slate-200">Replace Image</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Business Name</Label>
                <Input 
                  className="h-14 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-bold text-[#002147]" 
                  value={profile.businessName}
                  onChange={e => setProfile({...profile, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Business Website (Optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="www.yourstore.com"
                    className="h-14 pl-12 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium" 
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Brand Story / Description</Label>
                <Textarea 
                  rows={5}
                  className="bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium resize-none p-6" 
                  value={profile.description}
                  onChange={e => setProfile({...profile, description: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Bank Details ── */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Bank Information</CardTitle>
                <CardDescription>Withdrawal details for your earnings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Bank Name</Label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="e.g. Chase, HBL, Bank Alfalah"
                    className="h-14 pl-12 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium" 
                    value={profile.bankDetails.bankName}
                    onChange={e => setProfile({
                      ...profile, 
                      bankDetails: { ...profile.bankDetails, bankName: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Account Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Exact name on account"
                    className="h-14 pl-12 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium" 
                    value={profile.bankDetails.accountTitle}
                    onChange={e => setProfile({
                      ...profile, 
                      bankDetails: { ...profile.bankDetails, accountTitle: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Account Number / IBAN</Label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Your bank account number or IBAN"
                    className="h-14 pl-12 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium" 
                    value={profile.bankDetails.accountNumber}
                    onChange={e => setProfile({
                      ...profile, 
                      bankDetails: { ...profile.bankDetails, accountNumber: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Payout Security</h4>
                <p className="text-amber-700/70 text-xs mt-1 leading-relaxed">
                  Please ensure your bank details are accurate. Payouts are processed every Monday and mistakes may cause significant delays in receiving your funds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Contact Info ── */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Contact & Fulfillment</CardTitle>
                <CardDescription>Where we can reach you for orders</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Support Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    disabled
                    className="h-14 pl-12 bg-slate-100/50 border-transparent rounded-2xl font-medium opacity-60" 
                    value={profile.email}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Support Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    className="h-14 pl-12 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium" 
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Store / Warehouse Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    className="h-14 pl-12 bg-slate-50/50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all rounded-2xl font-medium" 
                    value={profile.address}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
