"use client"


// Client Component — sirf UI + form logic 

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Clock, Save, X, Key, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateAdminProfileAction, changeAdminPasswordAction } from "@/app/actions/admin.actions"

// Yup Schemas
const profileSchema = Yup.object({
  name:  Yup.string().trim().min(2, "Name must be at least 2 characters").required("Full name is required"),
  email: Yup.string().trim().email("Please enter a valid email").required("Email is required"),
  bio:   Yup.string().trim().max(500, "Bio cannot exceed 500 characters").optional(),
})

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword:     Yup.string().min(6, "At least 6 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
})

// Format last login date
const formatLastLogin = (date: string | null): string => {
  if (!date) return "No login recorded"
  return new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
}

interface Props {
  initialData: {
    name:      string
    email:     string
    bio:       string
    avatar:    string | null
    lastLogin: string | null
  }
}

export default function AdminProfileClient({ initialData }: Props) {
  // Use Sonner toast via direct import
  const [isEditing, setIsEditing]         = useState(false)
  const [twoFactor, setTwoFactor]         = useState(false)
  const [showCurrent, setShowCurrent]     = useState(false)
  const [showNew, setShowNew]             = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)

  // Avatar states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.avatar ? (initialData.avatar.startsWith("http") ? initialData.avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/uploads/${initialData.avatar}`) : null
  )

  // Profile Formik
  const profileFormik = useFormik({
    initialValues: {
      name:  initialData.name,
      email: initialData.email,
      bio:   initialData.bio,
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("bio", values.bio || "")
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const result = await updateAdminProfileAction(formData)

      if (!result.success) {
        if (result.field === "email") {
          profileFormik.setFieldError("email", result.message)
        } else {
          toast.error(result.message)
        }
        return
      }

      toast.success("Profile Updated", { description: "Your profile has been saved." })
      setIsEditing(false)
    },
  })

  const handleCancel = () => {
    profileFormik.setValues({
      name:  initialData.name,
      email: initialData.email,
      bio:   initialData.bio,
    })
    profileFormik.setTouched({})
    setAvatarFile(null)
    setAvatarPreview(
      initialData.avatar ? (initialData.avatar.startsWith("http") ? initialData.avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/uploads/${initialData.avatar}`) : null
    )
    setIsEditing(false)
  }

  const pe = (f: keyof typeof profileFormik.values) =>
    profileFormik.touched[f] && profileFormik.errors[f] ? profileFormik.errors[f] : null

  //  Password Formik
  const pwFormik = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      const result = await changeAdminPasswordAction(values)

      if (!result.success) {
        if (result.field === "currentPassword") {
          pwFormik.setFieldError("currentPassword", result.message)
        } else {
          toast.error(result.message)
        }
        return
      }

      toast.success("Password Updated", { description: "Password changed successfully." })
      resetForm()
    },
  })

  const we = (f: keyof typeof pwFormik.values) =>
    pwFormik.touched[f] && pwFormik.errors[f] ? pwFormik.errors[f] : null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and security settings</p>
        </div>

        {/* ── Profile Overview ── */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div 
                  className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  <Avatar className="h-20 w-20">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Avatar" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                      {profileFormik.values.name.split(" ").map((n) => n[0]).join("") || "A"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setAvatarFile(file)
                        setAvatarPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{profileFormik.values.name || "Admin"}</h2>
                  <p className="text-muted-foreground">{profileFormik.values.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last login: {formatLastLogin(initialData.lastLogin)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={twoFactor ? "default" : "secondary"} className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>{twoFactor ? "2FA Enabled" : "2FA Disabled"}</span>
                </Badge>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => profileFormik.handleSubmit()}
                      disabled={profileFormik.isSubmitting || (!profileFormik.dirty && !avatarFile)}
                    >
                      {profileFormik.isSubmitting
                        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                        : <><Save className="h-4 w-4 mr-2" />Save</>
                      }
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ── Details Grid ── */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name" name="name"
                  value={profileFormik.values.name}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  disabled={!isEditing}
                  className={pe("name") ? "border-red-500" : ""}
                />
                {pe("name") && <p className="text-xs text-red-500">{pe("name")}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email" name="email" type="email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  disabled={!isEditing}
                  className={pe("email") ? "border-red-500" : ""}
                />
                {pe("email") && <p className="text-xs text-red-500">{pe("email")}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio" name="bio"
                  value={profileFormik.values.bio}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  disabled={!isEditing}
                  className="min-h-[100px] resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {profileFormik.values.bio.length}/500
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* 2FA */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} disabled={!isEditing} />
              </div>

              <Separator />

              {/* Last Login */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />Last Login
                </Label>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-mono">{formatLastLogin(initialData.lastLogin)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Your most recent successful login</p>
                </div>
              </div>

              <Separator />

              {/* Change Password */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />Change Password
                </Label>

                <form onSubmit={pwFormik.handleSubmit} className="space-y-3">
                  {[
                    { id: "currentPassword", label: "Current Password", show: showCurrent, setShow: setShowCurrent },
                    { id: "newPassword",     label: "New Password",     show: showNew,     setShow: setShowNew },
                    { id: "confirmPassword", label: "Confirm Password", show: showConfirm,  setShow: setShowConfirm },
                  ].map(({ id, label, show, setShow }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-sm text-muted-foreground">{label}</Label>
                      <div className="relative">
                        <Input
                          id={id} name={id}
                          type={show ? "text" : "password"}
                          placeholder={id === "newPassword" ? "Min. 6 characters" : `Enter ${label.toLowerCase()}`}
                          value={(pwFormik.values as any)[id]}
                          onChange={pwFormik.handleChange}
                          onBlur={pwFormik.handleBlur}
                          className={`pr-10 ${we(id as any) ? "border-red-500" : ""}`}
                        />
                        <button type="button" onClick={() => setShow((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {we(id as any) && <p className="text-xs text-red-500">{we(id as any)}</p>}
                    </div>
                  ))}

                  <Button type="submit" size="sm" className="w-full"
                    disabled={pwFormik.isSubmitting || !pwFormik.dirty}>
                    {pwFormik.isSubmitting
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                      : <><Key className="h-4 w-4 mr-2" />Update Password</>
                    }
                  </Button>
                </form>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}