import type { Product, Category, ProductVariant } from "./types"
import { getImageUrl } from "./utils"

// ─── Backend Product → Frontend Product ──────────────────────────────────────
export const mapProduct = (p: any): Product | null => {
  if (!p) return null

  // Colors aur sizes variants se nikaalo (unique)
  const colors: string[] = [
    ...new Set<string>(
      (p.variants ?? []).map((v: any) => v.color).filter(Boolean)
    ),
  ]
  const sizes: string[] = [
    ...new Set<string>(
      (p.variants ?? []).map((v: any) => v.size).filter(Boolean)
    ),
  ]

  return {
    id: p.id ?? p._id ?? "",
    name: p.name ?? "",
    description: p.description ?? "",
    price: p.price ?? 0,
    originalPrice: p.comparePrice ?? undefined,
    image: getImageUrl(p.images?.[0]),
    images: p.images?.length > 0 
      ? p.images.map((img: string) => getImageUrl(img)) 
      : ["/placeholder.svg"],
    category: p.category?.name ?? p.category ?? "",
    categoryId: p.category?._id ?? p.category?.id ?? p.categoryId ?? "",
    rating: p.avgRating ?? p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    inStock: p.inStock ?? (p.totalStock ?? 0) > 0,
    totalStock: p.totalStock ?? 0,
    outOfStock: p.outOfStock ?? (p.totalStock ?? 0) <= 0,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    variants: (p.variants ?? []).map((v: any): ProductVariant => ({
      id: v.id ?? v._id ?? "",
      color: v.color ?? "",
      size: v.size ?? "",
      price: v.price ?? null,
      stock: v.stock ?? null,
    })),
    tags: p.tags ?? [],
    features: p.features ?? [],
    sku: p.sku ?? "",
    slug: p.slug ?? "",
    isActive: p.isActive ?? true,
    isFeatured: p.isFeatured ?? false,
    isTrending: p.isTrending ?? false,
  }
}

// ─── Backend Category → Frontend Category ────────────────────────────────────
export const mapCategory = (c: any): Category | null => {
  if (!c) return null
  
  return {
    id: c.id ?? c._id ?? "",
    name: c.name ?? "",
    slug: c.slug ?? "",
    image: getImageUrl(c.image),
    productCount: c.productCount ?? 0,
  }
}