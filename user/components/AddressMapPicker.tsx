"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Search, Loader2, Sparkles } from 'lucide-react'
import type { Address } from '@/lib/types'

interface MapAddress extends Address {
  latitude: number
  longitude: number
}

interface AddressMapPickerProps {
  onAddressSelect: (address: MapAddress) => void
  isOpen: boolean
  onClose: () => void
  isFullPage?: boolean
}

export default function AddressMapPicker({
  onAddressSelect,
  isOpen,
  onClose,
  isFullPage = false
}: AddressMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [selectedAddress, setSelectedAddress] = useState<MapAddress | null>(null)
  const [searching, setSearching] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  })

  // Simple geocoding using OpenStreetMap Nominatim API
  const searchAddress = async () => {
    if (!search.trim()) return

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          search
        )}`
      )
      const results = await response.json()

      if (results.length > 0) {
        const result = results[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)

        // Reverse geocode to get address details
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        )
        const addressData = await reverseResponse.json()
        const addr = addressData.address

        setFormData((prev) => ({
          ...prev,
          street: addr.road || addr.pedestrian || '',
          city: addr.city || addr.town || '',
          state: addr.state || '',
          zipCode: addr.postcode || '',
        }))

        setSelectedAddress({
          id: '',
          name: formData.name,
          street: addr.road || addr.pedestrian || '',
          city: addr.city || addr.town || '',
          state: addr.state || '',
          zipCode: addr.postcode || '',
          country: 'Pakistan',
          latitude: lat,
          longitude: lon,
        })
      }
    } catch (error) {
      console.error('Failed to search address:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddressSelect = () => {
    if (selectedAddress && formData.street && formData.city) {
      const fullAddress: MapAddress = {
        name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      }
      onAddressSelect(fullAddress)
      onClose()
      setSearch('')
      setSelectedAddress(null)
    }
  }

  if (!isOpen) return null

  const content = (
    <div className={`bg-white shadow-2xl w-full flex flex-col overflow-hidden animate-fade-in-up ${isFullPage ? '' : 'rounded-[2rem] md:rounded-[3rem] max-w-lg max-h-[95vh]'}`}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-6 md:p-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#eb9a05]/10 text-[#eb9a05]">
              <MapPin className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-playfair font-black text-[#002147]">Select Address</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#002147] transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Search */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">Search Area</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                placeholder="Search location (e.g. 123 Main St, Karachi)"
                className="flex-1 bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none placeholder:text-gray-300"
              />
              <button
                onClick={searchAddress}
                disabled={searching}
                className="bg-[#002147] hover:bg-[#002b5c] disabled:bg-gray-100 text-[#eb9a05] px-5 py-3 rounded-xl transition-all"
              >
                {searching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-[#f8f9fa] rounded-3xl p-6 min-h-[160px] flex items-center justify-center border-2 border-dashed border-[#eb9a05]/10 group transition-all hover:border-[#eb9a05]/30">
            {selectedAddress ? (
              <div className="text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#eb9a05]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-[#eb9a05]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#002147]">Location Verified</p>
                <p className="text-[10px] text-gray-400 mt-1 italic max-w-[200px]">
                  {selectedAddress.street}, {selectedAddress.city}
                </p>
              </div>
            ) : (
              <div className="text-center opacity-30">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-[10px] font-black uppercase tracking-widest">Pinpoint on Map</p>
              </div>
            )}
          </div>

          {/* Address Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">Label</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Home, Office"
                className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">Street Address *</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
                placeholder="123 Main Street"
                className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Karachi"
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="Sindh"
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="75500"
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black tracking-widest uppercase text-[#002147] opacity-40 ml-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#eb9a05] outline-none appearance-none"
                >
                  <option>Pakistan</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>UAE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coordinates Display */}
          {selectedAddress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">Coordinates:</p>
              <p className="text-blue-700">
                Latitude: {selectedAddress.latitude.toFixed(6)}°
              </p>
              <p className="text-blue-700">
                Longitude: {selectedAddress.longitude.toFixed(6)}°
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-100 font-black text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all text-[#002147]"
            >
              Cancel
            </button>
            <button
              onClick={handleAddressSelect}
              disabled={!selectedAddress || !formData.street || !formData.city}
              className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-4 group disabled:opacity-30 disabled:grayscale"
            >
              <span className="text-[10px] font-black tracking-widest uppercase">Add Address</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )

    if (isFullPage) return content

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002147]/40 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    )
}
