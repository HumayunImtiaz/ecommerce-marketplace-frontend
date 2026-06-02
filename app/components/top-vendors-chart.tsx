"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface TopVendorsChartProps {
  data: { name: string; grossRevenue: number }[]
}

export function TopVendorsChart({ data }: TopVendorsChartProps) {
  return (
    <Card className="col-span-full rounded-3xl border shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b p-6">
        <CardTitle className="text-xl font-bold text-slate-900">Top 5 Vendors Performance</CardTitle>
        <CardDescription>Based on gross revenue generated on the platform</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis 
                type="number"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#002147', fontSize: 12, fontWeight: 700 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                formatter={(value) => [`$${value}`, 'Gross Revenue']}
              />
              <Bar 
                dataKey="grossRevenue" 
                radius={[0, 8, 8, 0]} 
                barSize={32}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#eb9a05' : '#002147'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
