"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Users, Target, Shield, History, Leaf, Calendar as CalendarIcon } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AboutSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [about, setAbout] = useState({
    title: "",
    content: "",
    image: "",
    stats: [] as any[],
    values: [] as any[],
    team: [] as any[],
    milestones: [] as any[],
    mission: {
      title: "",
      content: [] as string[],
      image: "",
    },
    sustainability: {
      title: "",
      description: "",
      image: "",
      bullets: [] as string[],
    }
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        const result = await res.json()
        if (result.success && result.data.about) {
          setAbout({
            ...result.data.about,
            stats: result.data.about.stats || [],
            values: result.data.about.values || [],
            team: result.data.about.team || [],
            milestones: result.data.about.milestones || [],
            mission: result.data.about.mission || { title: "", content: [], image: "" },
            sustainability: result.data.about.sustainability || { title: "", description: "", image: "", bullets: [] },
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
        body: JSON.stringify({ about }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success("About settings updated successfully")
      } else {
        toast.error(result.message || "Failed to update settings")
      }
    } catch (error) {
      toast.error("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleArrayChange = (field: string, index: number, key: string, value: string) => {
    setAbout((prev: any) => {
      const newArray = [...prev[field]]
      newArray[index] = { ...newArray[index], [key]: value }
      return { ...prev, [field]: newArray }
    })
  }

  const handleAddArrayItem = (field: string, defaultItem: any) => {
    setAbout((prev: any) => ({
      ...prev,
      [field]: [...prev[field], defaultItem],
    }))
  }

  const handleRemoveArrayItem = (field: string, index: number) => {
    setAbout((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
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
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle>Company Stats</CardTitle>
          </div>
          <CardDescription>Manage your company's key performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {about.stats.map((stat, index) => (
            <div key={index} className="flex gap-4 items-end border p-4 rounded-lg relative bg-gray-50/50">
              <div className="flex-1 space-y-2">
                <Label>Label</Label>
                <Input value={stat.label} onChange={(e) => handleArrayChange("stats", index, "label", e.target.value)} placeholder="e.g. Happy Customers" />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Value</Label>
                <Input value={stat.value} onChange={(e) => handleArrayChange("stats", index, "value", e.target.value)} placeholder="e.g. 50K+" />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Icon Name</Label>
                <Input value={stat.icon} onChange={(e) => handleArrayChange("stats", index, "icon", e.target.value)} placeholder="e.g. Users" />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveArrayItem("stats", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => handleAddArrayItem("stats", { label: "", value: "", icon: "Users" })}>
            <Plus className="h-4 w-4 mr-2" /> Add Stat
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle>Core Values</CardTitle>
          </div>
          <CardDescription>Manage your company's core values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {about.values.map((v, index) => (
            <div key={index} className="space-y-4 border p-4 rounded-lg relative bg-gray-50/50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Value #{index + 1}</h4>
                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveArrayItem("values", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={v.title} onChange={(e) => handleArrayChange("values", index, "title", e.target.value)} placeholder="e.g. Quality Assurance" />
                </div>
                <div className="space-y-2">
                  <Label>Icon Name</Label>
                  <Input value={v.icon} onChange={(e) => handleArrayChange("values", index, "icon", e.target.value)} placeholder="e.g. Shield" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={v.description} onChange={(e) => handleArrayChange("values", index, "description", e.target.value)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => handleAddArrayItem("values", { title: "", description: "", icon: "Star" })}>
            <Plus className="h-4 w-4 mr-2" /> Add Value
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle>Team Members</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {about.team.map((member, index) => (
            <div key={index} className="space-y-4 border p-4 rounded-lg relative bg-gray-50/50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Team Member #{index + 1}</h4>
                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveArrayItem("team", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={member.name} onChange={(e) => handleArrayChange("team", index, "name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={member.role} onChange={(e) => handleArrayChange("team", index, "role", e.target.value)} />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Member Image</Label>
                <ImageUpload
                  images={member.image ? [member.image] : []}
                  onChange={(urls) => handleArrayChange("team", index, "image", urls[0] || "")}
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={member.bio} onChange={(e) => handleArrayChange("team", index, "bio", e.target.value)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => handleAddArrayItem("team", { name: "", role: "", bio: "", image: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Add Team Member
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-amber-600" />
            <CardTitle>Milestones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {about.milestones.map((m, index) => (
            <div key={index} className="flex gap-4 items-end border p-4 rounded-lg relative bg-gray-50/50">
              <div className="w-1/4 space-y-2">
                <Label>Year</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !m.year && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {m.year ? m.year : <span>Pick year</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={m.year ? new Date(Number(m.year), 0, 1) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleArrayChange("milestones", index, "year", date.getFullYear().toString())
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Title</Label>
                <Input value={m.title} onChange={(e) => handleArrayChange("milestones", index, "title", e.target.value)} />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Description</Label>
                <Input value={m.description} onChange={(e) => handleArrayChange("milestones", index, "description", e.target.value)} />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveArrayItem("milestones", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => handleAddArrayItem("milestones", { year: "", title: "", description: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Add Milestone
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <CardTitle>Our Mission</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={about.mission?.title} onChange={(e) => setAbout(prev => ({ ...prev, mission: { ...prev.mission, title: e.target.value } }))} placeholder="Our Mission" />
          </div>
          <div className="space-y-4">
            <Label>Mission Image</Label>
            <ImageUpload
              images={about.mission?.image ? [about.mission.image] : []}
              onChange={(urls) => setAbout(prev => ({ ...prev, mission: { ...prev.mission, image: urls[0] || "" } }))}
            />
          </div>
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center mb-2">
              <Label>Content Paragraphs</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setAbout(prev => ({ ...prev, mission: { ...prev.mission, content: [...prev.mission.content, ""] } }))}>
                <Plus className="h-4 w-4 mr-2" /> Add Paragraph
              </Button>
            </div>
            {about.mission?.content?.map((text: string, index: number) => (
              <div key={index} className="flex gap-2 items-start mb-2">
                <Textarea 
                  value={text} 
                  onChange={(e) => {
                    const newContent = [...about.mission.content];
                    newContent[index] = e.target.value;
                    setAbout(prev => ({ ...prev, mission: { ...prev.mission, content: newContent } }))
                  }} 
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => {
                    const newContent = about.mission.content.filter((_, i) => i !== index);
                    setAbout(prev => ({ ...prev, mission: { ...prev.mission, content: newContent } }))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            <CardTitle>Committed to Sustainability</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={about.sustainability?.title} onChange={(e) => setAbout(prev => ({ ...prev, sustainability: { ...prev.sustainability, title: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={about.sustainability?.description} onChange={(e) => setAbout(prev => ({ ...prev, sustainability: { ...prev.sustainability, description: e.target.value } }))} />
          </div>
          <div className="space-y-4">
            <Label>Sustainability Image</Label>
            <ImageUpload
              images={about.sustainability?.image ? [about.sustainability.image] : []}
              onChange={(urls) => setAbout(prev => ({ ...prev, sustainability: { ...prev.sustainability, image: urls[0] || "" } }))}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label>Bullets</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setAbout(prev => ({ ...prev, sustainability: { ...prev.sustainability, bullets: [...prev.sustainability.bullets, ""] } }))}>
                <Plus className="h-4 w-4 mr-2" /> Add Bullet
              </Button>
            </div>
            {about.sustainability?.bullets?.map((text: string, index: number) => (
              <div key={index} className="flex gap-2 items-start mb-2">
                <Input 
                  value={text} 
                  onChange={(e) => {
                    const newBullets = [...about.sustainability.bullets];
                    newBullets[index] = e.target.value;
                    setAbout(prev => ({ ...prev, sustainability: { ...prev.sustainability, bullets: newBullets } }))
                  }} 
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => {
                    const newBullets = about.sustainability.bullets.filter((_, i) => i !== index);
                    setAbout(prev => ({ ...prev, sustainability: { ...prev.sustainability, bullets: newBullets } }))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save About Settings
        </Button>
      </div>
    </div>
  )
}
