"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

// Mock coupon data
const coupons = [
  {
    id: 1,
    code: "SAVE20",
    type: "percentage",
    value: 20,
    minAmount: 100,
    usageLimit: 100,
    used: 45,
    status: "active",
    expiresAt: "2024-02-15",
  },
  {
    id: 2,
    code: "WELCOME10",
    type: "fixed",
    value: 10,
    minAmount: 50,
    usageLimit: 500,
    used: 234,
    status: "active",
    expiresAt: "2024-03-01",
  },
  {
    id: 3,
    code: "EXPIRED5",
    type: "percentage",
    value: 5,
    minAmount: 0,
    usageLimit: 1000,
    used: 567,
    status: "expired",
    expiresAt: "2024-01-01",
  },
]

export function CouponManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minAmount: "",
    usageLimit: "",
    expiresAt: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating coupon:", formData)
    setIsDialogOpen(false)
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minAmount: "",
      usageLimit: "",
      expiresAt: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupons & Discounts</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Set up a new discount coupon for your customers.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="SAVE20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder={formData.type === "percentage" ? "20" : "10.00"}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Amount</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    value={formData.minAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires At</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Coupon</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
          <CardDescription>Manage your discount codes and promotional offers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell className="capitalize">{coupon.type}</TableCell>
                  <TableCell>{coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}</TableCell>
                  <TableCell>
                    {coupon.used} / {coupon.usageLimit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.status === "active" ? "default" : "secondary"}>{coupon.status}</Badge>
                  </TableCell>
                  <TableCell>{coupon.expiresAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
