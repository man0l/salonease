'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

type VerificationStatus = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (token) {
        try {
          // TODO: Implement email verification logic with your auth service
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })

          if (response.ok) {
            setMessage('Email verification successful!')
            setStatus('success')
            setTimeout(() => {
              router.push('/login')
            }, 3000)
          } else {
            const error = await response.json()
            setMessage(error.message || 'Email verification failed')
            setStatus('error')
          }
        } catch (error) {
          setMessage('An error occurred during email verification')
          setStatus('error')
        }
      } else {
        setMessage('Invalid verification link')
        setStatus('error')
      }
    }

    verifyEmail()
  }, [router, searchParams])

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">Verifying your email</h2>
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold">{message}</h2>
            <p className="mt-2">Redirecting to login page...</p>
          </>
        )
      case 'error':
        return (
          <>
            <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">{message}</h2>
            <button
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto mt-8 max-w-md">
      <div className="bg-card shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Email Verification</h1>
        <div className="flex flex-col items-center">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 