"use client"

import { useState, useCallback, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

interface MapPickerProps {
  initialLat: number
  initialLng: number
  onConfirm: (lat: number, lng: number, address: string) => void
}

function LocationMarker({ position, setPosition }: { position: L.LatLng, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function MapPicker({ initialLat, initialLng, onConfirm }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng>(L.latLng(initialLat || 40.7128, initialLng || -74.0060))
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [address, setAddress] = useState("")

  // Reverse Geocoding (Coords to Address)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      if (data && data.display_name) {
        setAddress(data.display_name)
      }
    } catch (error) {
      console.error("Geocoding failed", error)
    }
  }

  // Effect to update address when position changes
  useEffect(() => {
    fetchAddress(position.lat, position.lng)
  }, [position])

  const handleSearch = async () => {
    if (!searchQuery) return
    setSearching(true)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setPosition(L.latLng(Number.parseFloat(lat), Number.parseFloat(lon)))
      } else {
        toast.error("Location not found")
      }
    } catch {
      toast.error("Search failed")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a city or address..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Map Content */}
      <div className="h-[350px] w-full rounded-lg border overflow-hidden relative">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded border text-xs font-medium z-[1000] shadow-sm">
           <MapPin className="h-3 w-3 inline mr-1 text-red-500" />
           {address || "Fetching address..."}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="default" onClick={() => onConfirm(position.lat, position.lng, address)}>
          Confirm Location
        </Button>
      </div>
    </div>
  )
}
