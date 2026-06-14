"use client"

import { useState, useEffect } from "react"
import {
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from "lucide-react"
import { vendorApi } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { MonthlyEarningsChart } from "@/components/MonthlyEarningsChart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function VendorDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          vendorApi.getDashboard(),
          vendorApi.getAnalytics()
        ])

        if (statsRes.success) setStats(statsRes.data)
        if (analyticsRes.success) setAnalytics(analyticsRes.data)
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

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalEarnings?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "blue",
      trend: "All time",
      isPositive: true,
    },
    {
      title: "Orders Received",
      value: stats?.totalOrders || "0",
      icon: ShoppingBag,
      color: "orange",
      trend: "All time",
      isPositive: true,
    },
    {
      title: "Active Products",
      value: stats?.totalProducts || "0",
      icon: Package,
      color: "green",
      trend: "All time",
      isPositive: true,
    },
    {
      title: "Avg. Commission",
      value: `${stats?.commissionRate || 10}%`,
      icon: TrendingUp,
      color: "purple",
      trend: "Fixed",
      isPositive: true,
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Store Overview</h1>
          <p className="text-gray-500 mt-1">Track your store performance and sales metrics.</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border ${
          stats?.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
          stats?.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-100' :
          'bg-orange-50 text-orange-700 border-orange-100'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          Store Status: {stats?.status || "PENDING"}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  card.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                    card.color === 'green' ? 'bg-green-50 text-green-600' :
                      'bg-purple-50 text-purple-600'
                }`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {card.trend}
                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
            <h3 className="text-2xl font-black text-[#002147] mt-1">{card.value}</h3>
          </div>
        ))}
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
        {/* Recent Orders Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-[#002147]">Recent Orders</h3>
            <a href="/dashboard/orders" className="text-sm font-bold text-[#eb9a05] hover:underline">View All</a>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[350px]">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="divide-y">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#002147]">{order.customerName}</p>
                        <p className="text-xs text-slate-500 font-medium">Items: {order.items.length}</p>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#002147]">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Your recent orders will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="bg-[#002147] rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-playfair font-black mb-4">Grow Your Sales</h3>
            <p className="text-blue-100/70 text-sm leading-relaxed mb-6">
              Listing more products and providing high-quality images can increase your store visibility by up to 40%.
            </p>
            <button className="w-full py-4 bg-[#eb9a05] text-[#002147] rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-white transition-all">
              Manage Products
            </button>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>
      </div>
    </div>
  )
}
