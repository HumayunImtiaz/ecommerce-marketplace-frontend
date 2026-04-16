import { NextRequest, NextResponse } from 'next/server'
import { getUserTokenCookie } from '@/lib/cookies'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const addressId = params.addressId
    const token = await getUserTokenCookie()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${API_BASE_URL}/api/auth/user/addresses/${addressId}/default`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to set default address:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to set default address' },
      { status: 500 }
    )
  }
}
