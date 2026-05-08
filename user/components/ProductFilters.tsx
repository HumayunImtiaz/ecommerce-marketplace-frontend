"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X, Sparkles } from "lucide-react"
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
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      priceRange: [0, 10000],
      rating: 0,
      inStock: false,
      search: "",
    })
  }

  const hasActiveFilters = filters.category || filters.rating > 0 || filters.inStock || filters.search

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-6 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#eb9a05]" />
          <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#002147]">The Filter</h3>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05] hover:text-[#002147] transition-colors flex items-center gap-2">
            Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <button onClick={() => toggleSection("category")} className="flex items-center justify-between w-full mb-6 group">
          <span className="text-xs font-black tracking-widest uppercase text-[#002147] group-hover:text-[#eb9a05] transition-colors">Collections</span>
          {expandedSections.category ? <ChevronUp className="w-4 h-4 opacity-20" /> : <ChevronDown className="w-4 h-4 opacity-20" />}
        </button>

        {expandedSections.category && (
          <div className="space-y-4 animate-fade-in-up">
            <button 
              onClick={() => updateFilter("category", "")}
              className={`w-full text-left flex items-center justify-between group px-4 py-3 rounded-xl transition-all ${filters.category === "" ? "bg-[#002147] text-[#eb9a05] shadow-lg" : "hover:bg-gray-50 text-gray-600"}`}
            >
              <span className="text-xs font-bold uppercase tracking-widest">All Selections</span>
              <div className={`w-1 h-1 rounded-full ${filters.category === "" ? "bg-[#eb9a05]" : "bg-transparent"}`}></div>
            </button>
            {categories.map((category) => (
              <button 
                key={category.id}
                onClick={() => updateFilter("category", category.name)}
                className={`w-full text-left flex items-center justify-between group px-4 py-3 rounded-xl transition-all ${filters.category === category.name ? "bg-[#002147] text-[#eb9a05] shadow-lg" : "hover:bg-gray-50 text-gray-600"}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">{category.name}</span>
                <span className="text-[8px] font-black opacity-40">{category.productCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="pt-8 border-t border-gray-50">
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full mb-6 group">
          <span className="text-xs font-black tracking-widest uppercase text-[#002147] group-hover:text-[#eb9a05] transition-colors">Price Value</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4 opacity-20" /> : <ChevronDown className="w-4 h-4 opacity-20" />}
        </button>

        {expandedSections.price && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30 ml-2">Min</span>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilter("priceRange", [Number(e.target.value), filters.priceRange[1]])}
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30 ml-2">Max</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Boutique Under $100", range: [0, 100] },
                { label: "Elite $100 - $500", range: [100, 500] },
                { label: "Prestige $500 - $1000", range: [500, 1000] },
                { label: "Grandeur Over $1000", range: [1000, 10000] },
              ].map((option) => (
                <button 
                  key={option.label}
                  onClick={() => updateFilter("priceRange", option.range)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filters.priceRange[0] === option.range[0] && filters.priceRange[1] === option.range[1] ? "bg-[#002147] text-[#eb9a05] shadow-lg" : "hover:bg-gray-50 text-gray-600"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="pt-8 border-t border-gray-50">
        <button onClick={() => toggleSection("rating")} className="flex items-center justify-between w-full mb-6 group">
          <span className="text-xs font-black tracking-widest uppercase text-[#002147] group-hover:text-[#eb9a05] transition-colors">Excellence</span>
          {expandedSections.rating ? <ChevronUp className="w-4 h-4 opacity-20" /> : <ChevronDown className="w-4 h-4 opacity-20" />}
        </button>

        {expandedSections.rating && (
          <div className="space-y-3 animate-fade-in-up">
            {[4, 3, 2, 1].map((rating) => (
              <button 
                key={rating}
                onClick={() => updateFilter("rating", rating)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${filters.rating === rating ? "bg-[#002147] shadow-lg" : "hover:bg-gray-50"}`}
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < rating ? (filters.rating === rating ? "text-[#eb9a05]" : "text-[#eb9a05]") : "text-gray-100"}`}>★</span>
                  ))}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${filters.rating === rating ? "text-[#eb9a05]" : "text-gray-600"}`}>& Up</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="pt-8 border-t border-gray-50">
        <button onClick={() => toggleSection("availability")} className="flex items-center justify-between w-full mb-6 group">
          <span className="text-xs font-black tracking-widest uppercase text-[#002147] group-hover:text-[#eb9a05] transition-colors">Availability</span>
          {expandedSections.availability ? <ChevronUp className="w-4 h-4 opacity-20" /> : <ChevronDown className="w-4 h-4 opacity-20" />}
        </button>

        {expandedSections.availability && (
          <button 
            onClick={() => updateFilter("inStock", !filters.inStock)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${filters.inStock ? "bg-[#002147] text-[#eb9a05] shadow-lg" : "hover:bg-gray-50 text-gray-600"}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">In Stock Only</span>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${filters.inStock ? "border-[#eb9a05] bg-[#eb9a05]" : "border-gray-200"}`}>
              {filters.inStock && <div className="w-1.5 h-1.5 rounded-full bg-[#002147]" />}
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
