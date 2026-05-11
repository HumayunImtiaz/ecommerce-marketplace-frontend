"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Plus, Minus, Eye, Zap } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { getImageUrl } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addToCart, isInCart, items, updateQuantity } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "")
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "")
  const [quantity, setQuantity] = useState(1)

  const cartItem = items.find(
    (item) => item.product.id === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize,
  )

  const currentQuantityInCart = cartItem?.quantity || 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, quantity, selectedColor, selectedSize)
  }

  const handleUpdateQuantity = (newQuantity: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItem) {
      updateQuantity(cartItem.id, newQuantity <= 0 ? 0 : newQuantity)
    } else if (newQuantity > 0) {
      addToCart(product, newQuantity, selectedColor, selectedSize)
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const savingsPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div
      className="card group relative flex flex-col h-full bg-white transition-all duration-500 overflow-hidden"
      style={{ border: '1.5px solid rgba(210, 180, 140, 0.2)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-[#f8f9fa]">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {savingsPercentage > 0 && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg text-white" style={{ backgroundColor: '#ff4d4d' }}>
              {savingsPercentage}% Off
            </span>
          )}
          {product.isFeatured && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg text-white" style={{ backgroundColor: 'var(--secondary)' }}>
              Elite
            </span>
          )}
        </div>

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 transform translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 z-10"
          style={{ backgroundColor: isInWishlist(product.id) ? 'var(--secondary)' : 'rgba(255,255,255,0.8)', color: isInWishlist(product.id) ? 'white' : 'var(--primary)' }}
        >
          <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="mb-2">
          <h3 className="text-lg font-playfair font-bold line-clamp-1 group-hover:text-[#eb9a05] transition-colors" style={{ color: 'var(--primary)' }}>
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-200"}`} style={{ color: i < Math.floor(product.rating) ? 'var(--secondary)' : '' }} />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-black" style={{ color: 'var(--primary)' }}>${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm line-through opacity-30">${product.originalPrice}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {currentQuantityInCart > 0 ? (
              <div className="flex items-center justify-between p-1 rounded-2xl border-2" style={{ borderColor: 'var(--secondary)' }}>
                <button
                  onClick={(e) => handleUpdateQuantity(currentQuantityInCart - 1, e)}
                  className="p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-lg" style={{ color: 'var(--primary)' }}>{currentQuantityInCart}</span>
                <button
                  onClick={(e) => handleUpdateQuantity(currentQuantityInCart + 1, e)}
                  className="p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full btn-primary group relative overflow-hidden"
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                  <span className="font-bold tracking-widest uppercase text-xs">Add To Cart</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
