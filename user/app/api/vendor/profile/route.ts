import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withVendorAuth } from "@/lib/vendorAuth"

// ─── GET: Get Vendor Profile ────────────────────────────────────────────────
export const GET = withVendorAuth(async (req, { vendorId }) => {
  try {
    const profile = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: { select: { email: true, fullName: true } } }
    })
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch profile" }, { status: 500 })
  }
})

// ─── PATCH: Update Vendor Profile ───────────────────────────────────────────
export const PATCH = withVendorAuth(async (req, { vendorId }) => {
  try {
    const body = await req.json()
    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        businessName: body.businessName,
        description: body.description,
        logo: body.logo,
        bankDetails: body.bankDetails,
      }
    })
    return NextResponse.json({ success: true, data: updated, message: "Profile updated" })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
})
