"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem, Product } from "@/lib/types"
import { useToast } from "./ToastContext"
import { useAuth } from "./AuthContext"
import { cartApi } from "@/lib/api"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { addToast } = useToast()
  const { user } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  // Helper to map backend product to frontend product
  const mapProduct = (p: any): Product | null => {
    if (!p) return null
    
    return {
      id: p._id || p.id,
      name: p.name,
      description: p.description || "",
      price: p.price,
      originalPrice: p.comparePrice,
      image: p.images?.[0] || "/placeholder.svg",
      images: p.images || [],
      category: p.category?.name || "Uncategorized",
      categoryId: p.categoryId,
      rating: p.avgRating || 0,
      reviewCount: p.reviewCount || 0,
      inStock: p.inStock ?? (p.totalStock > 0),
      outOfStock: p.outOfStock ?? (p.totalStock <= 0),
      isActive: p.isActive,
      slug: p.slug,
      sku: p.sku
    }
  }

  // Load cart from localStorage or server
  useEffect(() => {
    const initializeCart = async () => {
      if (user) {
        try {
          // 1. Fetch current server cart
          const { data, success } = await cartApi.getCart()
          
          let serverItems: CartItem[] = []
          if (success && data?.items) {
            serverItems = data.items
              .map((item: any) => {
                const mappedProduct = mapProduct(item.productId)
                if (!mappedProduct) return null
                return {
                  id: item._id,
                  product: mappedProduct,
                  quantity: item.quantity,
                  selectedColor: item.selectedColor,
                  selectedSize: item.selectedSize,
                }
              })
              .filter((item: any): item is CartItem => item !== null)
          }

          // 2. Check if there are local items to sync
          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            const localItems: CartItem[] = JSON.parse(savedCart)
            if (localItems.length > 0) {
              // Sync each local item to the server
              for (const item of localItems) {
                await cartApi.addToCart({
                  productId: item.product.id,
                  quantity: item.quantity,
                  selectedColor: item.selectedColor,
                  selectedSize: item.selectedSize
                })
              }
              // Clear local storage after sync
              localStorage.removeItem("cart")
              
              // Refetch canonical cart
              const { data: finalData, success: finalSuccess } = await cartApi.getCart()
              if (finalSuccess && finalData?.items) {
                serverItems = finalData.items
                  .map((item: any) => {
                    const mappedProduct = mapProduct(item.productId)
                    if (!mappedProduct) return null
                    return {
                      id: item._id,
                      product: mappedProduct,
                      quantity: item.quantity,
                      selectedColor: item.selectedColor,
                      selectedSize: item.selectedSize,
                    }
                  })
                  .filter((item: any): item is CartItem => item !== null)
              }
            }
          }
          
          setItems(serverItems)
        } catch (error) {
          console.error("Failed to load or sync cart:", error)
        }
      } else {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      }
      setIsInitialized(true)
    }

    initializeCart()
  }, [user])

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user && isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, user, isInitialized])

  const addToCart = async (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    // Optimistic Update
    const existingItem = items.find(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    )

    if (existingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      )
      
      if (user) {
        // Sync to server
        await cartApi.addToCart({
          productId: product.id,
          quantity,
          selectedColor,
          selectedSize
        })
      }
      addToast(`Updated ${product.name} quantity in cart`, "success")
    } else {
      const tempId = `${product.id}-${selectedColor || ""}-${selectedSize || ""}-${Date.now()}`
      const newItem: CartItem = {
        id: tempId,
        product,
        quantity,
        selectedColor,
        selectedSize,
      }
      setItems((prev) => [...prev, newItem])
      
      if (user) {
        // Sync to server
        const { data, success } = await cartApi.addToCart({
          productId: product.id,
          quantity,
          selectedColor,
          selectedSize
        })
        if (success && data?.items) {
          // Update temp ID with server ID
          const latestItem = data.items.find((item: any) => 
            item.productId.toString() === product.id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          )
          if (latestItem) {
            setItems(prev => prev.map(item => item.id === tempId ? { ...item, id: latestItem._id } : item))
          }
        }
      }
      addToast(`Added ${product.name} to cart`, "success")
    }
  }

  const removeFromCart = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      addToast(`Removed ${item.product.name} from cart`, "info")
    }
    
    // Optimistic Update
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    
    if (user) {
      await cartApi.removeFromCart(itemId)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    // Optimistic Update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    )
    
    if (user) {
      await cartApi.updateQuantity(itemId, quantity)
    }
  }

  const clearCart = async () => {
    setItems([])
    if (user) {
      await cartApi.clearCart()
    }
    addToast("Cart cleared", "info")
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}