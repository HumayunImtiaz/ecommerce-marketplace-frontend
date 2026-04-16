"use client"

import { useState, useEffect } from "react"
import { AdminLoader } from "./admin-loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Bell, Mail, MessageSquare, Smartphone, Hash } from "lucide-react"
import { Input } from "@/components/ui/input"

export function NotificationSettings() {
  // Use Sonner toast via direct import
  const [loading, setLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    customerNotifications: true,
    inventoryNotifications: true,
    marketingNotifications: false,
    frequency: "immediate",
    notificationEmail: "",
    notificationPhone: "",
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/settings")
        const result = await response.json()
        if (result.success && result.data.notifications) {
          setSettings(result.data.notifications)
        }
      } catch (error) {
        console.error("Failed to fetch notification settings:", error)
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notifications: settings }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Notification settings saved", {
          description: "Your notification preferences have been updated.",
        })
      } else {
        toast.error(result.message || "Failed to save notification settings.")
      }
    } catch (error) {
      toast.error("Failed to save notification settings.")
    } finally {
      setLoading(false)
    }
  }

  const notificationTypes = [
    {
      id: "orderNotifications",
      title: "Order Notifications",
      description: "Get notified about new orders and status changes",
      icon: Bell,
    },
    {
      id: "customerNotifications",
      title: "Customer Notifications",
      description: "Notifications about new customers and support requests",
      icon: MessageSquare,
    },
    {
      id: "inventoryNotifications",
      title: "Inventory Alerts",
      description: "Low stock and inventory management alerts",
      icon: Bell,
    },
    {
      id: "marketingNotifications",
      title: "Marketing Updates",
      description: "Campaign performance and marketing insights",
      icon: Mail,
    },
  ]

  if (isInitialLoad) {
    return <AdminLoader message="Loading settings..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="emailNotifications" className="text-base font-semibold">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
                </div>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            {settings.emailNotifications && (
              <div className="ml-8 space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="notificationEmail" className="text-xs uppercase font-bold text-muted-foreground">Notification Destination Email</Label>
                <Input 
                  id="notificationEmail"
                  placeholder="admin@example.com"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground">This email will receive all administrative alerts.</p>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="smsNotifications" className="text-base font-semibold">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                </div>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsNotifications: checked }))}
              />
            </div>

            {settings.smsNotifications && (
              <div className="ml-8 space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="notificationPhone" className="text-xs uppercase font-bold text-muted-foreground">Mobile Phone Number</Label>
                <div className="relative max-w-md">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="notificationPhone"
                    placeholder="+1 (555) 000-0000"
                    value={settings.notificationPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationPhone: e.target.value }))}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter number in international format (e.g. +1...)</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Configure which types of notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <type.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor={type.id}>{type.title}</Label>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <Switch
                id={type.id}
                checked={settings[type.id as keyof typeof settings] as boolean}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [type.id]: checked }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>How often do you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={settings.frequency}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Notification Settings
        </Button>
      </div>
    </div>
  )
}
