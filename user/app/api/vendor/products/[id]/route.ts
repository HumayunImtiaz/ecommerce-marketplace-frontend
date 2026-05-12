import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withVendorAuth, UpdateProductSchema, assertVendorOwnsProduct } from "@/lib/vendorAuth"

// ─── PATCH: Update Product ──────────────────────────────────────────────────
export const PATCH = withVendorAuth(async (req, { params, vendorId }) => {
  try {
    const productId = params.id
    
    // Security check
    await assertVendorOwnsProduct(productId, vendorId)

    const body = await req.json()
    const validated = UpdateProductSchema.parse(body)

    const { category, variants, ...rest } = validated as any

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...rest,
        categoryId: category,
        variants: variants ? {
          deleteMany: {},
          create: variants.map((v: any) => ({
            color: v.color,
            size: v.size,
            stock: {
              create: {
                quantity: v.quantity,
                status: v.quantity > 0 ? "in_stock" : "out_of_stock"
              }
            }
          }))
        } : undefined
      }
    })

    return NextResponse.json({ success: true, data: updatedProduct, message: "Product updated" })
  } catch (error: any) {
    console.error("Product Update Error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
})

// ─── DELETE: Delete Product ──────────────────────────────────────────────────
export const DELETE = withVendorAuth(async (req, { params, vendorId }) => {
  try {
    const productId = params.id
    
    // Security check
    await assertVendorOwnsProduct(productId, vendorId)

    await prisma.product.update({
      where: { id: productId },
      data: { isDeleted: true, isActive: false }
    })

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
})
