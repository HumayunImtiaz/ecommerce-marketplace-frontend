"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Percent, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { AdminLoader } from "@/components/admin-loader"

export default function CommissionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [commissionRate, setCommissionRate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await fetch(`/api/admin/vendors/${id}`, { cache: "no-store" })
        const result = await res.json()
        if (result.success) {
          setVendor(result.data)
          setCommissionRate(result.data.commissionRate.toString())
        }
      } catch { toast.error("Error loading vendor") }
      finally { setIsLoading(false) }
    }
    fetchVendor()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const rate = parseFloat(commissionRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return toast.error("Please enter a valid rate between 0 and 100")
    }

    try {
      setIsSaving(true)
      const res = await fetch(`/api/admin/vendors/${id}/commission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: rate })
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Commission rate updated")
        router.push(`/admin/vendors/${id}`)
      } else {
        toast.error(result.message)
      }
    } catch { toast.error("Error saving commission rate") }
    finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="flex justify-center py-20"><AdminLoader /></div>
  if (!vendor) return <div className="p-8 text-center">Vendor not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Commission Rate</h1>
          <p className="text-muted-foreground">{vendor.businessName}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl text-blue-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">
            Updating the commission rate will affect all <strong>future</strong> orders for this vendor. Existing earnings will not be modified.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Platform Commission (%)</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="pl-10 h-12 text-lg font-bold"
                placeholder="e.g. 10.0"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">The percentage of each sale that the platform keeps as a fee.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 bg-slate-900" disabled={isSaving}>
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Rate</>}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
        <h3 className="font-bold text-slate-700 mb-2">How it works</h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc ml-5">
          <li>If an order is $100 and commission is 10%:</li>
          <li>Platform keeps <strong>$10</strong></li>
          <li>Vendor receives <strong>$90</strong></li>
          <li>Calculations are performed automatically when an order is marked as delivered.</li>
        </ul>
      </div>
    </div>
  )
}
