"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Product } from "@/lib/types"
import { useToast } from "./ToastContext"
import { useAuth } from "./AuthContext"
import { wishlistApi } from "@/lib/api"
import { mapProduct } from "@/lib/productMapper"

interface WishlistContextType {
  items: Product[]
  isLoading: boolean
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  syncGuestWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()
  const { user } = useAuth()

  // 1. Fetch wishlist from backend or localStorage on mount/login
  const fetchWishlist = useCallback(async () => {
    setIsLoading(true)
    try {
      if (user) {
        // Fetch from backend
        const res = await wishlistApi.getWishlist()
        if (res.success && Array.isArray(res.data?.products)) {
          const mapped = res.data.products
            .map(mapProduct)
            .filter((p: any): p is Product => p !== null)
          setItems(mapped)
        }
      } else {
        // Fetch from localStorage for guests
        const savedWishlist = localStorage.getItem("wishlist")
        if (savedWishlist) {
          setItems(JSON.parse(savedWishlist))
        } else {
          setItems([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  // 1.5 Auto-sync wishlist when user logs in
  useEffect(() => {
    if (user) {
      syncGuestWishlist()
    }
  }, [user])

  // 2. Persist guest wishlist to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem("wishlist", JSON.stringify(items))
    }
  }, [items, user])

  const addToWishlist = async (product: Product) => {
    try {
      if (user) {
        const res = await wishlistApi.addToWishlist(product.id)
        if (res.success) {
          addToast(`Added ${product.name} to wishlist`, "success")
          await fetchWishlist() // Refresh from backend
        } else {
          addToast(res.message || "Failed to add to wishlist", "error")
        }
      } else {
        // Guest mode
        setItems((prev) => {
          if (prev.find((item) => item.id === product.id)) return prev
          addToast(`Added ${product.name} to wishlist`, "success")
          return [...prev, product]
        })
      }
    } catch (error) {
      addToast("Failed to add to wishlist", "error")
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      if (user) {
        const res = await wishlistApi.removeFromWishlist(productId)
        if (res.success) {
          addToast("Removed from wishlist", "info")
          await fetchWishlist() // Refresh from backend
        } else {
          addToast(res.message || "Failed to remove from wishlist", "error")
        }
      } else {
        // Guest mode
        setItems((prev) => {
          const product = prev.find((item) => item.id === productId)
          if (product) addToast(`Removed ${product.name} from wishlist`, "info")
          return prev.filter((item) => item.id !== productId)
        })
      }
    } catch (error) {
      addToast("Failed to remove from wishlist", "error")
    }
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId)
  }

  const clearWishlist = async () => {
    try {
      if (user) {
        const res = await wishlistApi.clearWishlist()
        if (res.success) {
          addToast("Wishlist cleared", "info")
          setItems([])
        }
      } else {
        setItems([])
        addToast("Wishlist cleared", "info")
      }
    } catch (error) {
      addToast("Failed to clear wishlist", "error")
    }
  }

  const syncGuestWishlist = async () => {
    if (!user) return

    const savedWishlist = localStorage.getItem("wishlist")
    if (!savedWishlist) return

    try {
      const guestItems: Product[] = JSON.parse(savedWishlist)
      if (guestItems.length === 0) return

      const productIds = guestItems.map((item) => item.id)
      const res = await wishlistApi.syncWishlist(productIds)
      
      if (res.success) {
        localStorage.removeItem("wishlist")
        await fetchWishlist() // Get merged wishlist
        addToast("Your guest wishlist has been synced!", "success")
      }
    } catch (error) {
      console.error("Sync error:", error)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        syncGuestWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
