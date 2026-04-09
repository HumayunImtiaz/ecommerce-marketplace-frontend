"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Link as LinkIcon, MenuSquare } from "lucide-react"

export function FooterSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [footer, setFooter] = useState({
    quickLinks: [] as { label: string, url: string }[],
    categoryLinks: [] as { label: string, url: string }[],
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        const result = await res.json()
        if (result.success && result.data.footer) {
          setFooter({
            quickLinks: result.data.footer.quickLinks || [],
            categoryLinks: result.data.footer.categoryLinks || [],
          })
        }
      } catch (error) {
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ footer }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Footer settings updated successfully")
      } else {
        toast.error(result.message || "Failed to update settings")
      }
    } catch (error) {
      toast.error("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleArrayChange = (field: "quickLinks" | "categoryLinks", index: number, key: string, value: string) => {
    setFooter((prev) => {
      const newArray = [...prev[field]]
      newArray[index] = { ...newArray[index], [key]: value }
      return { ...prev, [field]: newArray }
    })
  }

  const handleAddArrayItem = (field: "quickLinks" | "categoryLinks") => {
    setFooter((prev) => ({
      ...prev,
      [field]: [...prev[field], { label: "", url: "" }],
    }))
  }

  const handleRemoveArrayItem = (field: "quickLinks" | "categoryLinks", index: number) => {
    setFooter((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-purple-600" />
            <CardTitle>Quick Links</CardTitle>
          </div>
          <CardDescription>Custom links available in the footer's first column</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {footer.quickLinks.map((link, index) => (
            <div key={index} className="flex gap-4 items-end border p-4 rounded-lg relative bg-gray-50/50">
              <div className="flex-1 space-y-2">
                <Label>Label</Label>
                <Input value={link.label} onChange={(e) => handleArrayChange("quickLinks", index, "label", e.target.value)} placeholder="e.g. About Us" />
              </div>
              <div className="flex-1 space-y-2">
                <Label>URL Destination</Label>
                <Input value={link.url} onChange={(e) => handleArrayChange("quickLinks", index, "url", e.target.value)} placeholder="e.g. /about" />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveArrayItem("quickLinks", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => handleAddArrayItem("quickLinks")}>
            <Plus className="h-4 w-4 mr-2" /> Add Quick Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MenuSquare className="h-5 w-5 text-pink-600" />
            <CardTitle>Footer Category Links</CardTitle>
          </div>
          <CardDescription>Featured collections or categories in the footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {footer.categoryLinks.map((link, index) => (
            <div key={index} className="flex gap-4 items-end border p-4 rounded-lg relative bg-gray-50/50">
              <div className="flex-1 space-y-2">
                <Label>Label</Label>
                <Input value={link.label} onChange={(e) => handleArrayChange("categoryLinks", index, "label", e.target.value)} placeholder="e.g. Men's Fashion" />
              </div>
              <div className="flex-1 space-y-2">
                <Label>URL Destination</Label>
                <Input value={link.url} onChange={(e) => handleArrayChange("categoryLinks", index, "url", e.target.value)} placeholder="e.g. /products?category=Men" />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveArrayItem("categoryLinks", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => handleAddArrayItem("categoryLinks")}>
            <Plus className="h-4 w-4 mr-2" /> Add Category Link
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Footer Links
        </Button>
      </div>
    </div>
  )
}
