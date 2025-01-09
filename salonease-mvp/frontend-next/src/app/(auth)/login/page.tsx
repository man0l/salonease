'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const pendingSetupIntent = sessionStorage.getItem('pendingSetupIntent')
    if (pendingSetupIntent) {
      const { returnUrl } = JSON.parse(pendingSetupIntent)
      sessionStorage.removeItem('pendingSetupIntent')
      router.push(returnUrl)
    }
  }, [router])

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement login logic with your auth service
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Login successful')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Invalid email or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                {...register("email", { required: true })}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-muted bg-muted placeholder-muted-foreground text-foreground rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">Email is required</p>
              )}
            </div>

            <div>
              <input
                {...register("password", { required: true })}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-muted bg-muted placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">Password is required</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <Link 
                href="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Forgot your password?
              </Link>
              <Link 
                href="/register"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 