export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
  colors?: string[]
  sizes?: string[]
  features?: string[]
  isFeatured?: boolean
  isTrending?: boolean
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
  avatar?: string
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
}
