"use client"

import { useFormik } from "formik"
import * as Yup from "yup"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Shield, Key, Smartphone, AlertTriangle, Eye, EyeOff } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
})

export function SecuritySettings() {
  // Use Sonner toast via direct import

  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    ipWhitelist: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  })

  // Show/hide toggles for password fields
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ─── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const adminToken = localStorage.getItem("adminToken")

        const response = await fetch(`${API_BASE_URL}/api/auth/admin/change-password`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          }),
        })

        const result = await response.json()

        if (!response.ok || !result?.success) {
          // Field-level error — show on specific field
          const fieldErr = result?.errors?.[0]
          if (fieldErr?.field === "currentPassword") {
            formik.setFieldError("currentPassword", fieldErr.message)
          } else {
            toast.error(result?.message || "Failed to update password.")
          }
          return
        }

        toast.success("Password Updated", {
          description: "Your password has been changed successfully.",
        })

        resetForm()
      } catch {
        toast.error("Failed to connect to server.")
      }
    },
  })

  // Helper — show error only if field touched
  const fieldError = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : null

  return (
    <div className="space-y-6">

      {/* ── Change Password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your admin account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={fieldError("currentPassword") ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldError("currentPassword") && (
                <p className="text-sm text-red-500">{fieldError("currentPassword")}</p>
              )}
            </div>

            {/* New + Confirm Password */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={fieldError("newPassword") ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldError("newPassword") && (
                  <p className="text-sm text-red-500">{fieldError("newPassword")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={fieldError("confirmPassword") ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldError("confirmPassword") && (
                  <p className="text-sm text-red-500">{fieldError("confirmPassword")}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={formik.isSubmitting || !formik.dirty}
              className="mt-2"
            >
              {formik.isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Two-Factor Auth ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="twoFactorAuth">Enable 2FA</Label>
                <Badge variant={settings.twoFactorAuth ? "default" : "secondary"}>
                  {settings.twoFactorAuth ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure your account with two-factor authentication
              </p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, twoFactorAuth: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Security Preferences ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Preferences
          </CardTitle>
          <CardDescription>Configure additional security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="loginNotifications">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
            </div>
            <Switch
              id="loginNotifications"
              checked={settings.loginNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, loginNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ipWhitelist">IP Whitelist</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access to specific IP addresses
              </p>
            </div>
            <Switch
              id="ipWhitelist"
              checked={settings.ipWhitelist}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, ipWhitelist: checked }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sessionTimeout: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    passwordExpiry: parseInt(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Recommendations ── */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700 dark:text-orange-300">
          <ul className="space-y-2 text-sm">
            <li>• Enable two-factor authentication for enhanced security</li>
            <li>• Use a strong, unique password with at least 12 characters</li>
            <li>• Regularly review login activity and active sessions</li>
            <li>• Keep your browser and devices updated</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}