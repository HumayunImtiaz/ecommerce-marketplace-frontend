"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { TrendingUp, Users, DollarSign, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminLoader } from "@/components/admin-loader"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics/platform")
        const result = await res.json()
        if (result.success) setData(result.data)
        else toast.error("Failed to load analytics")
      } catch { toast.error("Error connecting to server") }
      finally { setIsLoading(false) }
    }
    fetchAnalytics()
  }, [])

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><AdminLoader /></div>
  if (!data) return <div className="p-8 text-center">No data available</div>

  const COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Analytics</h1>
        <p className="text-muted-foreground">Comprehensive overview of marketplace performance and vendor growth.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Total GMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalGMV.toFixed(2)}</div>
            <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Platform Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalCommission.toFixed(2)}</div>
            <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
              <Activity className="w-3 h-3" /> 10.0% average rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendors</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.vendorPerformance.length}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +2 this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Basket Size</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142.00</div>
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> -2.4% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Vendors Chart */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
            <CardDescription>Based on gross revenue generated</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topVendors} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={100}
                  fontSize={12}
                  tick={{ fill: '#64748b', fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value.toFixed(2)}`, "Gross Revenue"]}
                />
                <Bar dataKey="grossRevenue" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.topVendors.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Platform vs Vendor share</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Vendors Share", value: data.totalGMV - data.totalCommission },
                    { name: "Platform Fee", value: data.totalCommission }
                  ]}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#0ea5e9" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip 
                   formatter={(value: any) => [`$${value.toFixed(2)}`, "Amount"]}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-xs font-medium text-slate-600">Vendors Share</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-xs font-medium text-slate-600">Platform Fee</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle>Vendor Performance Rankings</CardTitle>
          <CardDescription>Detailed breakdown of sales and commission per vendor</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Gross Sales</TableHead>
              <TableHead className="text-right">Commission Paid</TableHead>
              <TableHead className="text-right font-bold">Net Earnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.vendorPerformance.map((v: any) => (
              <TableRow key={v.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-900">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.owner}</p>
                  </div>
                </TableCell>
                <TableCell>{v.products}</TableCell>
                <TableCell className="text-right font-mono text-slate-600">${v.grossRevenue.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono text-red-500">-${v.commissionPaid.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-600">${v.netEarnings.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
