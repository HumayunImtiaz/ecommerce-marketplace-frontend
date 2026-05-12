"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, 
  Search, 
  CheckCircle, 
  Clock, 
  Building,
  User,
  ExternalLink,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPayouts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/payouts")
      const result = await res.json()
      if (result.success) setPayouts(result.data)
    } catch (err) {
      toast.error("Failed to load payout requests")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${id}/approve`, { method: "PATCH" })
      const result = await res.json()
      if (result.success) {
        toast.success("Payout marked as PAID")
        fetchPayouts()
      } else {
        toast.error(result.message || "Failed to approve")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const filteredPayouts = payouts.filter(p => 
    p.vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#002147]" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002147]">Payout Requests</h1>
          <p className="text-slate-500 mt-1">Review and process vendor withdrawal requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#002147]">
              {payouts.filter(p => p.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#002147]">
              ${payouts.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search vendor or business..." 
              className="pl-12 bg-white border-slate-200 rounded-2xl h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
              <TableHead className="px-8 font-bold">Vendor / Business</TableHead>
              <TableHead className="font-bold">Bank Details</TableHead>
              <TableHead className="font-bold">Amount</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right px-8 font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayouts.map((payout) => (
              <TableRow key={payout.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#002147]">{payout.vendor.businessName}</span>
                    <span className="text-xs text-slate-400">{payout.vendor.user.fullName}</span>
                  </div>
                </td>
                <td className="py-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Building className="h-3 w-3 text-slate-400" />
                    {payout.vendor.bankDetails || "No details provided"}
                  </div>
                </td>
                <td className="py-6 font-black text-[#002147]">
                  ${Number(payout.amount).toFixed(2)}
                </td>
                <td className="py-6">
                  <Badge className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    payout.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {payout.status}
                  </Badge>
                </td>
                <td className="py-6 text-right px-8">
                  {payout.status === "PENDING" ? (
                    <Button 
                      onClick={() => handleApprove(payout.id)}
                      className="bg-[#002147] text-white hover:bg-[#003366] rounded-xl font-bold text-xs"
                    >
                      Process Payment
                    </Button>
                  ) : (
                    <div className="text-[10px] font-black text-emerald-600 uppercase flex items-center justify-end gap-1">
                      <CheckCircle className="h-3 w-3" /> Paid on {new Date(payout.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
