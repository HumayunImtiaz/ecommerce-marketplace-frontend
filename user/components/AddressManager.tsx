'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, Check, Sparkles, Loader2 } from 'lucide-react'
import AddressMapPicker from './AddressMapPicker'
import type { Address } from '@/lib/types'

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [mapOpen, setMapOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/auth/user/addresses')
        if (response.ok) {
          const data = await response.json()
          setAddresses(data.data || [])
        }
      } catch (error) { console.error('Failed to fetch addresses:', error) }
      finally { setLoading(false) }
    }
    fetchAddresses()
  }, [])

  const handleAddressSelect = async (address: Address) => {
    try {
      const response = await fetch('/api/auth/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.data || [])
      }
    } catch (error) { console.error('Failed to add address:', error) }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to release this sanctuary from your records?')) return
    setDeleting(addressId)
    try {
      const response = await fetch(`/api/auth/user/addresses/${addressId}`, { method: 'DELETE' })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.data || [])
      }
    } catch (error) { console.error('Failed to delete address:', error) }
    finally { setDeleting(null) }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/auth/user/addresses/${addressId}/default`, { method: 'PATCH' })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.data || [])
      }
    } catch (error) { console.error('Failed to set default address:', error) }
  }

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#eb9a05]" /></div>

  return (
    <div className="space-y-10">
      <button
        onClick={() => setMapOpen(true)}
        className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl"
      >
        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
        <span className="text-sm font-black tracking-widest uppercase">Establish New Sanctuary</span>
      </button>

      <div className="space-y-6">
        {addresses.length === 0 ? (
          <div className="text-center py-20 bg-[#f8f9fa] rounded-[3rem] border-2 border-dashed border-[#eb9a05]/20 animate-fade-in-up">
            <MapPin className="w-16 h-16 mx-auto mb-6 text-gray-200" />
            <p className="text-xl font-playfair font-black text-[#002147] mb-2">No Sanctuaries Established</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Awaiting your first destination.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#eb9a05]/10 relative group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl transition-all ${address.isDefault ? 'bg-[#002147] text-[#eb9a05]' : 'bg-[#f8f9fa] text-gray-400'}`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-playfair font-black text-[#002147] uppercase tracking-tight">{address.name || 'Personal Sanctuary'}</h3>
                      {address.isDefault && (
                        <div className="flex items-center gap-2 mt-1">
                          <Sparkles className="w-3 h-3 text-[#eb9a05]" />
                          <span className="text-[8px] font-black tracking-widest uppercase text-[#eb9a05]">Primary Destination</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button onClick={() => handleSetDefault(address._id || '')} className="p-3 bg-[#f8f9fa] text-gray-300 hover:text-[#002147] hover:bg-white hover:shadow-md rounded-xl transition-all" title="Set as primary">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(address._id || '')} disabled={deleting === address._id} className="p-3 bg-red-50 text-red-300 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all disabled:opacity-50" title="Release Sanctuary">
                      {deleting === address._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500 font-medium italic leading-relaxed pl-4 border-l-2 border-[#eb9a05]/10">
                  <p>{address.street}</p>
                  <p>{address.city}{address.state && `, ${address.state}`} {address.zipCode && ` ${address.zipCode}`}</p>
                  {address.country && <p className="text-[10px] font-black uppercase tracking-widest text-[#eb9a05] not-italic mt-4">{address.country}</p>}
                </div>

                {address.latitude !== undefined && address.longitude !== undefined && (
                  <div className="mt-8 flex items-center gap-2 text-[8px] font-black tracking-widest uppercase text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-[#eb9a05]/40 animate-pulse"></span>
                    Coordinates Verified: {address.latitude.toFixed(4)}°, {address.longitude.toFixed(4)}°
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddressMapPicker
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  )
}
