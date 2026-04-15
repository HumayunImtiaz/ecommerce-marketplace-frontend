import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: Request) {
  try {
    const { getUserTokenCookie } = await import("@/lib/cookies");
    const token = await getUserTokenCookie();

    if (!token) {
      return NextResponse.json({ success: false, message: "Please login to validate coupon" }, { status: 401 });
    }

    const body = await req.json();
    const response = await fetch(`${API_BASE_URL}/api/orders/coupons/validate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 500 });
  }
}
