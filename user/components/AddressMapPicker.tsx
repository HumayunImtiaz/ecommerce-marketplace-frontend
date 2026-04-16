"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Search, Loader2 } from 'lucide-react'
import type { Address } from '@/lib/types'

interface MapAddress extends Address {
  latitude: number
  longitude: number
}

interface AddressMapPickerProps {
  onAddressSelect: (address: MapAddress) => void
  isOpen: boolean
  onClose: () => void
}

export default function AddressMapPicker({
  onAddressSelect,
  isOpen,
  onClose,
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Select Address
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Search Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                placeholder="Search on map (e.g., '123 Main St, Karachi')"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={searchAddress}
                disabled={searching}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Map Display (Simple representation) */}
          <div className="bg-gray-100 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            {selectedAddress ? (
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  Lat: {selectedAddress.latitude.toFixed(4)}°
                </p>
                <p className="text-sm font-medium">
                  Lon: {selectedAddress.longitude.toFixed(4)}°
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedAddress.street}, {selectedAddress.city}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Search to select location on map</p>
            )}
          </div>

          {/* Address Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Home, Office"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, street: e.target.value }))
                }
                placeholder="123 Main Street"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Karachi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, state: e.target.value }))
                  }
                  placeholder="Sindh"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      zipCode: e.target.value,
                    }))
                  }
                  placeholder="75500"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddressSelect}
              disabled={!selectedAddress || !formData.street || !formData.city}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Add Address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
