import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // TODO: Replace with your actual forgot password logic
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Failed to send reset link' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'An error occurred while sending the reset link' },
      { status: 500 }
    )
  }
} 