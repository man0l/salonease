'use client'

import { cookies } from 'next/headers'

interface FetchOptions extends RequestInit {
  token?: string
}

// Client-side fetch with auth
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // This will send cookies
    headers,
  })

  // Handle token expiration
  if (response.status === 401) {
    try {
      // Try to refresh the token
      const refreshResponse = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Token has been refreshed, cookies are automatically updated
        // Retry the original request
        return fetchWithAuth(endpoint, options)
      }
    } catch (error) {
      console.error('Token refresh error:', error)
    }

    throw new Error('Authentication token expired')
  }

  return response
}

// Server-side fetch with auth
export async function fetchWithAuthServer(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    throw new Error('No authentication token found')
  }

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001'
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    const refreshToken = cookieStore.get('refreshToken')?.value
    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    try {
      const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (refreshResponse.ok) {
        const { token: newToken } = await refreshResponse.json()
        return fetchWithAuthServer(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        })
      }
    } catch (error) {
      console.error('Token refresh error:', error)
    }

    throw new Error('Authentication token expired')
  }

  return response
} 