import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Store, Image as ImageIcon, Phone, Mail, MapPin, Clock, Globe, Info, Share2, PanelBottom, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import("@/components/map-picker"), { 
  ssr: false,
  loading: () => <div className="h-[350px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
})

export function GeneralSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("18:00")
  
  const [settings, setSettings] = useState({
    storeName: "",
    footerText: "",
    logo: "",
    hero: {
      title: "",
      subtitle: "",
      image: "",
      buttonText: "",
      buttonLink: "",
    },
    contact: {
      email: "",
      phone: "",
      address: "",
      workingHours: "",
      latitude: 40.7128,
      longitude: -74.0060,
    },
    about: {
      title: "",
      content: "",
      image: "",
    },
    adminEmail: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        const result = await res.json()
        if (result.success) {
          setSettings(result.data)
          // Handle Working Hours Parsing
          if (result.data.contact.workingHours && result.data.contact.workingHours.includes(" - ")) {
            const [open, close] = result.data.contact.workingHours.split(" - ")
            setOpenTime(open.trim())
            setCloseTime(close.trim())
          }
        }
      } catch (error) {
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const validateSocialLink = (platform: string, url: string) => {
    if (!url) return ""
    let regex = /.*/
    switch (platform) {
      case "facebook":
        regex = /^https?:\/\/(www\.)?facebook\.com\/.+/
        return regex.test(url) ? "" : "Invalid Facebook URL (must start with https://facebook.com/)"
      case "instagram":
        regex = /^https?:\/\/(www\.)?instagram\.com\/.+/
        return regex.test(url) ? "" : "Invalid Instagram URL (must start with https://instagram.com/)"
      case "twitter":
        regex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/
        return regex.test(url) ? "" : "Invalid Twitter/X URL (must start with https://twitter.com/ or https://x.com/)"
      default:
        return ""
    }
  }

  const validateEmail = (email: string) => {
    if (!email) return ""
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email) ? "" : "Invalid email address format"
  }

  const handleSave = async () => {
    // Validate Social Links
    const facebookErr = validateSocialLink("facebook", settings.socialLinks.facebook)
    const instagramErr = validateSocialLink("instagram", settings.socialLinks.instagram)
    const twitterErr = validateSocialLink("twitter", settings.socialLinks.twitter)
    const adminEmailErr = validateEmail(settings.adminEmail)

    if (facebookErr || instagramErr || twitterErr || adminEmailErr) {
      setErrors({
        facebook: facebookErr,
        instagram: instagramErr,
        twitter: twitterErr,
        adminEmail: adminEmailErr,
      })
      toast.error("Please fix validaton errors before saving")
      return
    }

    setSaving(true)
    try {
      // Merge Working Hours
      const updatedSettings = {
        ...settings,
        contact: {
          ...settings.contact,
          workingHours: `${openTime} - ${closeTime}`,
        },
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Settings updated successfully")
      } else {
        toast.error(result.message || "Failed to update settings")
      }
    } catch (error) {
      toast.error("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>Manage your store's identity and logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              placeholder="e.g. LuxeCart"
              value={settings.storeName}
              onChange={(e) => setSettings((prev) => ({ ...prev, storeName: e.target.value }))}
            />
          </div>
          <div className="space-y-4">
            <Label>Store Logo</Label>
            <ImageUpload
              images={settings.logo ? [settings.logo] : []}
              onChange={(urls) => setSettings((prev) => ({ ...prev, logo: urls[0] || "" }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-purple-600" />
            <CardTitle>Hero Section</CardTitle>
          </div>
          <CardDescription>Configure the main promotional banner on the homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={settings.hero.title}
              onChange={(e) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Textarea
              id="heroSubtitle"
              rows={2}
              value={settings.hero.subtitle}
              onChange={(e) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Label>Hero Image</Label>
              <ImageUpload
                images={settings.hero.image ? [settings.hero.image] : []}
                onChange={(urls) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, image: urls[0] || "" } }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="heroBtnText">Button Text</Label>
                <Input
                  id="heroBtnText"
                  value={settings.hero.buttonText}
                  onChange={(e) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, buttonText: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroBtnLink">Button Link</Label>
                <Input
                  id="heroBtnLink"
                  value={settings.hero.buttonLink}
                  onChange={(e) => setSettings((prev) => ({ ...prev, hero: { ...prev.hero, buttonLink: e.target.value } }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-600" />
            <CardTitle>About Section</CardTitle>
          </div>
          <CardDescription>Configure the dynamic about us page content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutTitle">Title</Label>
            <Input
              id="aboutTitle"
              value={settings.about.title}
              onChange={(e) => setSettings((prev) => ({ ...prev, about: { ...prev.about, title: e.target.value } }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aboutContent">Content</Label>
            <Textarea
              id="aboutContent"
              rows={4}
              value={settings.about.content}
              onChange={(e) => setSettings((prev) => ({ ...prev, about: { ...prev.about, content: e.target.value } }))}
            />
          </div>
          <div className="space-y-4">
            <Label>About Image</Label>
            <ImageUpload
              images={settings.about.image ? [settings.about.image] : []}
              onChange={(urls) => setSettings((prev) => ({ ...prev, about: { ...prev.about, image: urls[0] || "" } }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            <CardTitle>Contact Information</CardTitle>
          </div>
          <CardDescription>Displayed in the footer and contact page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Public Contact Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactEmail"
                  className="pl-9"
                  value={settings.contact.email}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Public Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  className="pl-9"
                  value={settings.contact.phone}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="contactAddress">Store Address</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-dashed border-blue-600 text-blue-600 hover:bg-blue-50">
                    <MapPin className="h-3 w-3 mr-1" />
                    Select on Map
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-4">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      Pick Store Location
                    </DialogTitle>
                  </DialogHeader>
                  <MapPicker 
                    initialLat={settings.contact.latitude || 40.7128} 
                    initialLng={settings.contact.longitude || -74.0060} 
                    onConfirm={(lat, lng, addr) => {
                      setSettings(prev => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          latitude: lat,
                          longitude: lng,
                          address: addr || prev.contact.address
                        }
                      }))
                      toast.success("Location set successfully")
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="contactAddress"
                className="pl-9 pr-12"
                placeholder="Find on map or type address..."
                value={settings.contact.address}
                onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Working Hours (Timer)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Open Time</span>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="pl-9"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center pt-5">
                <span className="text-muted-foreground">to</span>
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Close Time</span>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="pl-9"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-pink-600" />
            <CardTitle>Social Links</CardTitle>
          </div>
          <CardDescription>Social media links used across the site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourpage"
                className={errors.facebook ? "border-red-500" : ""}
                value={settings.socialLinks.facebook}
                onChange={(e) => {
                  const val = e.target.value
                  setSettings((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: val } }))
                  setErrors(prev => ({ ...prev, facebook: validateSocialLink("facebook", val) }))
                }}
              />
              {errors.facebook && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.facebook}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yourprofile"
                className={errors.instagram ? "border-red-500" : ""}
                value={settings.socialLinks.instagram}
                onChange={(e) => {
                  const val = e.target.value
                  setSettings((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: val } }))
                  setErrors(prev => ({ ...prev, instagram: validateSocialLink("instagram", val) }))
                }}
              />
              {errors.instagram && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.instagram}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X URL</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/yourhandle"
                className={errors.twitter ? "border-red-500" : ""}
                value={settings.socialLinks.twitter}
                onChange={(e) => {
                  const val = e.target.value
                  setSettings((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: val } }))
                  setErrors(prev => ({ ...prev, twitter: validateSocialLink("twitter", val) }))
                }}
              />
              {errors.twitter && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.twitter}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PanelBottom className="h-5 w-5 text-gray-600" />
            <CardTitle>Footer Content</CardTitle>
          </div>
          <CardDescription>Configure copyright text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footerText">Copyright Text</Label>
            <Input
              id="footerText"
              value={settings.footerText}
              onChange={(e) => setSettings((prev) => ({ ...prev, footerText: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications and SEO */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-600" />
            <CardTitle>System & Admin</CardTitle>
          </div>
          <CardDescription>Backend and notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Notification Email</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="admin@yourstore.com"
              className={errors.adminEmail ? "border-red-500" : ""}
              value={settings.adminEmail}
              onChange={(e) => {
                const val = e.target.value
                setSettings((prev) => ({ ...prev, adminEmail: val }))
                setErrors(prev => ({ ...prev, adminEmail: validateEmail(val) }))
              }}
            />
            {errors.adminEmail && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.adminEmail}</span>}
            <p className="text-xs text-muted-foreground italic">
              All order and system notifications will be sent to this email address.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Update All Site Settings
        </Button>
      </div>
    </div>
  )
}
