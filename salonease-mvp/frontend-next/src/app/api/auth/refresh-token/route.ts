import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token found' },
        { status: 401 }
      )
    }

    // TODO: Replace with your actual token refresh logic
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Failed to refresh token' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const { token: newToken, refreshToken: newRefreshToken } = data

    // Create response with new tokens
    const nextResponse = NextResponse.json({ success: true })

    // Set new cookies
    nextResponse.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    if (newRefreshToken) {
      nextResponse.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { message: 'An error occurred while refreshing the token' },
      { status: 500 }
    )
  }
} 