"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddCustomerDialog({ open, onOpenChange, onSuccess }: AddCustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    provider: "local",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add customer")
      }

      toast.success("Customer added successfully", {
        description: `${formData.fullName} has been added to your system.`,
      })

      setFormData({
        fullName: "",
        email: "",
        password: "",
        provider: "local",
      })

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Failed to add customer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer account manually. Admin-added users are verified by default.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Auth Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Account</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Customer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
