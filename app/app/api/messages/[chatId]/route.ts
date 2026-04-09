import { NextResponse } from "next/server";
import { getTokenCookie } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/messages/${params.chatId}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
