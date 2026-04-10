"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Loader2, Megaphone, Ticket } from "lucide-react"
import { toast } from "sonner"

export function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "0",
    usageLimit: "100",
    limitPerUser: "1",
    expiryDate: "",
    isPublic: false,
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/coupons")
      const result = await response.json()
      if (result.success) {
        setCoupons(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountValue: Number(formData.discountValue),
          minPurchase: Number(formData.minPurchase),
          usageLimit: Number(formData.usageLimit),
          limitPerUser: Number(formData.limitPerUser),
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Coupon created successfully")
        setIsDialogOpen(false)
        fetchCoupons()
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minPurchase: "0",
          usageLimit: "100",
          limitPerUser: "1",
          expiryDate: "",
          isPublic: false,
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to create coupon")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      const response = await fetch(`/api/coupons/${id}`, { method: "DELETE" })
      const result = await response.json()
      if (result.success) {
        toast.success("Coupon removed")
        fetchCoupons()
      }
    } catch (error) {
      toast.error("Failed to delete coupon")
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/coupons/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      const result = await response.json()
      if (result.success) {
        fetchCoupons()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Coupons & Discounts</h2>
          <p className="text-muted-foreground">Manage promotional codes and public offers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Set up a new discount code for your store.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="SAVE20"
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, discountType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                    placeholder="20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Min Purchase ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minPurchase: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limitPerUser">Limit Per User</Label>
                  <Input
                    id="limitPerUser"
                    type="number"
                    value={formData.limitPerUser}
                    onChange={(e) => setFormData((prev) => ({ ...prev, limitPerUser: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Public Coupon</Label>
                  <p className="text-xs text-muted-foreground text-pretty">Show this coupon on the homepage banner</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50">
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>View and manage all your discount codes in one place.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700">Code</TableHead>
                  <TableHead className="font-semibold text-slate-700">Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Value</TableHead>
                  <TableHead className="font-semibold text-slate-700">Limits</TableHead>
                  <TableHead className="font-semibold text-slate-700">Features</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Expires</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="text-muted-foreground">Loading coupons...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No coupons found. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon._id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono font-bold text-blue-600">{coupon.code}</TableCell>
                      <TableCell className="capitalize">{coupon.discountType}</TableCell>
                      <TableCell className="font-semibold">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span>Total: {coupon.usedCount} / {coupon.usageLimit}</span>
                          <span className="text-xs text-muted-foreground italic">Per user: {coupon.limitPerUser}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {coupon.isPublic && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Megaphone className="h-3 w-3 mr-1" /> Public
                            </Badge>
                          )}
                          {coupon.minPurchase > 0 && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                              Min: ${coupon.minPurchase}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={() => toggleStatus(coupon._id, coupon.isActive)}
                        />
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
