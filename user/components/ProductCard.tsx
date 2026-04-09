"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingCart, Plus, Minus, Eye, Zap } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"

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
  const [showQuickView, setShowQuickView] = useState(false)

  // Get current cart item for this product with same options
  const cartItem = items.find(
    (item) =>
      item.product.id === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize,
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
      if (newQuantity <= 0) {
        updateQuantity(cartItem.id, 0) // This will remove the item
      } else {
        updateQuantity(cartItem.id, newQuantity)
      }
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  // Calculate savings
  const savings = product.originalPrice ? product.originalPrice - product.price : 0
  const savingsPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
        <div className="relative">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlistToggle}
              className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                isInWishlist(product.id)
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
              }`}
            >
              <Heart className="w-3 h-3" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleQuickView}
              className="p-1.5 rounded-full bg-white/80 text-gray-600 hover:bg-blue-500 hover:text-white backdrop-blur-sm transition-colors"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {savingsPercentage > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                -{savingsPercentage}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center">
                <Zap className="w-2 h-2 mr-1" />
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="p-3 flex flex-col flex-1 relative">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm mb-1 hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-1">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <span className="text-lg font-bold text-blue-600">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
            )}
          </div>

          {/* Sticky Add to Cart */}
          <div className="mt-auto">
            <div className="sticky bottom-0 bg-white pt-2 border-t border-gray-100">
              {currentQuantityInCart > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center border rounded-xl">
                    <button
                      onClick={(e) => handleUpdateQuantity(currentQuantityInCart - 1, e)}
                      className="p-1 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 py-1 text-sm font-medium">{currentQuantityInCart}</span>
                    <button
                      onClick={(e) => handleUpdateQuantity(currentQuantityInCart + 1, e)}
                      className="p-1 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-green-600 font-medium">In Cart</span>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    product.inStock
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "featured") {
    return (
      <div
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border-2 border-blue-100 flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </Link>

          {/* Floating Action Buttons */}
          <div
            className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-300 ${
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            }`}
          >
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 ${
                isInWishlist(product.id)
                  ? "bg-red-500 text-white scale-110"
                  : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110"
              }`}
            >
              <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleQuickView}
              className="p-3 rounded-full bg-white/90 text-gray-600 hover:bg-blue-500 hover:text-white backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Premium Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {savingsPercentage > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                Save ${savings.toFixed(0)}
              </div>
            )}
            {product.isFeatured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                <Zap className="w-4 h-4 mr-1" />
                Featured
              </div>
            )}
            {product.isTrending && (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                🔥 Trending
              </div>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1 relative">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-xl mb-3 hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

          {/* Enhanced Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2 font-medium">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Colors:</span>
              <div className="flex space-x-2">
                {product.colors.slice(0, 4).map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedColor(color)
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-blue-500 scale-110" : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor:
                        color.toLowerCase() === "white"
                          ? "#ffffff"
                          : color.toLowerCase() === "black"
                            ? "#000000"
                            : color.toLowerCase() === "blue"
                              ? "#3b82f6"
                              : color.toLowerCase() === "red"
                                ? "#ef4444"
                                : color.toLowerCase() === "green"
                                  ? "#10b981"
                                  : color.toLowerCase() === "gray"
                                    ? "#6b7280"
                                    : color.toLowerCase() === "navy"
                                      ? "#1e3a8a"
                                      : color.toLowerCase() === "purple"
                                        ? "#8b5cf6"
                                        : color.toLowerCase() === "pink"
                                          ? "#ec4899"
                                          : color.toLowerCase() === "yellow"
                                            ? "#f59e0b"
                                            : color.toLowerCase() === "orange"
                                              ? "#f97316"
                                              : "#6b7280",
                    }}
                    title={color}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-gray-500 flex items-center">+{product.colors.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* Price with Enhanced Styling */}
          <div className="mb-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    Save ${savings.toFixed(0)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Sticky Add to Cart */}
          <div className="mt-auto">
            <div className="sticky bottom-0 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mb-6 px-6 py-4 border-t border-blue-100">
              {currentQuantityInCart > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center border-2 border-blue-200 rounded-xl bg-white">
                      <button
                        onClick={(e) => handleUpdateQuantity(currentQuantityInCart - 1, e)}
                        className="p-2 hover:bg-blue-50 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-4 h-4 text-blue-600" />
                      </button>
                      <span className="px-4 py-2 font-bold text-blue-600">{currentQuantityInCart}</span>
                      <button
                        onClick={(e) => handleUpdateQuantity(currentQuantityInCart + 1, e)}
                        className="p-2 hover:bg-blue-50 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-semibold">✓ In Cart</div>
                      <div className="text-xs text-gray-500">
                        Total: ${(product.price * currentQuantityInCart).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                    product.inStock
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-blue-200 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Floating Action Buttons */}
        <div
          className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 ${
              isInWishlist(product.id)
                ? "bg-red-500 text-white scale-110"
                : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110"
            }`}
          >
            <Heart className="w-4 h-4" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleQuickView}
            className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-blue-500 hover:text-white backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Enhanced Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {savingsPercentage > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              -{savingsPercentage}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-md">
              <Zap className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
          {product.isTrending && (
            <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              🔥 Hot
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 relative">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Enhanced Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Colors:</span>
              <div className="flex space-x-1">
                {product.colors.slice(0, 3).map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedColor(color)
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-blue-500 scale-110" : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor:
                        color.toLowerCase() === "white"
                          ? "#ffffff"
                          : color.toLowerCase() === "black"
                            ? "#000000"
                            : color.toLowerCase() === "blue"
                              ? "#3b82f6"
                              : color.toLowerCase() === "red"
                                ? "#ef4444"
                                : color.toLowerCase() === "green"
                                  ? "#10b981"
                                  : color.toLowerCase() === "gray"
                                    ? "#6b7280"
                                    : color.toLowerCase() === "navy"
                                      ? "#1e3a8a"
                                      : "#6b7280",
                    }}
                    title={color}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-gray-500 flex items-center">+{product.colors.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-blue-600">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                Save ${savings.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        {/* Sticky Add to Cart */}
        <div className="mt-auto">
          <div className="sticky bottom-0 bg-white pt-3 border-t border-gray-100 -mx-4 -mb-4 px-4 pb-4">
            {currentQuantityInCart > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                    <button
                      onClick={(e) => handleUpdateQuantity(currentQuantityInCart - 1, e)}
                      className="p-1 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-medium">{currentQuantityInCart}</span>
                    <button
                      onClick={(e) => handleUpdateQuantity(currentQuantityInCart + 1, e)}
                      className="p-1 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-semibold">✓ In Cart</div>
                    <div className="text-xs text-gray-500">${(product.price * currentQuantityInCart).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                    product.inStock
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
