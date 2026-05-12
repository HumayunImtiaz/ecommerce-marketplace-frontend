import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withVendorAuth } from "@/lib/vendorAuth"

export const GET = withVendorAuth(async (req, { vendorId }) => {
  try {
    // 1. Total Earnings & Commission
    const earnings = await prisma.vendorEarning.aggregate({
      where: { vendorId },
      _sum: {
        grossAmount: true,
        commissionAmount: true,
        netAmount: true
      }
    })

    // 2. Pending Earnings
    const pendingEarnings = await prisma.vendorEarning.aggregate({
      where: { vendorId, status: "PENDING" },
      _sum: { netAmount: true }
    })

    // 3. Total Orders
    const totalOrders = await prisma.order.count({
      where: {
        items: {
          some: { product: { vendorId } }
        }
      }
    })

    // 4. Top 5 Products (by revenue in VendorEarning)
    // Simplified: group by product from VendorEarning if relation exists, 
    // or just calculate from OrderItems.
    const topProducts = await prisma.product.findMany({
      where: { vendorId },
      include: {
        _count: {
          select: { OrderItem: true }
        }
      },
      take: 5,
      orderBy: {
        OrderItem: { _count: "desc" }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: earnings._sum.grossAmount || 0,
        totalOrders,
        commissionPaid: earnings._sum.commissionAmount || 0,
        netEarnings: earnings._sum.netAmount || 0,
        pendingEarnings: pendingEarnings._sum.netAmount || 0,
        topProducts
      }
    })
  } catch (error) {
    console.error("Analytics Error:", error)
    return NextResponse.json({ success: false, message: "Failed to generate analytics" }, { status: 500 })
  }
})
