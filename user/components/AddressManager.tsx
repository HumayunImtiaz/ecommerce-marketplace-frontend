'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, Check } from 'lucide-react'
import AddressMapPicker from './AddressMapPicker'
import type { Address } from '@/lib/types'

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [mapOpen, setMapOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/auth/user/addresses')
        if (response.ok) {
          const data = await response.json()
          setAddresses(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [])

  // Handle address selection from map
  const handleAddressSelect = async (address: Address) => {
    try {
      const response = await fetch('/api/auth/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      })

      if (response.ok) {
        const data = await response.json()
        setAddresses(data.data || [])
      }
    } catch (error) {
      console.error('Failed to add address:', error)
    }
  }

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setDeleting(addressId)
    try {
      const response = await fetch(`/api/auth/user/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setAddresses(data.data || [])
      }
    } catch (error) {
      console.error('Failed to delete address:', error)
    } finally {
      setDeleting(null)
    }
  }

  // Set default address
  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(
        `/api/auth/user/addresses/${addressId}/default`,
        {
          method: 'PATCH',
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAddresses(data.data || [])
      }
    } catch (error) {
      console.error('Failed to set default address:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Address Button */}
      <button
        onClick={() => setMapOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add New Address
      </button>

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No addresses saved yet</p>
            <p className="text-sm">Click the button above to add your first address</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header with label and default badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {address.name || 'Home'}
                      </h3>
                      {address.isDefault && (
                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() =>
                          handleSetDefault(address._id || '')
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Set as default"
                      >
                        <Check className="w-4 h-4 text-gray-600" />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleDeleteAddress(address._id || '')
                      }
                      disabled={deleting === address._id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="ml-8 space-y-1 text-sm text-gray-700">
                  <p>{address.street}</p>
                  <p>
                    {address.city}
                    {address.state && `, ${address.state}`}
                    {address.zipCode && ` ${address.zipCode}`}
                  </p>
                  {address.country && <p>{address.country}</p>}
                </div>

                {/* Coordinates */}
                {address.latitude !== undefined &&
                  address.longitude !== undefined && (
                    <div className="ml-8 mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <p>
                        📍 {address.latitude.toFixed(4)}°,{' '}
                        {address.longitude.toFixed(4)}°
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Picker Modal */}
      <AddressMapPicker
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  )
}
