import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    // TODO: Replace with your actual email verification logic
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Email verification failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email verification successful!',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'An error occurred during email verification' },
      { status: 500 }
    )
  }
} 