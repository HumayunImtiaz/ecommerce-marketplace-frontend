import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma" // Assuming you move/have prisma client here for Next.js
import { getUserTokenCookie, getUserRoleCookie, getUserIdCookie } from "@/lib/cookies"

// ─── Zod Validation Schemas ──────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().optional(),
  category: z.string(), // This is actually categoryId from the form
  totalStock: z.number().int().nonnegative(),
  images: z.array(z.string()).min(1),
  variants: z.array(z.object({
    color: z.string().min(1),
    size: z.string().min(1),
    quantity: z.number().int().nonnegative()
  })).optional()
})

export const UpdateProductSchema = CreateProductSchema.partial()

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
})

// ─── Security Layer (HOF) ───────────────────────────────────────────────────

export type VendorHandler = (
  req: NextRequest,
  context: { params: any; vendorId: string; userId: string }
) => Promise<NextResponse>

export function withVendorAuth(handler: VendorHandler) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      const token = await getUserTokenCookie()
      const role = await getUserRoleCookie()
      const userId = await getUserIdCookie()

      if (!token || !userId || role !== "vendor") {
        return NextResponse.json({ success: false, message: "Unauthorized: Vendor role required" }, { status: 401 })
      }

      // Verify vendor status in DB
      const vendor = await prisma.vendor.findUnique({
        where: { userId: userId },
        select: { id: true, status: true }
      })

      if (!vendor || vendor.status !== "APPROVED") {
        return NextResponse.json({ success: false, message: "Forbidden: Vendor not approved" }, { status: 403 })
      }

      // Inject vendorId and userId into handler
      return await handler(req, { params, vendorId: vendor.id, userId })
    } catch (error) {
      console.error("Vendor Auth Error:", error)
      return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
    }
  }
}

// ─── Ownership Asserts ─────────────────────────────────────────────────────

export async function assertVendorOwnsProduct(productId: string, vendorId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { vendorId: true }
  })
  if (!product || product.vendorId !== vendorId) {
    throw new Error("Forbidden: Ownership mismatch")
  }
}

export async function assertVendorOwnsOrder(orderId: string, vendorId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: {
        some: { product: { vendorId: vendorId } }
      }
    }
  })
  if (!order) throw new Error("Forbidden: Order access denied")
}
