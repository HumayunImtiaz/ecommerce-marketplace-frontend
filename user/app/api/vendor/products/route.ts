import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withVendorAuth, CreateProductSchema } from "@/lib/vendorAuth"

// ─── GET: List Vendor Products ───────────────────────────────────────────────
export const GET = withVendorAuth(async (req, { vendorId }) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId },
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count({ where: { vendorId } })
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 })
  }
})

// ─── POST: Create New Product ────────────────────────────────────────────────
export const POST = withVendorAuth(async (req, { vendorId }) => {
  try {
    const body = await req.json()
    
    // Validate schema
    const validated = CreateProductSchema.parse(body)

    // Create product - vendorId is injected from session, not body
    const { category, variants, ...rest } = validated
    
    const product = await prisma.product.create({
      data: {
        ...rest,
        categoryId: category,
        vendorId,
        sku: `VC-${vendorId.slice(0,4)}-${Date.now().toString().slice(-6)}`,
        slug: rest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(7),
        variants: variants ? {
          create: variants.map(v => ({
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

    return NextResponse.json({ success: true, data: product, message: "Product created successfully" })
  } catch (error: any) {
    console.error("Product Create Error:", error)
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 })
  }
})
