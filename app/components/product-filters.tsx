"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Filter } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface CategoryItem {
  _id: string
  name: string
  slug: string
  isActive: boolean
}

interface ProductFiltersProps {
  filters: {
    categorySlug: string
    status: string
    priceRange: number[]
  }
  onFiltersChange: (filters: any) => void
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)

        const response = await fetch("/api/categories")
        const result = await response.json()

        if (result?.success && Array.isArray(result.data)) {
          const activeCategories = result.data.filter(
            (cat: CategoryItem) => cat.isActive
          )
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      categorySlug: "all",
      status: "all",
      priceRange: [0, 1000000],
    })
  }

  return (
    <div className="flex gap-2">
      <Select value={filters.categorySlug} onValueChange={(value) => updateFilter("categorySlug", value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={categoriesLoading ? "Loading..." : "Category"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat._id} value={cat.slug || cat.name.toLowerCase().replace(/ /g, "-")}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Price Range
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Price Range</label>
              <div className="mt-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter("priceRange", value)}
                  max={1000000}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" onClick={clearFilters}>
        Clear
      </Button>
    </div>
  )
}