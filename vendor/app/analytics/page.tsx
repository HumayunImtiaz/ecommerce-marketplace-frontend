"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Calendar } from "lucide-react"

const revenueData = [
  { name: "Mon", revenue: 2400 },
  { name: "Tue", revenue: 1398 },
  { name: "Wed", revenue: 9800 },
  { name: "Thu", revenue: 3908 },
  { name: "Fri", revenue: 4800 },
  { name: "Sat", revenue: 3800 },
  { name: "Sun", revenue: 4300 },
]

const topProductsData = [
  { name: "Velvet Tuxedo", sales: 45 },
  { name: "Silk Gown", sales: 32 },
  { name: "Leather Shoes", sales: 28 },
  { name: "Gold Cufflinks", sales: 24 },
  { name: "Wool Coat", sales: 18 },
]

const breakdownData = [
  { name: "Net Earnings", value: 85, color: "#002147" },
  { name: "Commission", value: 10, color: "#eb9a05" },
  { name: "Fees", value: 5, color: "#cbd5e1" },
]

export default function VendorAnalytics() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-black text-[#002147]">Business Analytics</h1>
          <p className="text-slate-500 mt-1">Deep dive into your store performance and financial growth.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-white border rounded-xl px-4 py-2 text-slate-600 shadow-sm">
          <Calendar className="w-4 h-4 text-[#eb9a05]" />
          Last 7 Days
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Line Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Revenue Growth</CardTitle>
                <CardDescription>Daily sales performance this week</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#002147]">$32,450.00</p>
                <p className="text-xs text-green-600 font-bold flex items-center justify-end gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }}
                  labelStyle={{ fontWeight: "bold", color: "#002147", marginBottom: "4px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#002147" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#002147", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown Card */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                <PieChartIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Earnings vs Fees</CardTitle>
                <CardDescription>Income distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-4 mt-6">
              {breakdownData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-[#002147]">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products Bar Chart */}
        <Card className="lg:col-span-3 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-[#eb9a05]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Best Selling Masterpieces</CardTitle>
                <CardDescription>Top 5 products by sales volume</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: "bold", fill: "#002147" }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#002147" 
                  radius={[0, 12, 12, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
