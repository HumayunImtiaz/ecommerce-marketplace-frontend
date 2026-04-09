"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface CustomerFiltersProps {
  filters: {
    provider: string
    status: string
  }
  onFiltersChange: (filters: any) => void
}

export function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      provider: "all",
      status: "all",
    })
  }

  const hasFilters = (filters.provider && filters.provider !== "all") || (filters.status && filters.status !== "all")

  return (
    <div className="flex items-center gap-2">
      <Select value={filters.provider || "all"} onValueChange={(value) => updateFilter("provider", value)}>
        <SelectTrigger className="w-40 border-gray-200">
          <SelectValue placeholder="All Providers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Providers</SelectItem>
          <SelectItem value="local">Local</SelectItem>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
        <SelectTrigger className="w-40 border-gray-200">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="unverified">Unverified</SelectItem>
          <SelectItem value="deleted">Deleted</SelectItem>
        </SelectContent>
      </Select>

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
