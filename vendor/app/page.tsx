"use client"
import { useState, useEffect } from "react"
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { vendorApi } from "@/lib/api"
import { MonthlyEarningsChart } from "@/components/MonthlyEarningsChart"

export default function VendorDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, analyticsRes] = await Promise.all([
          vendorApi.getDashboard(),
          vendorApi.getAnalytics()
        ])
        if (res.success) {
          setData(res.data)
        }
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#002147]" />
      </div>
    )
  }

  if (!data) return <p>Failed to load dashboard data.</p>

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-playfair font-black text-[#002147]">Store Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time overview of your business performance.</p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Revenue</CardTitle>
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#002147]">${data.todayRevenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3" /> Real-time tracking
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Orders</CardTitle>
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#002147]">{data.pendingOrders || 0}</div>
            <p className="text-xs text-slate-400 font-medium mt-2">Requires fulfillment</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Products</CardTitle>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#002147]">{data.totalProducts || 0}</div>
            <p className="text-xs text-slate-400 font-medium mt-2">Listed in catalog</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Low Stock</CardTitle>
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">{data.lowStockItems || 0}</div>
            <p className="text-xs text-red-400 font-medium mt-2 underline cursor-pointer">View items</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Analytics Chart ── */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white mb-8">
        <CardHeader className="px-8 py-6 border-b bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-[#002147]">Monthly Earnings</CardTitle>
              <CardDescription>Your net earnings over the last 6 months</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#002147]"></div>
                <span className="text-xs font-bold text-slate-500">Previous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#eb9a05]"></div>
                <span className="text-xs font-bold text-slate-500">Current Month</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {analytics?.chartData ? (
            <MonthlyEarningsChart data={analytics.chartData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed">
              <p className="text-slate-400 font-medium">No analytics data available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 px-8 py-6">
            <div>
              <CardTitle className="text-lg font-bold text-[#002147]">Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your store</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl font-bold">
              <Link href="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentOrders && data.recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-8 font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right px-8 font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order: any) => (
                    <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-8 font-bold text-[#002147]">
                        {order.id.slice(0, 8).toUpperCase()}...
                      </TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="font-black">${order.total?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                'bg-slate-100 text-slate-700 hover:bg-slate-100'
                          }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8 text-slate-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center text-slate-400">
                You have no recent orders.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <Card className="bg-[#002147] text-white border-none rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-playfair font-black">Sales Tip</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Adding detailed descriptions and 3+ images to your products can increase sales by up to 25%.
              </p>
              <Button className="w-full bg-[#eb9a05] text-[#002147] hover:bg-white rounded-xl font-black uppercase tracking-widest text-xs py-6">
                Update Products
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl p-6">
            <h3 className="font-bold text-[#002147] mb-4">Support</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:border-blue-200 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-blue-600">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-bold">Vendor Guide</p>
                  <p className="text-slate-400 text-xs">Learn how to maximize sales</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
