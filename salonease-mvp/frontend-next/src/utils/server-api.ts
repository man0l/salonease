import { cookies } from 'next/headers'
import { headers } from 'next/headers'

interface FetchOptions extends RequestInit {
  token?: string
}

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

  const headersList = headers()
  const forwardedHeaders = {
    'x-forwarded-for': headersList.get('x-forwarded-for'),
    'user-agent': headersList.get('user-agent'),
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...forwardedHeaders,
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
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