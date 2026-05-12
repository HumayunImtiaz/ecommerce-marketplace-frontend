import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withVendorAuth, UpdateOrderStatusSchema, assertVendorOwnsOrder } from "@/lib/vendorAuth"

export const PATCH = withVendorAuth(async (req, { params, vendorId }) => {
  try {
    const orderId = params.id
    
    // Ensure vendor is authorized to view/update this order
    await assertVendorOwnsOrder(orderId, vendorId)

    const body = await req.json()
    const { status } = UpdateOrderStatusSchema.parse(body)

    // In a multi-vendor setup, typically status is per-item or overall.
    // Here we update the global order status (simplified).
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return NextResponse.json({ success: true, data: updatedOrder, message: "Order status updated" })
  } catch (error: any) {
    const status = (error as any).statusCode || 500
    return NextResponse.json({ success: false, message: error.message }, { status })
  }
})
