export interface ProductVariant {
  id: string
  color: string
  size: string
  price: number | null
  stock?: { quantity: number; status: string } | null
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number       // backend: comparePrice
  image: string                // backend: images[0]
  images: string[]
  category: string             // backend: category.name
  categoryId?: string
  rating: number               // backend mein nahi — 0 default
  reviewCount: number          // backend mein nahi — 0 default
  inStock: boolean             // backend: totalStock > 0
  totalStock?: number          // backend: totalStock
  colors?: string[]            // backend: variants[].color
  sizes?: string[]             // backend: variants[].size
  variants?: ProductVariant[]  // backend: full variant data with prices
  features?: string[]
  isFeatured?: boolean
  isTrending?: boolean
  tags?: string[]
  sku?: string
  slug?: string
  isActive?: boolean
  outOfStock?: boolean
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
}

export interface Address {
  id?: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  date: string
}

export interface Category {
  id: string
  name: string
  image: string
  productCount: number
  slug?: string
}