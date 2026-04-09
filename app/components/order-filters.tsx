"use client"
 
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "./date-range-picker"
import { DateRange } from "react-day-picker"
import { Search, X } from "lucide-react"
 
interface OrderFiltersProps {
  filters: {
    status: string
    dateRange: DateRange | undefined
    minAmount: string
  }
  onFiltersChange: (filters: any) => void
}
 
export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }
 
  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      dateRange: undefined,
      minAmount: "",
    })
  }
 
  const hasFilters = filters.status !== "all" || !!filters.dateRange || filters.minAmount !== ""
 
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
        <SelectTrigger className="w-[140px] border-gray-200">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
 
      {/* Calendar Date Picker */}
      <DatePickerWithRange
        date={filters.dateRange}
        setDate={(range) => updateFilter("dateRange", range)}
      />
 
      {/* Min Amount */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
        <Input
          placeholder="Min Amount"
          type="number"
          value={filters.minAmount}
          onChange={(e) => updateFilter("minAmount", e.target.value)}
          className="w-[130px] pl-6 border-gray-200"
        />
      </div>
 
      {/* Clear Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-rose-600 hover:bg-rose-50 px-2"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
