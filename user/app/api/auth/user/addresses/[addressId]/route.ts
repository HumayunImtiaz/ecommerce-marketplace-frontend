import { NextRequest, NextResponse } from 'next/server'
import { getUserTokenCookie } from '@/lib/cookies'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function PUT(
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

    const body = await request.json()

    const response = await fetch(
      `${API_BASE_URL}/api/auth/user/addresses/${addressId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to update address:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      `${API_BASE_URL}/api/auth/user/addresses/${addressId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to delete address:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete address' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const addressId = params.addressId
    const pathArray = request.nextUrl.pathname.split('/')
    const isDefault = pathArray[pathArray.length - 1] === 'default'
    const token = await getUserTokenCookie()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const endpoint = isDefault
      ? `${API_BASE_URL}/api/auth/user/addresses/${addressId}/default`
      : `${API_BASE_URL}/api/auth/user/addresses/${addressId}`

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to update address:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update address' },
      { status: 500 }
    )
  }
}
