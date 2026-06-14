"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download,
  Calendar,
  ArrowUpRight,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { vendorApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function VendorEarnings() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data, success } = await vendorApi.getPayoutHistory()
      if (success) setData(data)
    } catch (err) {
      toast.error("Failed to load earnings data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount)
    if (isNaN(amount) || amount <= 0) return toast.error("Please enter a valid amount")
    
    if (amount > availableBalance) {
      return toast.error("Amount exceeds available balance")
    }

    try {
      setIsRequesting(true)
      const { success, message } = await vendorApi.requestPayout(amount)
      if (success) {
        toast.success("Payout requested successfully")
        setIsDialogOpen(false)
        setPayoutAmount("")
        fetchData() // Refresh
      } else {
        toast.error(message || "Request failed")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsRequesting(false)
    }
  }

  const earnings = data?.earnings || []
  const history = data?.history || []

  const totalGross = earnings.reduce((sum: number, e: any) => sum + Number(e.grossAmount), 0)
  const totalCommission = earnings.reduce((sum: number, e: any) => sum + Number(e.commissionAmount), 0)
  const totalNet = earnings.reduce((sum: number, e: any) => sum + Number(e.netAmount), 0)
  
  const totalPaid = history
    .filter((p: any) => p.status === "PAID")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const pendingPayouts = history
    .filter((p: any) => p.status === "PENDING")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const availableBalance = Math.max(0, totalNet - totalPaid - pendingPayouts)

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#002147]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Earnings & Payouts</h1>
          <p className="text-slate-500 mt-1">Monitor your revenue, commission, and request withdrawals.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#eb9a05] text-[#002147] hover:bg-[#d48b04] rounded-2xl font-black uppercase tracking-widest text-xs px-8 py-6 shadow-lg shadow-[#eb9a05]/20">
              <Wallet className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-playfair font-black text-[#002147]">Withdraw Earnings</DialogTitle>
              <DialogDescription className="text-slate-500">
                Enter the amount you wish to withdraw to your registered bank account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Available Balance</span>
                <span className="text-xl font-black text-[#002147]">${availableBalance.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Withdrawal Amount ($)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:border-[#eb9a05] focus:bg-white transition-all text-lg font-bold"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>
              {parseFloat(payoutAmount) > availableBalance && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4" />
                  Amount exceeds your available balance
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={handleRequestPayout}
                disabled={isRequesting || !payoutAmount || parseFloat(payoutAmount) > availableBalance}
                className="w-full bg-[#002147] text-white hover:bg-[#003366] rounded-2xl font-black uppercase tracking-widest text-xs py-6 shadow-xl"
              >
                {isRequesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Confirm Withdrawal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-[#002147] text-white overflow-hidden relative group">
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Wallet className="w-6 h-6 text-[#eb9a05]" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none font-bold">Available Now</Badge>
            </div>
            <p className="text-blue-100/60 text-sm font-medium">Available Balance</p>
            <h3 className="text-4xl font-black mt-1">${availableBalance.toFixed(2)}</h3>
          </CardContent>
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-200">Pending Review</Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">Pending Payouts</p>
            <h3 className="text-3xl font-black text-[#002147] mt-1">${pendingPayouts.toFixed(2)}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Lifetime Earnings</p>
            <h3 className="text-3xl font-black text-[#002147] mt-1">${totalNet.toFixed(2)}</h3>
            <div className="mt-4 pt-4 border-t flex justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span>Gross: ${totalGross.toFixed(2)}</span>
              <span>Comms: -${totalCommission.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payout History */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <CardTitle className="text-lg font-bold">Withdrawal History</CardTitle>
            <CardDescription>Status of your requested payouts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                  <TableHead className="px-8 font-bold">Date</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">No payout history found.</TableCell></TableRow>
                ) : (
                  history.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-5 font-black text-[#002147]">${Number(item.amount).toFixed(2)}</td>
                      <td className="py-5">
                        <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }`}>
                          {item.status}
                        </Badge>
                      </td>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <CardTitle className="text-lg font-bold">Recent Order Earnings</CardTitle>
            <CardDescription>Individual order commission breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                  <TableHead className="px-8 font-bold">Date</TableHead>
                  <TableHead className="font-bold">Gross</TableHead>
                  <TableHead className="font-bold">Net (After 10%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">No earnings recorded yet.</TableCell></TableRow>
                ) : (
                  earnings.slice(0, 10).map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-5 text-slate-400 text-sm line-through">${Number(item.grossAmount).toFixed(2)}</td>
                      <td className="py-5 font-black text-emerald-600">+${Number(item.netAmount).toFixed(2)}</td>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
