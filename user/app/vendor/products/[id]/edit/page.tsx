import ProductForm from "@/components/vendor/ProductForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      category: true,
      variants: {
        include: { stock: true }
      }
    }
  })
  if (!product) return null
  
  // Map variants to the format ProductForm expects
  const mappedProduct = {
    ...product,
    variants: product.variants.map(v => ({
      color: v.color,
      size: v.size,
      quantity: v.stock?.quantity || 0
    }))
  }

  return JSON.parse(JSON.stringify(mappedProduct))
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound()
  }

  return <ProductForm initialData={product} isEditing />
}
