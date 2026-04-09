"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import type { Category } from "@/lib/types"

interface ProductFiltersProps {
  filters: {
    category: string
    priceRange: [number, number]
    rating: number
    inStock: boolean
    search: string
  }
  onFiltersChange: (filters: any) => void
  categories: Category[]
}

export default function ProductFilters({ filters, onFiltersChange, categories }: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      search: "",
    })
  }

  const hasActiveFilters = filters.category || filters.rating > 0 || filters.inStock || filters.search

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Search Filter */}
      {filters.search && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Search Results</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <span className="text-sm text-blue-800">"{filters.search}"</span>
            <button onClick={() => updateFilter("search", "")} className="ml-2 text-blue-600 hover:text-blue-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <button onClick={() => toggleSection("category")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium">Category</span>
          {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.category && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={filters.category === ""}
                onChange={() => updateFilter("category", "")}
                className="mr-2"
              />
              <span className="text-sm">All Categories</span>
            </label>
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.name}
                  onChange={() => updateFilter("category", category.name)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {category.name} ({category.productCount})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium">Price Range</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilter("priceRange", [Number(e.target.value), filters.priceRange[1]])}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div className="space-y-2">
              {[
                { label: "Under $50", range: [0, 50] },
                { label: "$50 - $100", range: [50, 100] },
                { label: "$100 - $200", range: [100, 200] },
                { label: "$200 - $500", range: [200, 500] },
                { label: "Over $500", range: [500, 1000] },
              ].map((option) => (
                <label key={option.label} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange[0] === option.range[0] && filters.priceRange[1] === option.range[1]}
                    onChange={() => updateFilter("priceRange", option.range)}
                    className="mr-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <button onClick={() => toggleSection("rating")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium">Minimum Rating</span>
          {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => updateFilter("rating", rating)}
                  className="mr-2"
                />
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm ml-1">& up</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="mb-6">
        <button onClick={() => toggleSection("availability")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium">Availability</span>
          {expandedSections.availability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.availability && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => updateFilter("inStock", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">In Stock Only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
